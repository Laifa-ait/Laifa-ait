import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDataConsent } from "../../context/DataConsentContext";
import { uploadDocumentDirectWithProgress } from "../../services/documents.service";
import { DocumentCategory, UserDocumentDTO } from "../../types/documents";

interface UniversalFileUploaderProps {
  category: DocumentCategory;
  title?: string;
  description?: string;
  acceptedFormats?: string[];
  maxSizeMb?: number;
  onUploadSuccess?: (doc: UserDocumentDTO) => void;
}

export const UniversalFileUploader: React.FC<UniversalFileUploaderProps> = ({
  category,
  title = "Téléverser un document",
  description = "Glissez-déposez votre fichier ici ou parcourez vos dossiers",
  acceptedFormats = [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
  maxSizeMb = 15,
  onUploadSuccess,
}) => {
  const { currentUser } = useAuth();
  const { preferences, openConsentModal } = useDataConsent();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successDoc, setSuccessDoc] = useState<UserDocumentDTO | null>(null);
  const [cancelFn, setCancelFn] = useState<(() => void) | null>(null);

  const validateFile = (file: File): string | null => {
    const maxSizeBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Le fichier dépasse la taille maximale autorisée de ${maxSizeMb} Mo.`;
    }
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!acceptedFormats.includes(ext)) {
      return `Format invalide. Formats acceptés : ${acceptedFormats.join(", ")}`;
    }
    return null;
  };

  const startUpload = (file: File) => {
    if (!currentUser) {
      setErrorMessage("Vous devez être connecté pour téléverser des documents.");
      return;
    }

    if (!preferences.documentMemory) {
      setErrorMessage("L'accès à la mémoire et aux documents n'a pas été autorisé.");
      openConsentModal();
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setUploadProgress(0);

    const cancel = uploadDocumentDirectWithProgress(
      currentUser.uid,
      category,
      file,
      undefined,
      (pct) => setUploadProgress(Math.round(pct)),
      (err) => {
        setErrorMessage(err.message || "Erreur lors du téléversement.");
        setUploadProgress(null);
        setCancelFn(null);
      },
      (doc) => {
        setSuccessDoc(doc);
        setUploadProgress(null);
        setCancelFn(null);
        if (onUploadSuccess) {
          onUploadSuccess(doc);
        }
      }
    );

    setCancelFn(() => cancel);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const error = validateFile(file);
      if (error) {
        setErrorMessage(error);
      } else {
        startUpload(file);
      }
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const error = validateFile(file);
      if (error) {
        setErrorMessage(error);
      } else {
        startUpload(file);
      }
    }
  };

  const resetUploader = () => {
    if (cancelFn) cancelFn();
    setSelectedFile(null);
    setUploadProgress(null);
    setErrorMessage(null);
    setSuccessDoc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-extrabold text-slate-900 text-base">{title}</h4>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Max {maxSizeMb} Mo</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(",")}
        onChange={handleFileInput}
        className="hidden"
      />

      {!selectedFile && !successDoc && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? "border-orange-500 bg-orange-50/60 scale-[1.01]"
              : "border-slate-300 hover:border-orange-400 hover:bg-slate-50/80"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{description}</p>
            <p className="text-xs text-slate-400 mt-1">
              Sélection manuelle ou glisser-déposer • Formats : {acceptedFormats.join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Uploading Progress */}
      {uploadProgress !== null && selectedFile && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-bold text-xs text-slate-800 truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-500">{uploadProgress}% téléversé</p>
              </div>
            </div>
            <button
              onClick={resetUploader}
              className="text-xs text-slate-500 hover:text-red-500 font-bold transition"
            >
              Annuler
            </button>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success View */}
      {successDoc && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-xs text-emerald-900 truncate">{successDoc.fileName}</p>
              <p className="text-[11px] text-emerald-700">Document téléversé et sécurisé avec succès</p>
            </div>
          </div>
          <button
            onClick={resetUploader}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
          >
            Téléverser un autre
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
