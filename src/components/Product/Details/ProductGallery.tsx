import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImageMagnifier } from "../ImageMagnifier";
import { Play } from "lucide-react";
import { getOptimizedImageUrl } from "../../../utils/imageUtils";
import { OptimizedImage } from "../../ui/OptimizedImage";

interface GalleryProps {
  images: string[];
  selectedIndex: number;
  productName: string;
  onSelectImage: (index: number) => void;
  showVideo: boolean;
  setShowVideo: (show: boolean) => void;
  productVideoUrl?: string;
  onOpenLightbox: () => void;
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
}) => {
  const handleDragEnd = (_event: unknown, info: { offset: { x: number; y: number } }) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      // Swiped left -> next image
      if (selectedIndex < images.length - 1) {
        onSelectImage(selectedIndex + 1);
        setShowVideo(false);
      }
    } else if (info.offset.x > swipeThreshold) {
      // Swiped right -> previous image
      if (selectedIndex > 0) {
        onSelectImage(selectedIndex - 1);
        setShowVideo(false);
      }
    }
  };

  return (
    <div className="space-y-4 px-0">
      {/* Arched Frame inspired by the traditional door in the picture */}
      <div
        onContextMenu={(e) => e.preventDefault()}
        className="relative aspect-[4/5] max-h-[500px] sm:max-h-none rounded-t-[160px] rounded-b-[32px] overflow-hidden bg-[#FAF6F0] border-[10px] sm:border-[14px] border-[#EAE3D5] shadow-[0_15px_40px_-15px_rgba(40,30,20,0.15),inset_0_2px_8px_rgba(0,0,0,0.06)] group cursor-pointer transition-all duration-300"
      >
        {/* Traditional studded door metallic accents (simulated on outer edges) */}
        <div className="absolute inset-x-0 top-12 flex justify-between px-6 pointer-events-none opacity-30">
          <div className="w-2.5 h-2.5 rounded-full bg-[#3E3A35] shadow-[0_1px_2px_rgba(0,0,0,0.5)]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#3E3A35] shadow-[0_1px_2px_rgba(0,0,0,0.5)]"></div>
        </div>

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
            {productVideoUrl && (
              <a 
                href={productVideoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute top-4 right-[60px] bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg z-30 text-xs font-bold text-black"
              >
                Ouvrir la vidéo
              </a>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVideo(false);
              }}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors z-30"
            >
              ✕
            </button>
          </div>
        ) : null}

        {/* Desktop View with ImageMagnifier */}
        <div className="hidden lg:block w-full h-full bg-[#FAF6F0]">
          <ImageMagnifier
            src={getOptimizedImageUrl(images[selectedIndex], 1200)}
            alt={productName}
            className="w-full h-full"
            imageClassName="w-full h-full object-cover mix-blend-multiply select-none pointer-events-none"
            onClick={onOpenLightbox}
          />
        </div>

        {/* Mobile Swipe-enabled View */}
        <div className="lg:hidden w-full h-full relative overflow-hidden flex items-center justify-center bg-[#FAF6F0]">
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              src={getOptimizedImageUrl(images[selectedIndex], 800)}
              draggable="true"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
              className="w-full h-full object-cover select-none mix-blend-multiply pointer-events-auto"
              alt={productName}
              onClick={onOpenLightbox}
            />
          </AnimatePresence>

          {/* Swipe indicator dots - Zara style */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-0 w-full flex justify-center gap-2 z-10 px-4">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectImage(idx);
                    setShowVideo(false);
                  }}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    selectedIndex === idx 
                      ? "bg-[#008BB5] w-6" 
                      : "bg-black/15 w-2 hover:bg-black/40"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {productVideoUrl && !showVideo && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowVideo(true);
            }}
            className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-[#008BB5] text-white flex items-center justify-center hover:bg-[#007CA7] shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 z-10"
          >
            <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
          </button>
        )}
      </div>

      {(images.length > 1 || productVideoUrl) && (
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide justify-start sm:justify-start px-1 sm:px-0 mt-3">
          {productVideoUrl && (
            <button
              onClick={() => setShowVideo(true)}
              className={`w-14 h-18 sm:w-20 sm:h-28 rounded-t-3xl rounded-b-xl overflow-hidden transition-all shrink-0 bg-stone-100 flex items-center justify-center relative ${
                showVideo 
                  ? "border-2 border-[#008BB5] opacity-100 shadow-md scale-95" 
                  : "border border-stone-250 opacity-60 hover:opacity-100"
              }`}
            >
              <Play className="w-5 h-5 text-[#008BB5] fill-[#008BB5]" />
            </button>
          )}
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => {
                onSelectImage(i);
                setShowVideo(false);
              }}
              onContextMenu={(e) => e.preventDefault()}
              className={`w-14 h-18 sm:w-20 sm:h-28 rounded-t-3xl rounded-b-xl overflow-hidden transition-all shrink-0 bg-[#FAF6F0] border-2 ${
                selectedIndex === i && !showVideo
                  ? "border-[#008BB5] opacity-100 shadow-md scale-95" 
                  : "border-stone-200/50 opacity-70 hover:opacity-100"
              }`}
            >
              <OptimizedImage
                src={getOptimizedImageUrl(img, 200)}
                alt={productName || "Product thumbnail"}
                className="w-full h-full object-cover mix-blend-multiply select-none pointer-events-none"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
