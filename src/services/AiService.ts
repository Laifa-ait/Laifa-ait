import { ai, DEFAULT_GEMINI_MODEL } from "../config/gemini";
import { validateExternalUrl } from "../utils/security";
import { safeLogger } from "../utils/logger";
import { resilientFetch } from "../utils/resilientFetch";
import { LocaleStorageService } from "./LocaleStorageService";

export class AiService {
  private static parseJsonSafely<T = Record<string, unknown>>(rawText: string, fallback: T): T {
    if (!rawText) return fallback;
    try {
      // Clean markdown code blocks if present
      const cleaned = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      const strToParse = jsonMatch ? jsonMatch[0] : cleaned;
      return JSON.parse(strToParse) as T;
    } catch (err: unknown) {
      safeLogger.error("[AiService] JSON parse failed, returning fallback", { err: err instanceof Error ? err.message : String(err) });
      return fallback;
    }
  }

  static async translateText(text: string, targetLangs: string[]) {
    const result: Record<string, string> = { fr: text };
    const langsToTranslate = targetLangs.filter((l: string) => l !== "fr");

    if (langsToTranslate.length > 0) {
      try {
        const response = await ai.models.generateContent({
          model: DEFAULT_GEMINI_MODEL,
          contents: `Translate the following text from French to the following languages: ${langsToTranslate.join(", ")}. Return ONLY a pure JSON object. Format strictly as: { "langCode": "translated text", ... }\n\nText: "${text}"`,
          config: { responseMimeType: "application/json" }
        });
        const resultText = response.text || "{}";
        const parsed = AiService.parseJsonSafely<Record<string, string>>(resultText, {});
        langsToTranslate.forEach((lang: string) => {
          result[lang] = parsed[lang] || `${text} (${lang})`;
        });
      } catch (err: unknown) {
        safeLogger.error("[AiService.translateText] Error", { err: err instanceof Error ? err.message : String(err) });
        langsToTranslate.forEach((lang: string) => {
          result[lang] = `${text} (${lang})`;
        });
      }
    }
    return result;
  }

  static async translateSingleKey(frText: string) {
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: `Translate the following text from French to Arabic and English. Return ONLY a pure JSON object. Format strictly as: { "ar": "...", "en": "..." }\n\nText: "${frText}"`,
        config: { responseMimeType: "application/json" }
      });
      const resultText = response.text || "{}";
      const parsed = AiService.parseJsonSafely<Record<string, string>>(resultText, {});
      return {
        ar: parsed.ar || `${frText} (AR)`,
        en: parsed.en || `${frText} (EN)`,
      };
    } catch (err: unknown) {
      safeLogger.error("[AiService.translateSingleKey] Error", { err: err instanceof Error ? err.message : String(err) });
      return {
        ar: `${frText} (AR)`,
        en: `${frText} (EN)`,
      };
    }
  }

  static async dualWrite(lang: string, content: Record<string, string>, adminUid?: string) {
    const allowedLocales = ["fr", "en", "ar"];
    if (!allowedLocales.includes(lang)) {
      safeLogger.error("Invalid locale in dualWrite", { lang });
      return;
    }
    await LocaleStorageService.saveBatchTranslations(lang, content, adminUid);
  }

  static async fixFictiveTranslations(adminUid?: string) {
    const frContent = await LocaleStorageService.getMergedLocale("fr");
    if (Object.keys(frContent).length === 0) throw new Error("Fichier source Français introuvable ou corrompu");

    const arContent = await LocaleStorageService.getMergedLocale("ar");
    const enContent = await LocaleStorageService.getMergedLocale("en");

    const keysToCorrect = new Set<string>();
    Object.keys(frContent).forEach((key) => {
      const arVal = arContent[key];
      const enVal = enContent[key];
      const isFictiveAr = typeof arVal === "string" && (arVal.endsWith(" (AR)") || arVal.endsWith("(AR)"));
      const isFictiveEn = typeof enVal === "string" && (enVal.endsWith(" (EN)") || enVal.endsWith("(EN)"));
      if (isFictiveAr || isFictiveEn) {
        keysToCorrect.add(key);
      }
    });

    const keysList = Array.from(keysToCorrect);
    if (keysList.length === 0) return 0;

    const BATCH_SIZE = 30;
    let correctedCount = 0;

    for (let i = 0; i < keysList.length; i += BATCH_SIZE) {
      const batchKeys = keysList.slice(i, i + BATCH_SIZE);
      try {
        const objToTranslate: Record<string, string> = {};
        batchKeys.forEach((k) => {
          if (frContent[k]) objToTranslate[k] = frContent[k];
        });

        if (Object.keys(objToTranslate).length > 0) {
          const response = await ai.models.generateContent({
            model: DEFAULT_GEMINI_MODEL,
            contents: `Translate the following JSON object values from French to Arabic and English. Return ONLY a pure JSON object mapping the same keys to an object with "ar" and "en" properties. JSON format: { "key1": {"ar": "...", "en": "..."}, "key2": ... }.\n\n${JSON.stringify(objToTranslate)}`,
            config: { responseMimeType: "application/json" }
          });
          const resultText = response.text || "{}";
          const parsed = AiService.parseJsonSafely<Record<string, { ar?: string; en?: string }>>(resultText, {});

          batchKeys.forEach((key) => {
            if (parsed[key]) {
              arContent[key] = parsed[key].ar || `${frContent[key]} (AR)`;
              enContent[key] = parsed[key].en || `${frContent[key]} (EN)`;
            }
          });
        }
        correctedCount += batchKeys.length;
        if (i + BATCH_SIZE < keysList.length) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (batchErr: unknown) {
        safeLogger.error("Fictive translation batch error", { err: batchErr instanceof Error ? batchErr.message : String(batchErr) });
      }
    }

    await LocaleStorageService.saveBatchTranslations("ar", arContent, adminUid);
    await LocaleStorageService.saveBatchTranslations("en", enContent, adminUid);

    return correctedCount;
  }

  static async analyzeSellerImage(imageUrl: string) {
    // SSRF URL Validation
    const validatedUrl = validateExternalUrl(imageUrl);

    const responseImage = await resilientFetch(validatedUrl.toString(), { redirect: "error" }, {
      timeoutMs: 8000,
      totalDeadlineMs: 15000,
      maxRetries: 2,
      operationName: "analyzeSellerImage.fetchImage"
    });

    if (!responseImage.ok) {
      throw new Error("Impossible de télécharger l'image distante");
    }
    const buffer = await responseImage.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString("base64");
    const mimeType = responseImage.headers.get("content-type") || "image/jpeg";
    const prompt = `Perform OCR on this image. Check if you can find any text that resembles:
    1. A phone number (e.g. starting with 05, 06, 07, 02, 03, 04, 09 and having 10 digits).
    2. Mentions of "WhatsApp", "Viber", "Telegram", "Instagram" to contact directly.
    Output ONLY a JSON with this format:
    {
      "safe": true_if_no_contact_info_found_else_false,
      "reason": "If unsafe, explain what was found (number, word, etc), else empty string"
    }`;

    const result = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: [
        { role: "user", parts: [{ inlineData: { data: base64Data, mimeType } }, { text: prompt }] }
      ],
      config: { responseMimeType: "application/json" }
    });
    
    const responseText = result.text || "{}";
    return AiService.parseJsonSafely(responseText, { safe: true, reason: "" });
  }
}
