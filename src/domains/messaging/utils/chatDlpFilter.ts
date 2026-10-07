export interface DlpFilterResult {
  secureText: string;
  violationDetected: boolean;
}

export const filterChatDlp = (text: string): DlpFilterResult => {
  if (!text) {
    return { secureText: "", violationDetected: false };
  }

  const phonePattern = /(0[5672349][0-9]{8}|(\+213|00213)[5672349][0-9]{8})/gi;
  const socialPattern = /\b(whatsapp|viber|telegram|insta|instagram|fb|facebook|tiktok)\b/gi;
  const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;

  let secureText = text;
  let violationDetected = false;

  if (phonePattern.test(secureText)) {
    violationDetected = true;
    secureText = secureText.replace(/(0[5672349][0-9]{8}|(\+213|00213)[5672349][0-9]{8})/gi, "[NUMÉRO MASQUÉ]");
  }
  if (socialPattern.test(secureText)) {
    violationDetected = true;
    secureText = secureText.replace(/\b(whatsapp|viber|telegram|insta|instagram|fb|facebook|tiktok)\b/gi, "[CANAL EXTERNE INTERDIT]");
  }
  if (urlPattern.test(secureText)) {
    violationDetected = true;
    secureText = secureText.replace(/(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi, "[LIEN INTERDIT]");
  }
  if (emailPattern.test(secureText)) {
    violationDetected = true;
    secureText = secureText.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi, "[EMAIL MASQUÉ]");
  }

  return { secureText, violationDetected };
};
