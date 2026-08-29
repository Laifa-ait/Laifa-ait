export function validateSecureFilePath(filePath: string, ticketId: string, attachmentId: string): boolean {
  if (!filePath) return false;
  
  const expectedPrefix = `support/${ticketId}/${attachmentId}/`;
  if (!filePath.startsWith(expectedPrefix)) return false;

  if (
    filePath.includes("..") ||
    filePath.includes("\\") ||
    filePath.startsWith("/") ||
    /* eslint-disable-next-line no-control-regex */
    /[\x00-\x1F\x7F]/.test(filePath)
  ) {
    return false;
  }
  return true;
}
