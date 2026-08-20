import React from "react";
import { OptimizedImage } from "../ui/OptimizedImage";

interface ProductImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  className?: string;
  rootMargin?: string;
  threshold?: number;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src = "",
  alt,
  className = "",
  rootMargin,
  threshold,
  ...props
}) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      {...props}
    />
  );
};


