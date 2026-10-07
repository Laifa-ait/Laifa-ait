import React from "react";
import { Helmet } from "react-helmet-async";
import { Product } from "../../../domains/product/product.types";

interface ProductSeoHelmetProps {
  product: Product | null;
  translatedTitle: string;
  translatedDescription: string;
  displayedPrice: number;
  isCurrentSelectionOutOfStock: boolean;
  images: string[];
}

export const ProductSeoHelmet: React.FC<ProductSeoHelmetProps> = ({
  product,
  translatedTitle,
  translatedDescription,
  displayedPrice,
  isCurrentSelectionOutOfStock,
  images,
}) => {
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const firstImage = images?.[0] || product?.images?.[0] || "";

  return (
    <Helmet>
      <title>{translatedTitle ? `${translatedTitle} | OLMART` : "Produit | OLMART"}</title>
      <meta name="description" content={translatedDescription?.substring(0, 160)} />
      <meta property="og:title" content={translatedTitle} />
      <meta property="og:description" content={translatedDescription?.substring(0, 200)} />
      <meta property="og:image" content={firstImage} />
      <meta property="og:type" content="product" />
      <meta property="product:price:amount" content={String(displayedPrice)} />
      <meta property="product:price:currency" content="DZD" />
      {product && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: translatedTitle || product.name,
            image: firstImage,
            description: translatedDescription || product.description,
            sku: product.id,
            offers: {
              "@type": "Offer",
              url: currentUrl,
              priceCurrency: "DZD",
              price: displayedPrice,
              availability: isCurrentSelectionOutOfStock
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            },
            aggregateRating: product.stats?.reviewCount
              ? {
                  "@type": "AggregateRating",
                  ratingValue: product.stats?.averageRating || 5,
                  reviewCount: product.stats?.reviewCount,
                }
              : undefined,
          })}
        </script>
      )}
    </Helmet>
  );
};
