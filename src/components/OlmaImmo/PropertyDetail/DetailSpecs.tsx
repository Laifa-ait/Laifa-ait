import React from 'react';
import { PublicPropertyDTO } from '../../../types/realEstate';
import { PropertyMeta } from '../primitives/PropertyMeta';

interface DetailSpecsProps {
  property: PublicPropertyDTO;
}

export const DetailSpecs: React.FC<DetailSpecsProps> = ({ property }) => {
  return (
    <PropertyMeta
      propertyType={property.propertyType}
      rooms={property.rooms}
      bathrooms={property.bathrooms}
      areaSquareMeters={property.areaSquareMeters}
      layout="grid"
    />
  );
};
