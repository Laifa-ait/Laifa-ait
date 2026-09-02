import React from 'react';
import { Heart, MapPin, Share2 } from 'lucide-react';
import { RealEstateProperty } from '../../types/realEstate';

interface PropertyGalleryAndHeaderProps {
  property: RealEstateProperty;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  activeImageIndex: number;
  setActiveImageIndex: (index: number) => void;
  formatPriceDisplay: (price: number, period?: string, listingType?: string) => string;
}

export const PropertyGalleryAndHeader: React.FC<PropertyGalleryAndHeaderProps> = ({
  property,
  isFavorite,
  onToggleFavorite,
  activeImageIndex,
  setActiveImageIndex,
  formatPriceDisplay,
}) => {
  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Découvrez cette annonce sur Olma Immo : ${property.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien de l\'annonce copié dans le presse-papiers.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              {property.listingType === 'sale' ? 'Vente' : property.listingType === 'rent_short' ? 'Courte durée' : 'Location'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Réf. #{property.id.slice(0, 8)}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {property.title}
          </h1>
          <p className="text-sm text-slate-600 flex items-center gap-1 mt-1 font-medium">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{property.location.commune}, {property.location.wilaya}</span>
            {property.location.address && (
              <span className="text-slate-400">({property.location.address})</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Partager l'annonce"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onToggleFavorite}
            className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
              isFavorite
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Image & Thumbnails */}
      <div className="space-y-2">
        <div className="relative aspect-16/9 sm:aspect-21/9 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs">
          <img loading="lazy" decoding="async" src={images[activeImageIndex] || images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            {activeImageIndex + 1} / {images.length}
          </div>
          <div className="absolute bottom-3 left-3 bg-emerald-900/90 backdrop-blur-xs text-white text-base sm:text-lg font-black px-3.5 py-1.5 rounded-xl shadow-md">
            {formatPriceDisplay(property.price, property.pricePeriod, property.listingType)}
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  activeImageIndex === idx ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img loading="lazy" decoding="async" src={img} alt={`Miniature ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
