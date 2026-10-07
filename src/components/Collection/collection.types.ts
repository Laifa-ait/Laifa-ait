import React from "react";

export interface CollectionCategory {
  id: string;
  label: string;
  emoji?: string;
  accentClass?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface CollectionQuickFilter {
  id: string;
  label: string;
  emoji?: string;
  badgeColor?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export type CollectionSortOption = "popular" | "price-asc" | "price-desc" | "rating-desc" | "newest";

export interface CollectionFilterState {
  category: string;
  quickFilter: string | null;
  wilaya: string;
  minPrice: string;
  maxPrice: string;
  sortBy: CollectionSortOption;
  searchQuery: string;
}
