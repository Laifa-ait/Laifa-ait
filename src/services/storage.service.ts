import { ref, uploadBytes, getDownloadURL, uploadBytesResumable, UploadTaskSnapshot } from "firebase/storage";
import { storage } from "../lib/firebase";

export async function uploadFile(
  path: string,
  file: Blob | File,
  metadata?: Record<string, string>
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, metadata ? { customMetadata: metadata } : undefined);
  return getDownloadURL(storageRef);
}

export function uploadFileWithProgress(
  path: string,
  file: Blob | File,
  onProgress: (progress: number) => void,
  onError: (err: Error) => void,
  onComplete: (url: string) => void
): () => void {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on(
    "state_changed",
    (snapshot: UploadTaskSnapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress(progress);
    },
    (error) => onError(error),
    async () => {
      const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
      onComplete(downloadUrl);
    }
  );

  return () => uploadTask.cancel();
}
