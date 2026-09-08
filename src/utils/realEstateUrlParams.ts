import { FilterState } from '../components/OlmaImmo/SearchFilters';
import {
  ListingType,
  PropertyType,
  LegalPaperType,
  PropertySortOption,
} from '../types/realEstate';

const VALID_LISTING_TYPES: ListingType[] = ['sale', 'rent_long', 'rent_short'];
const VALID_PROPERTY_TYPES: PropertyType[] = [
  'apartment',
  'villa',
  'house',
  'studio',
  'commercial',
  'land',
  'office',
  'room',
  'building',
];
const VALID_SORTS: PropertySortOption[] = ['recent', 'price_asc', 'price_desc', 'popularity'];

export function parseNumberParam(val: string | null): number | undefined {
  if (!val) return undefined;
  const num = Number(val);
  if (isNaN(num) || num < 0 || !isFinite(num)) return undefined;
  return num;
}

export function searchParamsToFilters(searchParams: URLSearchParams): {
  filters: FilterState;
  showFavoritesOnly: boolean;
} {
  const transaction = searchParams.get('transaction') || searchParams.get('type');
  const listingType = VALID_LISTING_TYPES.includes(transaction as ListingType)
    ? (transaction as ListingType)
    : undefined;

  const propType = searchParams.get('propertyType') || searchParams.get('category');
  const propertyType = VALID_PROPERTY_TYPES.includes(propType as PropertyType)
    ? (propType as PropertyType)
    : undefined;

  const wilaya = searchParams.get('wilaya')?.trim() || undefined;
  const commune = searchParams.get('commune')?.trim() || undefined;

  const minPrice = parseNumberParam(searchParams.get('minPrice'));
  const maxPrice = parseNumberParam(searchParams.get('maxPrice'));
  const minRooms = parseNumberParam(searchParams.get('minRooms'));
  const minArea = parseNumberParam(searchParams.get('minArea'));

  const legalPaperType = searchParams.get('legalPaper') as LegalPaperType | null;
  const hasActeNotarie = searchParams.get('hasActeNotarie') === 'true' ? true : undefined;
  const hasLivretFoncier = searchParams.get('hasLivretFoncier') === 'true' ? true : undefined;

  const sortParam = searchParams.get('sort') as PropertySortOption | null;
  const sort = VALID_SORTS.includes(sortParam as PropertySortOption) ? (sortParam as PropertySortOption) : 'recent';

  const showFavoritesOnly = searchParams.get('favorites') === 'true';

  const filters: FilterState = {
    listingType,
    propertyType,
    wilaya,
    commune,
    minPrice,
    maxPrice,
    minRooms,
    minArea,
    legalPaperType: legalPaperType || undefined,
    hasActeNotarie,
    hasLivretFoncier,
    sort,
  };

  return { filters, showFavoritesOnly };
}

export function filtersToSearchParams(
  filters: FilterState,
  showFavoritesOnly = false
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.listingType) params.set('transaction', filters.listingType);
  if (filters.propertyType) params.set('propertyType', filters.propertyType);
  if (filters.wilaya) params.set('wilaya', filters.wilaya);
  if (filters.commune) params.set('commune', filters.commune);

  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    params.set('minPrice', String(filters.minPrice));
  }
  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    params.set('maxPrice', String(filters.maxPrice));
  }
  if (filters.minRooms !== undefined && filters.minRooms > 0) {
    params.set('minRooms', String(filters.minRooms));
  }
  if (filters.minArea !== undefined && filters.minArea > 0) {
    params.set('minArea', String(filters.minArea));
  }

  if (filters.legalPaperType) params.set('legalPaper', filters.legalPaperType);
  if (filters.hasActeNotarie) params.set('hasActeNotarie', 'true');
  if (filters.hasLivretFoncier) params.set('hasLivretFoncier', 'true');

  if (filters.sort && filters.sort !== 'recent') {
    params.set('sort', filters.sort);
  }
  if (showFavoritesOnly) {
    params.set('favorites', 'true');
  }

  return params;
}
