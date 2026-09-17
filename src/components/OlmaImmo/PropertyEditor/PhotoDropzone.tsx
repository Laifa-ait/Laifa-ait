import React, { useRef } from 'react';
import { Upload, Camera, Loader2 } from 'lucide-react';

interface PhotoDropzoneProps {
  isProcessing: boolean;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFilesSelected: (files: FileList | null) => void;
}

export const PhotoDropzone: React.FC<PhotoDropzoneProps> = ({
  isProcessing,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFilesSelected,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative rounded-3xl p-8 sm:p-10 border-2 border-dashed transition-all duration-200 text-center flex flex-col items-center justify-center gap-4 ${
        isDragging
          ? 'border-blue-600 bg-blue-50/60 scale-[1.01]'
          : 'border-slate-300 hover:border-[#1E3A8A] bg-slate-50 hover:bg-slate-100'
      }`}
    >
      <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-[#1E3A8A]">
        {isProcessing ? (
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
        ) : (
          <Upload className="w-7 h-7 text-[#F59E0B]" />
        )}
      </div>

      <div className="space-y-1 max-w-md">
        <h4 className="text-sm font-bold text-slate-900">
          {isProcessing ? 'Optimisation des photos...' : 'Glissez-déposez vos photos ici'}
        </h4>
        <p className="text-xs text-slate-500">
          Sélectionnez plusieurs photos à la fois depuis votre téléphone ou ordinateur.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => fileInputRef.current?.click()}
          className="px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          <Upload className="w-4 h-4 text-[#F59E0B]" />
          <span>Sélectionner des photos</span>
        </button>

        <button
          type="button"
          disabled={isProcessing}
          onClick={() => cameraInputRef.current?.click()}
          className="px-5 py-2.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          <Camera className="w-4 h-4 text-emerald-700" />
          <span>Prendre une photo</span>
        </button>
      </div>

      <span className="text-[11px] text-stone-400">
        Formats acceptés : JPG, PNG, WebP, HEIC • Compression HD automatique
      </span>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => {
          onFilesSelected(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          onFilesSelected(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
      />
    </div>
  );
};
