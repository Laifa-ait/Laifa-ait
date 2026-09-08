import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Edit, Eye, Trash2 } from 'lucide-react';
import { RealEstateProperty } from '../../types/realEstate';
import {
  OlmaCard,
  OlmaButton,
  PropertyPrice,
  PropertyLocation,
  PropertyBadge,
} from './primitives';

interface OwnerPropertyCardProps {
  property: RealEstateProperty;
  onDelete: (id: string, title: string) => void;
  formatPrice?: (price: number, period?: string, listingType?: string) => string;
}

export const OwnerPropertyCard: React.FC<OwnerPropertyCardProps> = ({
  property,
  onDelete,
}) => {
  const imageSrc =
    property.images && property.images.length > 0
      ? property.images[0]
      : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80';

  return (
    <OlmaCard
      variant="default"
      radius="2xl"
      elevation="subtle"
      bordered
      borderVariant="default"
      className="transition-all hover:shadow-[var(--olma-shadow-card)] flex flex-col sm:flex-row overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="sm:w-56 h-48 sm:h-auto relative shrink-0 bg-stone-100">
        <img
          loading="lazy"
          decoding="async"
          src={imageSrc}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2">
          <PropertyBadge type="status" value={property.status} size="sm" dot />
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base font-bold text-stone-900 line-clamp-1">{property.title}</h3>
            <PropertyPrice
              price={property.price}
              period={property.pricePeriod}
              listingType={property.listingType}
              size="sm"
              variant="mineral"
            />
          </div>

          <PropertyLocation
            commune={property.location.commune}
            wilaya={property.location.wilaya}
            size="xs"
            variant="muted"
            className="mb-3"
          />

          <div className="flex flex-wrap gap-2 text-xs text-stone-600 mb-4">
            <span className="bg-[#FAF8F5] px-2 py-1 rounded-md border border-[#E8E2D4]">
              {property.areaSquareMeters || property.area} m²
            </span>
            {property.rooms && (
              <span className="bg-[#FAF8F5] px-2 py-1 rounded-md border border-[#E8E2D4]">
                F{property.rooms} ({property.rooms} pièces)
              </span>
            )}
            <span className="bg-[#FAF8F5] px-2 py-1 rounded-md border border-[#E8E2D4] flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-stone-400" />
              <span>{property.viewsCount || 0} vues</span>
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <div className="text-[11px] text-stone-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Modifié le {new Date(property.updatedAt).toLocaleDateString('fr-FR')}</span>
          </div>

          <div className="flex items-center gap-2">
            <OlmaButton
              as={Link}
              to={`/immo/property/${property.id}`}
              variant="ghost"
              size="icon"
              radius="lg"
              aria-label="Voir l'annonce publique"
              title="Voir l'annonce publique"
            >
              <Eye className="w-4 h-4 text-stone-600" />
            </OlmaButton>
            <OlmaButton
              as={Link}
              to={`/immo/edit/${property.id}`}
              variant="ghost"
              size="icon"
              radius="lg"
              aria-label="Modifier l'annonce"
              title="Modifier l'annonce"
            >
              <Edit className="w-4 h-4 text-emerald-700" />
            </OlmaButton>
            <OlmaButton
              variant="ghost"
              size="icon"
              radius="lg"
              onClick={() => onDelete(property.id, property.title)}
              className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
              aria-label="Supprimer l'annonce"
              title="Supprimer l'annonce"
            >
              <Trash2 className="w-4 h-4" />
            </OlmaButton>
          </div>
        </div>
      </div>
    </OlmaCard>
  );
};
