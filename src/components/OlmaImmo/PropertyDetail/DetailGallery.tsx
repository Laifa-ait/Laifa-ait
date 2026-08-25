import React from 'react';
import { Grid } from 'lucide-react';

interface DetailGalleryProps {
  images: string[];
  title: string;
  selectedImageIndex: number;
  onSelectImage: (index: number) => void;
  onOpenLightbox: () => void;
}

export const DetailGallery: React.FC<DetailGalleryProps> = ({
  images,
  title,
  selectedImageIndex,
  onSelectImage,
  onOpenLightbox,
}) => {
  const safeImages = images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div className="space-y-3">
      {/* Desktop 5-Photo Grid */}
      <div className="hidden md:grid grid-cols-4 gap-3 h-[440px] rounded-3xl overflow-hidden shadow-xs border border-[#e8e2d4]">
        {/* Main Big Photo (Left - 2 Cols) */}
        <div
          onClick={() => {
            onSelectImage(0);
            onOpenLightbox();
          }}
          className="col-span-2 relative h-full bg-slate-900 group cursor-pointer overflow-hidden"
        >
          <img
            src={safeImages[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        </div>

        {/* Right 4 Grid Cells */}
        <div className="col-span-2 grid grid-cols-2 gap-3 h-full">
          {[1, 2, 3, 4].map((idx) => {
            const img = safeImages[idx] || safeImages[0];
            const isLastCell = idx === 4;
            const hasMore = safeImages.length > 5;

            return (
              <div
                key={idx}
                onClick={() => {
                  onSelectImage(idx < safeImages.length ? idx : 0);
                  onOpenLightbox();
                }}
                className="relative h-full bg-slate-900 group cursor-pointer overflow-hidden rounded-xl"
              >
                <img
                  src={img}
                  alt={`${title} photo ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

                {isLastCell && hasMore && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2 text-center">
                    <Grid className="w-6 h-6 mb-1 text-[#ebdcb8]" />
                    <span className="font-bold text-sm sm:text-base">
                      +{safeImages.length - 4} photos
                    </span>
                    <span className="text-xs text-slate-300">Voir tout</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Image Carousel */}
      <div className="md:hidden relative aspect-[16/10] bg-slate-900 rounded-3xl overflow-hidden shadow-xs border border-[#e8e2d4]">
        <img
          src={safeImages[selectedImageIndex] || safeImages[0]}
          alt={title}
          onClick={onOpenLightbox}
          className="w-full h-full object-cover cursor-pointer"
        />
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-xl">
          {selectedImageIndex + 1} / {safeImages.length}
        </div>

        <button
          type="button"
          onClick={onOpenLightbox}
          className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-[#1a3831] px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <Grid className="w-3.5 h-3.5 text-[#1a3831]" />
          <span>Voir les {safeImages.length} photos</span>
        </button>
      </div>

      {/* Mobile Thumbnail Strip */}
      {safeImages.length > 1 && (
        <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectImage(idx)}
              className={`w-16 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                selectedImageIndex === idx
                  ? 'border-[#1a3831] ring-2 ring-[#1a3831]/20'
                  : 'border-transparent opacity-60'
              }`}
            >
              <img src={img} alt={`Miniature ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
