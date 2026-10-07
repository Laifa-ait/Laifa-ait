import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Share2, Play } from "lucide-react";
import { getOptimizedImageUrl } from "../../../utils/imageUtils";
import { ImageMagnifier } from "../ImageMagnifier";

interface GalleryProps {
  images: string[];
  selectedIndex: number;
  productName: string;
  onSelectImage: (index: number) => void;
  showVideo: boolean;
  setShowVideo: (show: boolean) => void;
  productVideoUrl?: string;
  onOpenLightbox: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  onShare?: () => void;
}

export const ProductGallery: React.FC<GalleryProps> = ({
  images,
  selectedIndex,
  productName,
  onSelectImage,
  showVideo,
  setShowVideo,
  productVideoUrl,
  onOpenLightbox,
  isWishlisted,
  onToggleWishlist,
  onShare,
}) => {
  const handleDragEnd = (_event: unknown, info: { offset: { x: number; y: number } }) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      if (selectedIndex < images.length - 1) {
        onSelectImage(selectedIndex + 1);
        setShowVideo(false);
      }
    } else if (info.offset.x > swipeThreshold) {
      if (selectedIndex > 0) {
        onSelectImage(selectedIndex - 1);
        setShowVideo(false);
      }
    }
  };

  const safeImages = images && images.length > 0 ? images : ["/placeholder.png"];

  return (
    <div className="relative w-full">
      {/* Zara-Style Mobile Hero Stage (Rounded card on mobile & desktop matching reference design) */}
      <div
        onContextMenu={(e) => e.preventDefault()}
        className="relative w-full aspect-[3/4] sm:aspect-[4/5] bg-white rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-[0_12px_40px_rgba(91,55,101,0.10)] border border-[#EFE3ED] select-none group"
      >
        {/* Floating Actions on Top Right (Wishlist, Share) */}
        {(onToggleWishlist || onShare) && (
          <div className="absolute top-3.5 end-3.5 flex items-center gap-2 z-20 pointer-events-auto">
            {onToggleWishlist && (
              <button
                type="button"
                onClick={onToggleWishlist}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full backdrop-blur-md border shadow-[0_4px_16px_rgba(15,23,42,0.08)] flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                  isWishlisted
                    ? "bg-rose-50 border-rose-200 text-rose-600"
                    : "bg-white/95 hover:bg-white border-slate-200 text-slate-700 hover:text-rose-600"
                }`}
                aria-label="Ajouter aux favoris"
              >
                <Heart className={`w-4.5 h-4.5 ${isWishlisted ? "fill-rose-600" : ""}`} />
              </button>
            )}

            {onShare && (
              <button
                type="button"
                onClick={onShare}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-white backdrop-blur-md border border-slate-200 text-slate-700 hover:text-slate-950 shadow-[0_4px_16px_rgba(15,23,42,0.08)] flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                aria-label="Partager"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Floating Vertical Thumbnail Dock on Left (Clean dock prevents shadow clipping) */}
        {safeImages.length > 1 && (
          <div className="absolute top-3.5 start-3.5 z-20 flex flex-col gap-2 p-1.5 rounded-2xl bg-white/85 backdrop-blur-md border border-white/70 shadow-[0_8px_25px_rgba(15,23,42,0.06)] max-h-[70%] overflow-y-auto scrollbar-none pointer-events-auto">
            {safeImages.slice(0, 5).map((img, i) => {
              const isSelected = selectedIndex === i && !showVideo;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onSelectImage(i);
                    setShowVideo(false);
                  }}
                  className={`w-11 h-13 sm:w-13 sm:h-15 rounded-xl overflow-hidden bg-white transition-all duration-200 cursor-pointer shrink-0 border ${
                    isSelected
                      ? "border-emerald-600 ring-2 ring-emerald-500/30 scale-102 shadow-xs"
                      : "border-black/5 opacity-75 hover:opacity-100 hover:scale-102"
                  }`}
                >
                  <img
                    src={getOptimizedImageUrl(img, 150)}
                    alt={`${productName} - thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              );
            })}

            {productVideoUrl && (
              <button
                type="button"
                onClick={() => setShowVideo(true)}
                className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-white flex items-center justify-center cursor-pointer shrink-0 border ${
                  showVideo ? "border-emerald-600 ring-2 ring-emerald-500/30" : "border-black/5 opacity-75 hover:opacity-100"
                }`}
                aria-label="Voir la vidéo"
              >
                <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              </button>
            )}
          </div>
        )}

        {/* Video Mode */}
        {showVideo && productVideoUrl ? (
          <div className="absolute inset-0 z-20 bg-black flex items-center justify-center">
            <video
              key={productVideoUrl}
              src={`/api/v1/proxy-video?url=${encodeURIComponent(productVideoUrl)}`}
              controls
              playsInline
              autoPlay
              muted
              loop
              preload="metadata"
              className="w-full h-full object-contain bg-black"
            />
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 end-4 w-9 h-9 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors z-30 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ) : null}

        {/* Desktop View with ImageMagnifier */}
        <div className="hidden lg:flex w-full h-full bg-white items-center justify-center">
          <ImageMagnifier
            src={getOptimizedImageUrl(safeImages[selectedIndex], 1200)}
            alt={productName}
            className="w-full h-full cursor-zoom-in"
            imageClassName="w-full h-full object-cover object-center select-none pointer-events-none"
            onClick={onOpenLightbox}
          />
        </div>

        {/* Mobile Swipe-enabled View (Fills the entire frame completely edge to edge) */}
        <div className="lg:hidden w-full h-full relative overflow-hidden flex items-center justify-center bg-zinc-100">
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={getOptimizedImageUrl(safeImages[selectedIndex], 900)}
              draggable="true"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
              className="w-full h-full object-cover object-center select-none pointer-events-auto"
              alt={productName}
              onClick={onOpenLightbox}
            />
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 start-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 pointer-events-none">
            {safeImages.map((_, idx) => (
               <div
                 key={idx}
                 className={`h-1.5 rounded-full transition-all duration-300 ${
                  selectedIndex === idx ? "bg-emerald-600 w-6 shadow-xs" : "bg-slate-300 w-1.5"
                 }`}
               />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
