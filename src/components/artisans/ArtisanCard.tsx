import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  ShieldCheck,
  Phone,
  Briefcase,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { ArtisanProfile } from '../../types/artisan';
import { isArtisanFavorite, toggleFavoriteArtisan } from '../../services/artisanHistory';
import { QuoteRequestModal } from './QuoteRequestModal';

interface ArtisanCardProps {
  artisan: ArtisanProfile;
  onRequestQuote?: (artisan: ArtisanProfile) => void;
}

export const ArtisanCard: React.FC<ArtisanCardProps> = ({ artisan, onRequestQuote }) => {
  const navigate = useNavigate();
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(isArtisanFavorite(artisan.id));
  }, [artisan.id]);

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = toggleFavoriteArtisan(artisan);
    setIsFav(result);
  };

  const displayAvatar =
    artisan.avatarUrl ||
    `https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150&auto=format&fit=crop&q=80`;

  return (
    <>
      <div
        id={`artisan-card-${artisan.id}`}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group relative"
      >
        {/* Favorite button */}
        <button
          onClick={handleToggleFav}
          className={`absolute top-4 right-4 p-1.5 rounded-full transition-all cursor-pointer ${
            isFav
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50'
          }`}
          title={isFav ? 'Retirer des favoris' : 'Enregistrer cet artisan'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500' : ''}`} />
        </button>

        {/* Top Info: Avatar, Name, Trade, Verified */}
        <div className="space-y-3.5 pr-6">
          <div className="flex items-start gap-3.5">
            <div className="relative shrink-0">
              <img loading="lazy" decoding="async" src={displayAvatar}
                alt={artisan.fullName}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/20 shadow-xs group-hover:scale-105 transition-transform"
              />
              {artisan.status === 'approved' && (
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs"
                  title="Artisan Vérifié Olmart"
                >
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 border border-amber-200/60">
                  {artisan.tradeName}
                </span>
                {artisan.isAvailable ? (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Disponible
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                    Occupé
                  </span>
                )}
              </div>

              <h3
                onClick={() => navigate(`/artisans/profile/${artisan.id}`)}
                className="text-base font-extrabold text-slate-900 truncate hover:text-amber-600 transition-colors cursor-pointer mt-1"
              >
                {artisan.fullName}
              </h3>

              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{artisan.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({artisan.reviewCount || 0})</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 font-medium text-slate-600 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {artisan.commune}, {artisan.wilaya}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Bio Snippet */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {artisan.bio ||
              `Artisan qualifié en ${artisan.tradeName} intervenant à ${artisan.commune} et wilaya de ${artisan.wilaya}. Travail soigné et devis rapide.`}
          </p>

          {/* Specialties Pills */}
          {artisan.specialties && artisan.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {artisan.specialties.slice(0, 3).map((spec, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md truncate max-w-[150px]"
                >
                  {spec}
                </span>
              ))}
              {artisan.specialties.length > 3 && (
                <span className="text-[10px] font-semibold text-slate-400 px-1 py-0.5">
                  +{artisan.specialties.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Experience & stats */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>{artisan.yearsOfExperience || 1} ans d'expérience</span>
            </span>
            {artisan.services && artisan.services.length > 0 && (
              <span className="text-[11px] font-bold text-slate-900">
                Dès {artisan.services[0].priceStartingFrom || 'Sur devis'}{' '}
                {artisan.services[0].priceStartingFrom ? 'DZD' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Actions Bottom Bar */}
        <div className="pt-4 mt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
          {showPhone ? (
            <a
              href={`tel:${artisan.phone}`}
              className="h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{artisan.phone}</span>
            </a>
          ) : (
            <button
              onClick={() => setShowPhone(true)}
              className="h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>Téléphone</span>
            </button>
          )}

          <button
            onClick={() => (onRequestQuote ? onRequestQuote(artisan) : setIsQuoteModalOpen(true))}
            className="h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer group-hover:shadow-sm"
          >
            <span>Devis gratuit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quote Request Modal */}
      {!onRequestQuote && (
        <QuoteRequestModal
          artisan={artisan}
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
        />
      )}
    </>
  );
};
