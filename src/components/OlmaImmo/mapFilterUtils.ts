import { PublicPropertyDTO, PropertyMapResult } from '../../types/realEstate';
import { MapFilterCategory } from './MapCategoryFilterBar';

export function filterPropertiesByCategory(
  properties: (PublicPropertyDTO | PropertyMapResult)[],
  activeFilter: MapFilterCategory
): (PublicPropertyDTO | PropertyMapResult)[] {
  if (activeFilter === 'all') return properties;
  return properties.filter((p) => {
    if (activeFilter === 'sale') return p.listingType === 'sale';
    if (activeFilter === 'rent') return p.listingType === 'rent_long' || p.listingType === 'rent_short';
    if (activeFilter === 'house') return p.propertyType === 'villa' || p.propertyType === 'house';
    if (activeFilter === 'commercial') return p.propertyType === 'commercial' || p.propertyType === 'office';
    return true;
  });
}
