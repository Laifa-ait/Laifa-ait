export const generateBackupCodes = (): string[] => {
  const codes: string[] = [];
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let i = 0; i < 8; i++) {
    let code = "OLM-";
    const randomValues = new Uint8Array(6);
    if (typeof window !== "undefined" && window.crypto) {
      window.crypto.getRandomValues(randomValues);
    } else if (typeof globalThis !== "undefined" && globalThis.crypto) {
      globalThis.crypto.getRandomValues(randomValues);
    } else {
      throw new Error("Cryptographically secure random number generator is unavailable");
    }
    for (let j = 0; j < 6; j++) {
      const randomIndex = randomValues[j] & 31;
      code += charset.charAt(randomIndex);
    }
    codes.push(code);
  }
  return codes;
};
