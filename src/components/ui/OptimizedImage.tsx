import React, { useState } from "react";

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  aspectRatio?: string;
  fallbackSrc?: string;
  className?: string;
}

/**
 * Helper transformation pour générer des URL au format WebP optimisé (Unsplash / CDN supportés)
 */
function getWebpUrl(url: string, targetWidth?: number): string {
  if (!url) return "";

  // Support d'optimisation dynamique pour Unsplash
  if (url.includes("images.unsplash.com")) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set("fm", "webp");
      urlObj.searchParams.set("q", "80");
      if (targetWidth) {
        urlObj.searchParams.set("w", targetWidth.toString());
      }
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  return url;
}

/**
 * Générateur de jeu de sources (srcset) pour le rendu réactif haute performance
 */
function generateSrcSet(url: string): string | undefined {
  if (!url || !url.includes("images.unsplash.com")) {
    return undefined;
  }
  const widths = [320, 640, 960, 1280];
  return widths.map((w) => `${getWebpUrl(url, w)} ${w}w`).join(", ");
}

/**
 * Composant d'image haute performance Olmart avec lazy-loading, format WebP et fallback gracieux
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  aspectRatio,
  fallbackSrc,
  className = "",
  style,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const defaultFallback =
    fallbackSrc ||
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%23F1F5F9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2394A3B8'>Image non disponible</text></svg>";

  const webpSrc = getWebpUrl(src);
  const srcSet = generateSrcSet(src);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    aspectRatio: aspectRatio || undefined,
    ...style,
  };

  return (
    <div style={containerStyle} className={`inline-block relative ${className}`}>
      {/* Squelette d'attente (Skeleton Loader) pendant le chargement */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
      )}

      {hasError ? (
        <img loading="lazy" decoding="async" src={defaultFallback}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-full object-cover rounded"
        />
      ) : (
        <picture>
          {srcSet && (
            <source
              type="image/webp"
              srcSet={srcSet}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}
          <img
            src={webpSrc}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            } w-full h-full object-cover`}
            {...props}
          />
        </picture>
      )}
    </div>
  );
};

export default OptimizedImage;
