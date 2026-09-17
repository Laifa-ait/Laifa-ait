// Custom modern styling for Google Maps aligned with Olma Immo aesthetic:
// Clean slate landcover (#f8fafc), royal blue typography (#1e3a8a), crisp slate roads, and soft sky-blue waters.
export const OLMART_LUXURY_MAP_STYLES = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f8fafc' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#334155' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }, { weight: 2 }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1e3a8a' }, { weight: 'bold' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#f1f5f9' }],
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
    stylers: [{ color: '#e2e8f0' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e2e8f0' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#f1f5f9' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#f8fafc' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#dbeafe' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1e3a8a' }],
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
