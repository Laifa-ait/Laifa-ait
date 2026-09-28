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
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23F8FAFC'/><stop offset='100%25' stop-color='%23E2E8F0'/></linearGradient></defs><rect width='100%25' height='100%25' fill='url(%23g)'/><g fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' transform='translate(176,170)'><path d='M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z'/><line x1='3' y1='6' x2='21' y2='6'/><path d='M16 10a4 4 0 0 1-8 0'/></g><text x='50%25' y='60%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui,-apple-system,sans-serif' font-weight='600' font-size='10' letter-spacing='0.2em' fill='%2394A3B8'>OLMART</text></svg>";

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
