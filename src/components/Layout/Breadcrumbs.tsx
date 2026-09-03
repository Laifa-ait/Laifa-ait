import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  // Schema.org BreadcrumbList JSON-LD for Search Engine crawling
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.link ? `${window.location.origin}${item.link}` : undefined,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="py-2 sm:py-3 px-4 sm:px-6 max-w-7xl mx-auto w-full relative z-10">
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
      <ol className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm font-medium text-zinc-500">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-orange-600 transition-colors py-1 px-1.5 rounded-lg hover:bg-white/50"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">{t("Accueil", "Accueil")}</span>
          </Link>
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <React.Fragment key={idx}>
              <li className="shrink-0 text-zinc-300">
                <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} />
              </li>
              <li className="flex items-center min-w-0">
                {!isLast && item.link ? (
                  <Link
                    to={item.link}
                    className="hover:text-orange-600 transition-colors py-1 px-1.5 rounded-lg hover:bg-white/50 truncate max-w-[120px] sm:max-w-[200px]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-zinc-800 font-semibold truncate max-w-[150px] sm:max-w-[300px] px-1.5">
                    {item.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
