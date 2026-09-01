import { ArtisanProfile } from '../types/artisan';

export interface ArtisanSearchHistoryItem {
  id: string;
  term?: string;
  tradeId?: string;
  tradeName?: string;
  wilaya?: string;
  commune?: string;
  timestamp: string;
}

export interface ArtisanFavoriteItem {
  id: string;
  fullName: string;
  tradeName: string;
  rating: number;
  reviewCount: number;
  wilaya: string;
  commune: string;
  phone: string;
  avatarUrl?: string;
  savedAt: string;
}

const SEARCH_HISTORY_KEY = 'olmart_artisan_search_history_v1';
const FAVORITES_KEY = 'olmart_artisan_favorites_v1';

export function getSearchHistory(): ArtisanSearchHistoryItem[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSearchHistory(item: {
  term?: string;
  tradeId?: string;
  tradeName?: string;
  wilaya?: string;
  commune?: string;
}): void {
  try {
    if (!item.term && !item.tradeId && !item.wilaya) return;
    const history = getSearchHistory();
    const newItem: ArtisanSearchHistoryItem = {
      id: `sh_${Date.now()}`,
      term: item.term?.trim() || undefined,
      tradeId: item.tradeId || undefined,
      tradeName: item.tradeName || undefined,
      wilaya: item.wilaya || undefined,
      commune: item.commune || undefined,
      timestamp: new Date().toISOString(),
    };

    // Remove duplicates
    const filtered = history.filter(
      (h) =>
        h.term !== newItem.term ||
        h.tradeId !== newItem.tradeId ||
        h.wilaya !== newItem.wilaya
    );

    const updated = [newItem, ...filtered].slice(0, 10);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving search history', err);
  }
}

export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (err) {
    console.error('Error clearing search history', err);
  }
}

export function getFavoriteArtisans(): ArtisanFavoriteItem[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isArtisanFavorite(artisanId: string): boolean {
  const favorites = getFavoriteArtisans();
  return favorites.some((f) => f.id === artisanId);
}

export function toggleFavoriteArtisan(artisan: ArtisanProfile): boolean {
  try {
    const favorites = getFavoriteArtisans();
    const exists = favorites.some((f) => f.id === artisan.id);

    if (exists) {
      const updated = favorites.filter((f) => f.id !== artisan.id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return false; // Removed
    } else {
      const newItem: ArtisanFavoriteItem = {
        id: artisan.id,
        fullName: artisan.fullName || artisan.professionalName || 'Artisan',
        tradeName: artisan.tradeName,
        rating: artisan.rating || 5,
        reviewCount: artisan.reviewCount || 0,
        wilaya: artisan.wilaya,
        commune: artisan.commune,
        phone: artisan.phone,
        avatarUrl: artisan.avatarUrl,
        savedAt: new Date().toISOString(),
      };
      const updated = [newItem, ...favorites].slice(0, 30);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return true; // Added
    }
  } catch {
    return false;
  }
}
