// Custom luxury styling for Google Maps aligned with Olmart aesthetic:
// Warm cream landcover, soft emerald waters, crisp stone roads, and uncluttered labels.
export const OLMART_LUXURY_MAP_STYLES = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#fbf9f5' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#2b3a36' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }, { weight: 2 }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0d281e' }, { weight: 'bold' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#edf4f1' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'simplified' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#dbece5' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e5decb' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#f3ede1' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#d8cdb7' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#eef2ee' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#b6ded7' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#165b4c' }],
  },
];

export const formatPriceAlgeria = (price: number, period?: string): string => {
  let suffix = '';
  if (period === 'night') suffix = ' / nuit';
  else if (period === 'month') suffix = ' / mois';

  if (price >= 1_000_000_000) {
    return `${(price / 1_000_000_000).toFixed(1)} Mrd DZD${suffix}`;
  }
  if (price >= 1_000_000) {
    const formatted = (price / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${formatted} M DZD${suffix}`;
  }
  if (price >= 1_000) {
    return `${(price / 1_000).toFixed(0)} k DZD${suffix}`;
  }
  return `${price.toLocaleString()} DZD${suffix}`;
};
