import React, { useState } from 'react';
import {
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  X,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PhotoCardItem } from './PhotoCardItem';
import { PhotoDropzone } from './PhotoDropzone';
import { batchOptimizePropertyImages } from './imageOptimizer';

interface EditorStepMediaProps {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
}

export const EditorStepMedia: React.FC<EditorStepMediaProps> = ({ images, setImages }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const processFiles = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    const toastId = toast.loading('Optimisation des photos en haute définition...');

    try {
      const optimizedImages = await batchOptimizePropertyImages(files);
      if (optimizedImages.length > 0) {
        setImages((prev) => [...prev, ...optimizedImages]);
        toast.success(`${optimizedImages.length} photo(s) ajoutée(s) avec succès`, { id: toastId });
      } else {
        toast.error('Aucune photo valide détectée', { id: toastId });
      }
    } catch {
      toast.error('Erreur lors du traitement des photos', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    toast.success('Photo retirée');
  };

  const handleSetMain = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
    toast.success('Photo de couverture mise à jour');
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveRight = (index: number) => {
    setImages((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d4] shadow-xs space-y-6">
      {/* Header & Quality Meter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <h3 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif] flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#1a3831]" />
            <span>Photos du bien ({images.length})</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Ajoutez de vraies photos nettes et lumineuses de votre bien immobilier.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#faf8f5] border border-[#e8e2d4]">
          {images.length === 0 ? (
            <span className="text-amber-700 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> 1 photo minimum requise
            </span>
          ) : images.length < 3 ? (
            <span className="text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Bon début (3+ conseillées)
            </span>
          ) : (
            <span className="text-emerald-800 flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-amber-500" /> Visibilité Maximale (+300%)
            </span>
          )}
        </div>
      </div>

      {/* Main Upload Dropzone */}
      <PhotoDropzone
        isProcessing={isProcessing}
        isDragging={isDragging}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
        }}
        onFilesSelected={(files) => processFiles(files)}
      />

      {/* Photography Pro Tips Box */}
      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <span className="font-bold">Conseils pour louer ou vendre rapidement :</span>
          <p className="text-[11px] leading-relaxed text-amber-800/90">
            La 1ère photo sera votre couverture. Prenez des photos horizontales à la lumière du jour
            (salon, chambres, cuisine, vue extérieure/façade). Vous pouvez réorganiser l'ordre des
            photos ci-dessous.
          </p>
        </div>
      </div>

      {/* Photos Grid Gallery */}
      {images.length === 0 ? (
        <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>Aucune photo ajoutée pour l'instant. Importez au moins la photo principale.</span>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
            <span>Ordre d'affichage dans l'annonce</span>
            <span className="text-stone-400">Survolez une photo pour la réorganiser ou l'agrandir</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <PhotoCardItem
                key={`${idx}-${img.slice(0, 30)}`}
                img={img}
                index={idx}
                total={images.length}
                isMain={idx === 0}
                onSetMain={handleSetMain}
                onMoveLeft={handleMoveLeft}
                onMoveRight={handleMoveRight}
                onRemove={handleRemoveImage}
                onPreview={(src) => setPreviewImage(src)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewImage}
            alt="Aperçu plein écran"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl border border-white/10"
          />
        </div>
      )}
    </div>
  );
};
