import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';

interface ImageGalleryLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  title: string;
}

export const ImageGalleryLightbox: React.FC<ImageGalleryLightboxProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
  title,
}) => {
  const handlePrev = useCallback(() => {
    if (images.length === 0) return;
    onIndexChange((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onIndexChange]);

  const handleNext = useCallback(() => {
    if (images.length === 0) return;
    onIndexChange((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onIndexChange]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fade-in">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between text-white z-10">
        <div>
          <h3 className="text-sm font-bold text-slate-200 line-clamp-1">{title}</h3>
          <span className="text-xs text-slate-400 font-medium">
            Photo {currentIndex + 1} sur {images.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title, url: window.location.href }).catch(() => {});
              }
            }}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Partager"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Fermer (Échap)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Large Image Container */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer border border-white/20 hover:scale-110 min-w-[48px] min-h-[48px] flex items-center justify-center"
            title="Image précédente"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <img loading="lazy" decoding="async" src={images[currentIndex]}
          alt={`${title} - Photo ${currentIndex + 1}`}
          className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
        />

        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer border border-white/20 hover:scale-110 min-w-[48px] min-h-[48px] flex items-center justify-center"
            title="Image suivante"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Navigation Bar */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 scrollbar-none z-10 max-w-4xl mx-auto w-full">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onIndexChange(idx)}
              className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'border-emerald-500 scale-105 ring-2 ring-emerald-500/50'
                  : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img loading="lazy" decoding="async" src={img} alt={`Miniature ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
