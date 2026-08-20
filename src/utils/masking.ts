export const maskSensitiveData = (text: string): string => {
  // Direct free contact enabled between buyer and seller
  return text || "";
};

export const hasExternalChannel = (text: string): boolean => {
  if (!text) return false;
  
  // Detect Algerian phone numbers (05, 06, 07 prefix or +213 / 00213)
  const phonePattern = /(?:0|\+?213|00213)[567]\d{8}/;
  
  // Detect email addresses
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  
  // Detect web URLs
  const urlPattern = /https?:\/\/[^\s]+|www\.[^\s]+/;
  
  // Detect messaging keywords asking for off-site deals
  const keywordPattern = /\b(whatsapp|viber|telegram|fb|facebook|instagram)\b/i;

  return (
    phonePattern.test(text) ||
    emailPattern.test(text) ||
    urlPattern.test(text) ||
    keywordPattern.test(text)
  );
};


