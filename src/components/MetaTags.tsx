import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  schema?: Record<string, unknown>;
}

export const MetaTags: React.FC<MetaTagsProps> = ({
  title = "Olma Marketplace - Le meilleur de l'Algérie",
  description = "Découvrez nos artisans et vendeurs de confiance à travers les 58 wilayas d'Algérie.",
  image = "/assets/icon.png",
  url = typeof window !== 'undefined' ? window.location.href : "https://olma-dz.com",
  type = "website",
  schema
}) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language || "fr").split("-")[0];

  return (
    <Helmet>
      <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* hreflang tags */}
      <link rel="alternate" hrefLang="fr" href={`${url}?lang=fr`} />
      <link rel="alternate" hrefLang="en" href={`${url}?lang=en`} />
      <link rel="alternate" hrefLang="ar" href={`${url}?lang=ar`} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};
