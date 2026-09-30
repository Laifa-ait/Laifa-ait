export interface DlpFilterResult {
  secureText: string;
  violationDetected: boolean;
}

const PHONE_REGEX = /(0[5672349][0-9]{8}|(\+213|00213)[5672349][0-9]{8})/g;
const SOCIAL_REGEX = /(whatsapp|viber|telegram|insta|fb|facebook|appel[e]?)/gi;
const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

export const filterChatDlp = (text: string): DlpFilterResult => {
  if (!text) {
    return { secureText: "", violationDetected: false };
  }

  let secureText = text;
  let violationDetected = false;

  if (PHONE_REGEX.test(secureText) || SOCIAL_REGEX.test(secureText) || URL_REGEX.test(secureText)) {
    violationDetected = true;
    secureText = secureText.replace(PHONE_REGEX, "[NUMÉRO MASQUÉ]");
    secureText = secureText.replace(SOCIAL_REGEX, "[MOT INTERDIT]");
    secureText = secureText.replace(URL_REGEX, "[LIEN INTERDIT]");
  }

  return { secureText, violationDetected };
};
