import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Edit, Eye, MapPin, Trash2 } from 'lucide-react';
import { RealEstateProperty } from '../../types/realEstate';

interface OwnerPropertyCardProps {
  property: RealEstateProperty;
  onDelete: (id: string, title: string) => void;
  formatPrice: (price: number, period?: string, listingType?: string) => string;
}

export const OwnerPropertyCard: React.FC<OwnerPropertyCardProps> = ({
  property,
  onDelete,
  formatPrice,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Publiée</span>;
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">En attente</span>;
      case 'draft':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Brouillon</span>;
      case 'rented':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Loué</span>;
      case 'sold':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Vendu</span>;
      case 'archived':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-600">Archivée</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const imageSrc = property.images && property.images.length > 0
    ? property.images[0]
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row">
      {/* Thumbnail */}
      <div className="sm:w-56 h-48 sm:h-auto relative shrink-0 bg-slate-100">
        <img src={imageSrc} alt={property.title} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2">{getStatusBadge(property.status)}</div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base font-bold text-slate-900 line-clamp-1">{property.title}</h3>
            <span className="text-sm font-extrabold text-emerald-800 shrink-0">
              {formatPrice(property.price, property.pricePeriod, property.listingType)}
            </span>
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{property.location.commune}, {property.location.wilaya}</span>
          </p>

          <div className="flex flex-wrap gap-2 text-xs text-slate-600 mb-4">
            <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              {property.areaSquareMeters || property.area} m²
            </span>
            {property.rooms && (
              <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                F{property.rooms} ({property.rooms} pièces)
              </span>
            )}
            <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.viewsCount || 0} vues</span>
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Modifié le {new Date(property.updatedAt).toLocaleDateString('fr-FR')}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/immo/property/${property.id}`}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Voir l'annonce publique"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <Link
              to={`/immo/edit/${property.id}`}
              className="p-2 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Modifier l'annonce"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => onDelete(property.id, property.title)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Supprimer l'annonce"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
