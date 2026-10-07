export function normalizeDLP(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\-_.,;:!?()[\]{}]/g, "")
    .replace(/[@]/g, "a")
    .replace(/[0o]/g, "o")
    .replace(/[1il!]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[4]/g, "a")
    .replace(/[5]/g, "s");
}

export const FORBIDDEN_WORDS = [
  "whatsapp",
  "whatsap",
  "watsapp",
  "viber",
  "telegram",
  "telegramme",
  "instagram",
  "insta",
  "facebook",
  "fb",
  "messenger",
  "tiktok",
  "snapchat",
  "appele",
  "appelle",
  "contactemoi",
  "monnumero",
];

export const maskSensitiveData = (text: string): string => {
  if (!text) return "";

  let masked = text;
  // Phone numbers (05, 06, 07, 02, 03, 04, 09 or +213/00213)
  const phoneRegex = /(0[5672349][0-9]{8}|(\+213|00213)[5672349][0-9]{8})/g;
  // URLs
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
  // Forbidden social keywords
  const socialRegex = /(whatsapp|whatsap|watsapp|viber|telegram|instagram|insta|facebook|fb|messenger|tiktok|snapchat)/gi;
  // Emails
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;

  masked = masked.replace(phoneRegex, "[NUMÉRO MASQUÉ]");
  masked = masked.replace(urlRegex, "[LIEN INTERDIT]");
  masked = masked.replace(socialRegex, "[CONTACT DÉTECTÉ]");
  masked = masked.replace(emailRegex, "[EMAIL MASQUÉ]");

  return masked;
};

export const hasExternalChannel = (text: string): boolean => {
  if (!text) return false;

  // 1. Direct Regex checks
  const phonePattern = /(?:0|\+?213|00213)[567]\d{8}/;
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const urlPattern = /https?:\/\/[^\s]+|www\.[^\s]+/;

  if (phonePattern.test(text) || emailPattern.test(text) || urlPattern.test(text)) {
    return true;
  }

  // 2. Normalized obfuscation checks (e.g. w.h.a.t.s.a.p.p, wh@tsapp)
  const normalized = normalizeDLP(text);
  for (const word of FORBIDDEN_WORDS) {
    if (normalized.includes(word)) {
      return true;
    }
  }

  return false;
};
