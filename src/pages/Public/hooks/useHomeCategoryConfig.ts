import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface CategoryCardConfig {
  key: string;
  title: string;
  subtitle: string;
  image: string;
  gradient: string;
  featuredProductIds?: string[];
  withExploreButton?: boolean;
}

interface CustomCategoryItem {
  id: string;
  title?: string;
  subtitle?: string;
  image?: string;
  gradient?: string;
  featuredProductIds?: string[];
}

export const useHomeCategoryConfig = (
  customCategories: CustomCategoryItem[] = [],
  categoryHierarchy: Record<string, string[]> = {},
  categoriesVisiteesCount?: Record<string, number>,
  favoriteCategory?: string | null
) => {
  const { t } = useTranslation();

  const defaultCategoryMapping = useMemo<CategoryCardConfig[]>(
    () => [
      {
        key: "Supermarché",
        title: t("cat_supermarche"),
        subtitle: t("cat_supermarche_desc"),
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-900/80 via-zinc-900/20 to-transparent",
        withExploreButton: true,
      },
      {
        key: "Maison & Déco",
        title: t("cat_maison_deco"),
        subtitle: t("cat_home_desc"),
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      },
      {
        key: "Mode",
        title: t("cat_fashion_title"),
        subtitle: t("cat_fashion_desc"),
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      },
    ],
    [t]
  );

  const activeCategoriesConfig = useMemo<CategoryCardConfig[]>(() => {
    const baseMap = Object.keys(categoryHierarchy).map((catKey) => {
      const defaultMapping = defaultCategoryMapping.find((dm) => dm.key === catKey) || {
        key: catKey,
        title: catKey,
        subtitle: t("home.discover_category_articles", { category: catKey }),
        image: "/images/placeholders/product.svg",
        gradient: "from-zinc-950/80 via-zinc-950/20 to-transparent",
      };
      return defaultMapping;
    });

    return baseMap.map((categoryItem) => {
      const custom = customCategories.find((cc) => cc.id === categoryItem.key);
      if (custom) {
        return {
          ...categoryItem,
          title: custom.title || categoryItem.title,
          subtitle: custom.subtitle || categoryItem.subtitle,
          image: custom.image || categoryItem.image,
          gradient: custom.gradient || categoryItem.gradient,
          featuredProductIds: custom.featuredProductIds || [],
        };
      }
      return {
        ...categoryItem,
        featuredProductIds: [],
      };
    });
  }, [customCategories, defaultCategoryMapping, categoryHierarchy, t]);

  const sortedCategoryCards = useMemo<CategoryCardConfig[]>(() => {
    return [...activeCategoriesConfig].sort((a, b) => {
      const aCount = categoriesVisiteesCount?.[a.key] || 0;
      const bCount = categoriesVisiteesCount?.[b.key] || 0;

      if (bCount !== aCount) {
        return bCount - aCount;
      }

      if (favoriteCategory === a.key) return -1;
      if (favoriteCategory === b.key) return 1;

      const defaultOrder = Object.keys(categoryHierarchy);
      const defaultOrderArray = Array.isArray(defaultOrder) ? defaultOrder : [];
      return defaultOrderArray.indexOf(a.key) - defaultOrderArray.indexOf(b.key);
    });
  }, [activeCategoriesConfig, categoriesVisiteesCount, favoriteCategory, categoryHierarchy]);

  return { sortedCategoryCards };
};
