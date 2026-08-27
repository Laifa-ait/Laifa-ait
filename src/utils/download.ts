import { safeLogger } from './logger';

export const forceDownload = async (url: string | undefined, filename: string) => {
  if (!url) return;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  } catch (error) {
    if (import.meta.env.DEV) {
      safeLogger.error("Error downloading file", { err: error instanceof Error ? error.message : "Erreur" });
    }
    window.open(url, '_blank');
  }
};
