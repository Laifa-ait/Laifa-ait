import React, { useState } from 'react';
import { Camera } from 'lucide-react';

export type PropertyMediaAspectRatio =
  | '16/11'
  | '16/10'
  | '16/9'
  | '4/3'
  | '1/1'
  | '21/9'
  | 'auto';

export interface PropertyMediaProps {
  src?: string;
  alt: string;
  aspectRatio?: PropertyMediaAspectRatio;
  topBadges?: React.ReactNode;
  topActions?: React.ReactNode;
  bottomOverlay?: React.ReactNode;
  photoCount?: number;
  images?: string[];
  activeImageIndex?: number;
  onSelectImageIndex?: (index: number) => void;
  hoverZoom?: boolean;
  className?: string;
  imageClassName?: string;
  id?: string;
}

const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';

const aspectClasses: Record<PropertyMediaAspectRatio, string> = {
  '16/11': 'aspect-16/11',
  '16/10': 'aspect-16/10',
  '16/9': 'aspect-16/9',
  '4/3': 'aspect-4/3',
  '1/1': 'aspect-square',
  '21/9': 'aspect-21/9',
  auto: '',
};

export const PropertyMedia: React.FC<PropertyMediaProps> = ({
  src,
  alt,
  aspectRatio = '16/11',
  topBadges,
  topActions,
  bottomOverlay,
  photoCount,
  images,
  activeImageIndex = 0,
  onSelectImageIndex,
  hoverZoom = true,
  className = '',
  imageClassName = '',
  id,
}) => {
  const resolvedSrc = (images && images.length > 0 ? images[activeImageIndex] : src) || DEFAULT_FALLBACK_IMAGE;
  const [imgSrc, setImgSrc] = useState<string>(resolvedSrc);
  const [hasError, setHasError] = useState<boolean>(false);

  React.useEffect(() => {
    setImgSrc(resolvedSrc);
    setHasError(false);
  }, [resolvedSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(DEFAULT_FALLBACK_IMAGE);
    }
  };

  const asp = aspectClasses[aspectRatio] || aspectClasses['16/11'];
  const totalPhotos = photoCount ?? (images ? images.length : undefined);

  return (
    <div
      id={id}
      className={`relative w-full overflow-hidden bg-stone-900 select-none ${asp} ${className}`}
    >
      {/* Property Photo */}
      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={handleError}
        className={`w-full h-full object-cover ${
          hoverZoom ? 'group-hover:scale-105 transition-transform duration-500 ease-out' : ''
        } ${imageClassName}`}
      />

      {/* Warm mineral scrim gradient at the bottom for readability */}
      <div
        className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/35 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Top badges slot */}
      {topBadges && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10">
          {topBadges}
        </div>
      )}

      {/* Top actions slot */}
      {topActions && (
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {topActions}
        </div>
      )}

      {/* Bottom overlay (Price tag, photo count, or custom children) */}
      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 z-10 pointer-events-none">
        <div className="pointer-events-auto flex-1 min-w-0">
          {bottomOverlay}
        </div>

        {typeof totalPhotos === 'number' && totalPhotos > 1 && (
          <div
            className="pointer-events-auto shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold border border-white/10 shadow-xs"
            title={`${totalPhotos} photos disponibles`}
          >
            <Camera className="w-3 h-3 text-[#EBDCB8]" aria-hidden="true" />
            <span>{totalPhotos}</span>
          </div>
        )}
      </div>

      {/* Multi-Photo Carousel Dot Pager (on hover) */}
      {images && images.length > 1 && onSelectImageIndex && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          {images.slice(0, 5).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectImageIndex(idx);
              }}
              aria-label={`Photo ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeImageIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/60 hover:bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
