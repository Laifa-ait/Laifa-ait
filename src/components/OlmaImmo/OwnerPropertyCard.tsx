import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Edit, Eye, Trash2, PauseCircle, PlayCircle } from 'lucide-react';
import { StoredProperty, PropertyStatus } from '../../types/realEstate';
import {
  OlmaCard,
  OlmaButton,
  PropertyPrice,
  PropertyLocation,
  PropertyBadge,
  PropertyMeta,
} from './primitives';

interface OwnerPropertyCardProps {
  property: StoredProperty;
  onDelete?: (id: string, title: string) => void;
  onUpdateStatus?: (id: string, status: PropertyStatus) => void;
  formatPrice?: (price: number, period?: string, listingType?: string) => string;
}

export const OwnerPropertyCard: React.FC<OwnerPropertyCardProps> = ({
  property,
  onDelete,
  onUpdateStatus,
}) => {
  const imageSrc =
    property.images && property.images.length > 0
      ? property.images[0]
      : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80';

  const formattedDate = property.updatedAt
    ? new Date(property.updatedAt).toLocaleDateString('fr-FR')
    : new Date().toLocaleDateString('fr-FR');

  return (
    <OlmaCard
      variant="default"
      radius="2xl"
      elevation="subtle"
      bordered
      borderVariant="default"
      className="transition-all hover:shadow-[var(--olma-shadow-card)] flex flex-col sm:flex-row overflow-hidden group"
    >
      {/* Thumbnail & Badges */}
      <div className="sm:w-56 h-48 sm:h-auto relative shrink-0 bg-stone-100 overflow-hidden">
        <img
          loading="lazy"
          decoding="async"
          src={imageSrc}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          <PropertyBadge type="status" value={property.status} size="sm" dot />
          <PropertyBadge type="listingType" value={property.listingType} size="sm" />
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="text-base font-bold text-stone-900 line-clamp-1 font-['Playfair_Display',serif]">
              {property.title}
            </h3>
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

          <PropertyMeta
            rooms={property.rooms}
            areaSquareMeters={property.areaSquareMeters || property.area}
            bathrooms={property.bathrooms}
            viewsCount={property.viewsCount}
            layout="inline"
            size="sm"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 gap-2">
          <div className="text-[11px] text-stone-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Mis à jour le {formattedDate}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <OlmaButton
              as={Link}
              to={`/immo/property/${property.id}`}
              variant="ghost"
              size="icon"
              radius="lg"
              aria-label="Voir l'annonce"
              title="Voir l'annonce"
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

            {onUpdateStatus && (
              property.status === 'active' ? (
                <OlmaButton
                  variant="ghost"
                  size="icon"
                  radius="lg"
                  onClick={() => onUpdateStatus(property.id, 'paused')}
                  aria-label="Mettre en pause"
                  title="Mettre en pause"
                  className="text-amber-600 hover:bg-amber-50"
                >
                  <PauseCircle className="w-4 h-4" />
                </OlmaButton>
              ) : (
                <OlmaButton
                  variant="ghost"
                  size="icon"
                  radius="lg"
                  onClick={() => onUpdateStatus(property.id, 'active')}
                  aria-label="Activer l'annonce"
                  title="Activer l'annonce"
                  className="text-emerald-600 hover:bg-emerald-50"
                >
                  <PlayCircle className="w-4 h-4" />
                </OlmaButton>
              )
            )}

            {onDelete && (
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
            )}
          </div>
        </div>
      </div>
    </OlmaCard>
  );
};

