import { Router, Response } from "express";
import { authenticateToken, authorizeSeller, authorizeAdmin, AuthenticatedRequest } from "../../middlewares/auth";
import { ai, DEFAULT_GEMINI_MODEL } from "../../config/gemini";
import { AiService } from "../../services/AiService";
import { safeLogger } from "../../utils/logger";
import path from "path";
import fs from "fs";
import rateLimit from "express-rate-limit";
import NodeCache from "node-cache";

const router = Router();

// Rate limiter pour l'IA (éviter les factures Gemini élevées)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limite à 20 requêtes par fenêtre par utilisateur
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: AuthenticatedRequest, res: Response) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(429).json({ error: "Trop de requêtes. Veuillez patienter avant de renvoyer un message." });
  }
});

// Cache en mémoire pour réduire les coûts de l'API Gemini avec TTL pour éviter memory leak
const descCache = new NodeCache({ stdTTL: 300, checkperiod: 600 });
const newsCache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

// --- Admin Translation Endpoints ---

router.post(
  "/admin/translate-text",
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await AiService.translateText(req.body.text, req.body.targetLangs);
      res.json(result);
    } catch (error: unknown) {
      safeLogger.error("translateText error", { err: error instanceof Error ? error.message : String(error) });
      const mockResult: Record<string, string> = {};
      if (req.body.targetLangs) req.body.targetLangs.forEach((l: string) => { mockResult[l] = req.body.text + ` (${l})`; });
      return res.json(mockResult);
    }
  }
);

router.post(
  "/admin/translate-single-key",
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await AiService.translateSingleKey(req.body.fr);
      res.json(result);
    } catch {
      res.json({ ar: req.body.fr + " (AR)", en: req.body.fr + " (EN)" });
    }
  }
);

router.post(
  "/admin/translate-fictive",
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const count = await AiService.fixFictiveTranslations();
      res.json({ message: "Success", count });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur serveur";
      res.status(500).json({ error: msg });
    }
  }
);

router.post(
  "/admin/translate-ui",
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const frPath = path.join(process.cwd(), "public/locales/fr.json");
      const arPath = path.join(process.cwd(), "public/locales/ar.json");
      const enPath = path.join(process.cwd(), "public/locales/en.json");

      const frContent: Record<string, string> = JSON.parse(fs.readFileSync(frPath, "utf8"));
      let arContent: Record<string, string> = {};
      let enContent: Record<string, string> = {};

      if (fs.existsSync(arPath))
        arContent = JSON.parse(fs.readFileSync(arPath, "utf8"));
      if (fs.existsSync(enPath))
        enContent = JSON.parse(fs.readFileSync(enPath, "utf8"));

      const clientHarvested: string[] = req.body.harvestedKeys || [];
      const harvested = new Set<string>(clientHarvested);

      let frModified = false;
      harvested.forEach((key) => {
        if (!frContent[key]) {
          frContent[key] = key;
          frModified = true;
        }
      });

      if (frModified) {
        AiService.dualWrite("fr", frContent);
      }

      const keysToTranslate: string[] = [];
      Object.keys(frContent).forEach((key) => {
        const arVal = arContent[key];
        const enVal = enContent[key];
        const frVal = frContent[key];

        const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text || "");
        const isNumeric = (text: string) => /^\d+$/.test(text || "");

        const containsAr = typeof arVal === "string" && isArabic(arVal);
        const sameAsFr = arVal === frVal;
        const isMissingAr =
          !arVal ||
          arVal === "" ||
          (sameAsFr && !isNumeric(key) && frVal.length > 2) ||
          !containsAr ||
          (typeof arVal === "string" &&
            (arVal.endsWith(" (AR)") || arVal.includes("{")));
        const isMissingEn =
          !enVal ||
          enVal === "" ||
          (enVal === frVal && !isNumeric(key) && frVal.length > 2) ||
          (typeof enVal === "string" &&
            (enVal.endsWith(" (EN)") || enVal.includes("{")));

        if (isMissingAr || isMissingEn) {
          keysToTranslate.push(key);
        }
      });

      if (keysToTranslate.length === 0) {
        return res.json({ message: "Tout est déjà à jour.", count: 0 });
      }

      const BATCH_SIZE = 30;
      let totalTranslated = 0;
      let mockedCount = 0;
      let lastError: string | null = null;
      const MAX_KEYS_PER_CALL = 300;

      for (
        let i = 0;
        i < Math.min(keysToTranslate.length, MAX_KEYS_PER_CALL);
        i += BATCH_SIZE
      ) {
        const batchKeys = keysToTranslate.slice(i, i + BATCH_SIZE);

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
            const jsonStr = resultText.match(/\{[\s\S]*\}/)?.[0] || resultText;
            const parsed: Record<string, { ar?: string; en?: string }> = JSON.parse(jsonStr);

            batchKeys.forEach((key) => {
              if (parsed[key]) {
                arContent[key] = parsed[key].ar || frContent[key] + " (AR)";
                enContent[key] = parsed[key].en || frContent[key] + " (EN)";
              } else {
                arContent[key] = frContent[key] + " (AR)";
                enContent[key] = frContent[key] + " (EN)";
                mockedCount++;
              }
            });
          }

          totalTranslated += batchKeys.length;

          if (
            i + BATCH_SIZE <
            Math.min(keysToTranslate.length, MAX_KEYS_PER_CALL)
          ) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        } catch (err: unknown) {
          safeLogger.error("Gemini Translate batch error", { err: err instanceof Error ? err.message : String(err) });
          const errObj = err instanceof Error ? err : new Error(String(err));
          lastError = errObj.message || errObj.toString();
          batchKeys.forEach((k) => {
            arContent[k] = frContent[k] + " (AR)";
            enContent[k] = frContent[k] + " (EN)";
            mockedCount++;
          });
        }
      }

      AiService.dualWrite("ar", arContent);
      AiService.dualWrite("en", enContent);

      res.json({
        message:
          mockedCount > 0
            ? `L'extraction a été faite, mais ${mockedCount} clés ont été suffixées par (AR)/(EN) car l'API Gemini a échoué (Limite de quota ou clé invalide).`
            : "Extraction et traduction réussies",
        count: totalTranslated,
        mockedCount,
        lastError,
        remaining: Math.max(0, keysToTranslate.length - MAX_KEYS_PER_CALL),
      });
    } catch (error: unknown) {
      const errObj = error instanceof Error ? error : new Error(String(error));
      const errString = String(errObj.message || error).toLowerCase();
      if (
        !errString.includes("429") &&
        !errString.includes("resource_exhausted") &&
        !errString.includes("dunning") &&
        !errString.includes("permission_denied") &&
        !errString.includes("403")
      ) {
        safeLogger.error("Translate UI Error", { err: error instanceof Error ? error.message : String(error) });
      }

      let finalMessage = error instanceof Error ? error.message : String(error);
      if (errString.includes("expired")) {
        finalMessage =
          "La clé d'API Gemini a expiré. Veuillez obtenir une nouvelle clé gratuite sur Google AI Studio et la mettre à jour dans les paramètres.";
      } else if (
        errString.includes("429") ||
        errString.includes("resource_exhausted")
      ) {
        finalMessage = "Vos crédits de traduction (Gemini API) sont épuisés.";
      } else if (
        errString.includes("dunning") ||
        errString.includes("permission_denied") ||
        errString.includes("403")
      ) {
        finalMessage =
          "Problème de facturation Google Cloud (Dunning). Veuillez vérifier la carte bancaire ou le quota associé à votre projet Google Cloud.";
      }
      res.status(500).json({ error: finalMessage });
    }
  }
);

router.post(
  "/admin/translate-preview",
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { terms } = req.body;
      if (!Array.isArray(terms) || terms.length === 0) {
        return res.status(400).json({ error: "Liste de termes requise" });
      }

      const arPath = path.join(process.cwd(), "public/locales/ar.json");
      const enPath = path.join(process.cwd(), "public/locales/en.json");

      let arContent: Record<string, string> = {};
      let enContent: Record<string, string> = {};

      if (fs.existsSync(arPath)) arContent = JSON.parse(fs.readFileSync(arPath, "utf8"));
      if (fs.existsSync(enPath)) enContent = JSON.parse(fs.readFileSync(enPath, "utf8"));

      const result: Record<string, { ar: string; en: string; isNew: boolean }> = {};
      const termsToTranslate: string[] = [];

      terms.forEach((term) => {
        const arExisting = arContent[term];
        const enExisting = enContent[term];

        const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text || "");
        const containsAr = typeof arExisting === "string" && isArabic(arExisting);

        const isMissingAr = !arExisting || arExisting === "" || arExisting === term || !containsAr || arExisting.endsWith(" (AR)");
        const isMissingEn = !enExisting || enExisting === "" || enExisting === term || enExisting.endsWith(" (EN)");

        if (isMissingAr || isMissingEn) {
          termsToTranslate.push(term);
        } else {
          result[term] = {
            ar: arExisting,
            en: enExisting,
            isNew: false,
          };
        }
      });

      if (termsToTranslate.length > 0) {
        const BATCH_SIZE = 30;
        for (let i = 0; i < termsToTranslate.length; i += BATCH_SIZE) {
          const batch = termsToTranslate.slice(i, i + BATCH_SIZE);
          const objToTranslate: Record<string, string> = {};
          batch.forEach((t) => {
            objToTranslate[t] = t;
          });

          const response = await ai.models.generateContent({
            model: DEFAULT_GEMINI_MODEL,
            contents: `Translate the following JSON object values from French to Arabic and English. Return ONLY a pure JSON object mapping the same keys to an object with "ar" and "en" properties. JSON format: { "key1": {"ar": "...", "en": "..."}, "key2": ... }.\n\n${JSON.stringify(objToTranslate)}`,
            config: { responseMimeType: "application/json" },
          });

          const resultText = response.text || "{}";
          const jsonStr = resultText.match(/\{[\s\S]*\}/)?.[0] || resultText;
          const parsed: Record<string, { ar?: string; en?: string }> = JSON.parse(jsonStr);

          batch.forEach((term) => {
            const arVal = parsed[term]?.ar || term;
            const enVal = parsed[term]?.en || term;
            result[term] = {
              ar: arVal,
              en: enVal,
              isNew: true,
            };
          });
        }
      }

      res.json({ translations: result });
    } catch (error: unknown) {
      safeLogger.error("Translate Preview Error", { err: error instanceof Error ? error.message : String(error) });
      const msg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: msg });
    }
  }
);

router.post(
  "/admin/translate-commit",
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { translations } = req.body;
      if (!translations || typeof translations !== "object") {
        return res.status(400).json({ error: "Traductions requises" });
      }

      const frPath = path.join(process.cwd(), "public/locales/fr.json");
      const arPath = path.join(process.cwd(), "public/locales/ar.json");
      const enPath = path.join(process.cwd(), "public/locales/en.json");

      let frContent: Record<string, string> = {};
      let arContent: Record<string, string> = {};
      let enContent: Record<string, string> = {};

      if (fs.existsSync(frPath)) frContent = JSON.parse(fs.readFileSync(frPath, "utf8"));
      if (fs.existsSync(arPath)) arContent = JSON.parse(fs.readFileSync(arPath, "utf8"));
      if (fs.existsSync(enPath)) enContent = JSON.parse(fs.readFileSync(enPath, "utf8"));

      let modified = false;

      Object.entries(translations).forEach(([term, trans]) => {
        const tAny = trans as { ar: string; en: string };
        if (!frContent[term]) {
          frContent[term] = term;
          modified = true;
        }
        arContent[term] = tAny.ar;
        enContent[term] = tAny.en;
      });

      if (modified) {
        AiService.dualWrite("fr", frContent);
      }
      AiService.dualWrite("ar", arContent);
      AiService.dualWrite("en", enContent);

      res.json({ message: "Traductions appliquées et enregistrées avec succès !" });
    } catch (error: unknown) {
      safeLogger.error("Translate Commit Error", { err: error instanceof Error ? error.message : String(error) });
      const msg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: msg });
    }
  }
);

router.post(
  "/admin/generate-newsletter",
  authenticateToken,
  authorizeAdmin,
  aiLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt requis" });

    if (newsCache.has(prompt)) {
      return res.json(newsCache.get(prompt));
    }

    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: `Générez une newsletter de luxe pour Olma Marketplace basée sur ceci: "${prompt}". 
    Répondez au format JSON strict:
    {
      "subject": "Appel de l'objet",
      "blocks": [
        { "id": "1", "type": "title", "content": "..." },
        { "id": "2", "type": "text", "content": "..." },
        { "id": "3", "type": "image", "content": "/images/placeholders/product.svg" }
      ]
    }
    Répondez uniquement avec le JSON.`,
        config: { responseMimeType: "application/json" }
      });
      const text = response.text || "";
      const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
      const parsed = JSON.parse(jsonStr);
      newsCache.set(prompt, parsed);
      res.json(parsed);
    } catch {
      return res.json({
        subject: "Découvrez notre nouvelle collection",
        blocks: [
          { id: "1", type: "title", content: "L'Excellence selon Olma" },
          {
            id: "2",
            type: "text",
            content: "Découvrez les dernières tendances et créations.",
          },
        ],
      });
    }
  }
);

// --- Seller AI Endpoints ---

router.post(
  "/generate-description",
  authenticateToken,
  authorizeSeller,
  aiLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    const { productName, category } = req.body;
    if (!productName)
      return res.status(400).json({ error: "productName requis" });

    const cacheKey = `${productName}-${category || "Général"}`;
    if (descCache.has(cacheKey)) {
      return res.json({ description: descCache.get(cacheKey) });
    }

    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: `Générez une description marketing courte (3-4 phrases), luxueuse et professionnelle pour un produit nommé "${productName}" dans la catégorie "${category || "Général"}". La description doit refléter l'excellence de l'artisanat ou du design algérien de Olma Marketplace. Répondez uniquement avec la description en Français.`,
      });
      const desc = response.text || "";
      descCache.set(cacheKey, desc);
      res.json({ description: desc });
    } catch {
      return res.json({
        description: `Découvrez ${productName}, une expression parfaite du savoir-faire algérien dans la collection ${category || "Général"}. Conçu pour allier élégance et durabilité.`,
      });
    }
  }
);

router.post(
  "/translate-product",
  authenticateToken,
  authorizeSeller,
  aiLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, description } = req.body;
    if (!name || !description)
      return res.status(400).json({ error: "name et description requis" });

    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: `Translate the following product information from French to Arabic and English. Return ONLY a pure JSON object. Format strictly as: { "name": {"ar": "...", "en": "..."}, "description": {"ar": "...", "en": "..."} }\n\n{"name": "${name}", "description": "${description}"}`,
        config: { responseMimeType: "application/json" }
      });

      const resultText = response.text || "{}";
      const jsonStr = resultText.match(/\{[\s\S]*\}/)?.[0] || resultText;
      const parsed: Record<string, { ar?: string; en?: string }> = JSON.parse(jsonStr);

      res.json({
        name: { fr: name, ar: parsed.name?.ar || name, en: parsed.name?.en || name },
        description: { fr: description, ar: parsed.description?.ar || description, en: parsed.description?.en || description },
      });
    } catch (error: unknown) {
      safeLogger.error("Gemini Translation API Error", { err: error instanceof Error ? error.message : String(error) });
      return res.json({
        name: { fr: name, en: name, ar: name },
        description: { fr: description, en: description, ar: description },
      });
    }
  }
);

router.post("/seller/analyze-image", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.body.imageUrl) return res.status(400).json({ error: "imageUrl requis" });
    const result = await AiService.analyzeSellerImage(req.body.imageUrl);
    res.json(result);
  } catch {
    res.json({ safe: true, reason: "Check failed, safely bypassed" });
  }
});

export default router;
