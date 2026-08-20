import React, { useState, useEffect, useRef } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { checkWebpSupport, getWebpFirebaseUrl } from "../../utils/imageUtils";

interface ImageLazyProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  className?: string;
  rootMargin?: string;
  threshold?: number;
}

export const ImageLazy: React.FC<ImageLazyProps> = ({
  src,
  alt = "",
  className = "",
  rootMargin,
  threshold,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // 2. Détecter le support WebP et configurer l'URL de l'image
  useEffect(() => {
    if (!src) {
      setCurrentSrc(undefined);
      setLoading(false);
      return;
    }

    const isWebpSupported = checkWebpSupport();
    if (isWebpSupported && src.includes("firebasestorage.googleapis.com")) {
      const webpUrl = getWebpFirebaseUrl(src);
      if (webpUrl !== src) {
        setCurrentSrc(webpUrl);
        setHasTriedFallback(false);
        setLoading(true);
        setError(false);
        return;
      }
    }

    // Par défaut, utiliser l'original
    setCurrentSrc(src);
    setHasTriedFallback(true);
    setLoading(true);
    setError(false);
  }, [src]);

  // 3. Gérer l'état de chargement si l'image est déjà présente dans le cache navigateur
  useEffect(() => {
    if (imgRef.current && currentSrc) {
      if (imgRef.current.complete) {
        if (imgRef.current.naturalWidth === 0) {
          handleImageError();
        } else {
          setLoading(false);
          setError(false);
        }
      }
    }
  }, [currentSrc]);

  const handleImageError = () => {
    if (!hasTriedFallback && src && currentSrc !== src) {
      setCurrentSrc(src);
      setHasTriedFallback(true);
      setLoading(true);
    } else {
      setLoading(false);
      setError(true);
    }
  };

  if (error || !src) {
    return (
      <div 
        ref={containerRef}
        className={`flex flex-col items-center justify-center bg-zinc-50 border border-zinc-100 p-4 ${className}`}
      >
        <ImageOff className="w-8 h-8 text-zinc-300" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Skeleton élégant avec pulse animé tant que l'image est en cours de chargement */}
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-50 via-zinc-100 to-zinc-50 animate-pulse flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-zinc-300 animate-spin" />
        </div>
      )}
      
      {currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => {
            setLoading(false);
            setError(false);
          }}
          onError={handleImageError}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
            loading ? "opacity-0" : "opacity-100"
          }`}
          {...props}
        />
      )}
    </div>
  );
};
