// Utilities for managing user favorite real estate properties in local state/storage

const FAVORITES_KEY = 'olma_immo_favorites';

export function getFavoritePropertyIds(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFavoritePropertyId(id: string): boolean {
  const favorites = getFavoritePropertyIds();
  return favorites.includes(id);
}

export function toggleFavoritePropertyId(id: string): boolean {
  try {
    const favorites = getFavoritePropertyIds();
    const index = favorites.indexOf(id);
    let updated: string[];
    let isFav = false;
    if (index >= 0) {
      updated = favorites.filter((item) => item !== id);
      isFav = false;
    } else {
      updated = [...favorites, id];
      isFav = true;
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('olma_immo:favorites_updated', { detail: { updated } }));
    return isFav;
  } catch {
    return false;
  }
}
