import { auth } from "../lib/firebase";
import { uploadFileWithProgress } from "./storage.service";
import {
  DocumentCategory,
  DocumentUploadPayload,
  UserDataConsentPreferences,
  UserDocumentDTO,
} from "../types/documents";

async function getAuthHeader(): Promise<HeadersInit> {
  const token = await auth.currentUser?.getIdToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchMyDocuments(category?: DocumentCategory): Promise<UserDocumentDTO[]> {
  const headers = await getAuthHeader();
  const url = category
    ? `/api/v1/user-documents/my?category=${encodeURIComponent(category)}`
    : "/api/v1/user-documents/my";

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Impossible de récupérer vos documents.");
  }
  const result = await res.json();
  return result.data || [];
}

export async function recordUserDocument(payload: DocumentUploadPayload): Promise<UserDocumentDTO> {
  const headers = await getAuthHeader();
  const res = await fetch("/api/v1/user-documents/record", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Échec de l'enregistrement du document.");
  }
  const result = await res.json();
  return result.data;
}

export async function deleteUserDocument(documentId: string): Promise<void> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/v1/user-documents/${encodeURIComponent(documentId)}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Échec de la suppression du document.");
  }
}

export async function fetchUserConsent(): Promise<UserDataConsentPreferences | null> {
  const headers = await getAuthHeader();
  const res = await fetch("/api/v1/user-documents/consent", { headers });
  if (!res.ok) return null;
  const result = await res.json();
  return result.data || null;
}

export async function saveUserConsent(
  preferences: UserDataConsentPreferences
): Promise<UserDataConsentPreferences> {
  const headers = await getAuthHeader();
  const res = await fetch("/api/v1/user-documents/consent", {
    method: "POST",
    headers,
    body: JSON.stringify(preferences),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Échec de la sauvegarde des consentements.");
  }
  const result = await res.json();
  return result.data;
}

export function uploadDocumentDirectWithProgress(
  userId: string,
  category: DocumentCategory,
  file: File,
  description: string | undefined,
  onProgress: (pct: number) => void,
  onError: (err: Error) => void,
  onComplete: (doc: UserDocumentDTO) => void
): () => void {
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniquePrefix = Date.now();
  const storagePath = `user_documents/${userId}/${category}_${uniquePrefix}_${cleanFileName}`;

  const cancelUpload = uploadFileWithProgress(
    storagePath,
    file,
    onProgress,
    onError,
    async (downloadUrl) => {
      try {
        const recordedDoc = await recordUserDocument({
          category,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
          downloadUrl,
          storagePath,
          description,
        });
        onComplete(recordedDoc);
      } catch (err) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  );

  return cancelUpload;
}
