import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  Star,
  ShieldCheck,
  Phone,
  ArrowRight,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ArtisanProfile } from '../../types/artisan';
import { isArtisanFavorite, toggleFavoriteArtisan } from '../../services/artisanHistory';
import { PropertyFavoriteButton } from '../OlmaImmo/primitives/PropertyFavoriteButton';
import { QuoteRequestModal } from './QuoteRequestModal';

const TRADE_COVER_FALLBACKS: Record<string, string> = {
  plomberie: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=80',
  electricite: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
  peinture: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
  menuiserie: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&auto=format&fit=crop&q=80',
  serrurerie: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80',
  climatisation: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80',
  maconnerie: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
  etancheite: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
};

interface ArtisanCardProps {
  artisan: ArtisanProfile;
  onRequestQuote?: (artisan: ArtisanProfile) => void;
  className?: string;
}

export const ArtisanCard: React.FC<ArtisanCardProps> = ({
  artisan,
  onRequestQuote,
  className = '',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    setIsFav(isArtisanFavorite(artisan.id));
  }, [artisan.id]);

  const handleToggleFav = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const result = toggleFavoriteArtisan(artisan);
    setIsFav(result);
  };

  const handleCopyOrCallPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (artisan.phone) {
      navigator.clipboard?.writeText(artisan.phone);
      setCopiedPhone(true);
      toast.success(`${t('artisan_card_copied', 'Numéro copié :')} ${artisan.phone}`);
      setTimeout(() => setCopiedPhone(false), 2500);
    }
  };

  const tradeKey = (artisan.tradeName || '').toLowerCase();
  const matchedKey = Object.keys(TRADE_COVER_FALLBACKS).find((k) => tradeKey.includes(k)) || 'default';
  const coverImage =
    artisan.portfolio && artisan.portfolio.length > 0 && artisan.portfolio[0].imageUrl
      ? artisan.portfolio[0].imageUrl
      : TRADE_COVER_FALLBACKS[matchedKey];
  const avatar = artisan.avatarUrl || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150&auto=format&fit=crop&q=80';
  const startingPrice =
    artisan.services && artisan.services.length > 0 && artisan.services[0].priceStartingFrom
      ? `${new Intl.NumberFormat('fr-FR').format(artisan.services[0].priceStartingFrom)} DZD`
      : t('artisan_card_on_quote', 'Sur devis');

  return (
    <>
      <motion.article
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={`group bg-white rounded-2xl overflow-hidden flex flex-col justify-between relative border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(100,116,139,0.14)] transition-all duration-200 ${className}`}
      >
        <div
          onClick={() => navigate(`/artisans/profile/${artisan.id}`)}
          className="cursor-pointer flex flex-col flex-1"
        >
          {/* Top Media Header matching Olma Immo PropertyCard */}
          <div className="relative aspect-16/10 rounded-t-2xl overflow-hidden bg-slate-100">
            <img
              src={coverImage}
              alt={artisan.tradeName}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

            {/* Top-Right: Relocated Favorite Heart Button */}
            <div className="absolute top-2.5 right-2.5 z-10">
              <PropertyFavoriteButton
                isFav={isFav}
                onClick={handleToggleFav}
                size="sm"
                variant="glass"
                className="bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs border-0 shadow-none"
              />
            </div>

            {/* Top-Left: Availability / Status Badge */}
            <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
              {artisan.isAvailable ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/90 text-white backdrop-blur-md shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {t('artisan_card_available', 'Disponible')}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/40 text-white/90 backdrop-blur-md">
                  {t('artisan_card_on_appointment', 'Sur RDV')}
                </span>
              )}
            </div>

            {/* Bottom-Left: Nested Avatar & Verified shield */}
            <div className="absolute bottom-2.5 left-3 z-10 flex items-center gap-2">
              <div className="relative">
                <img
                  src={avatar}
                  alt={artisan.fullName}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md bg-white"
                />
                {artisan.status === 'approved' && (
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs"
                    title={t('artisan_card_verified', 'Artisan vérifié Olmart')}
                  >
                    <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                  </div>
                )}
              </div>
              <div className="text-white drop-shadow-sm">
                <span className="text-[11px] font-bold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
                  {artisan.tradeName}
                </span>
              </div>
            </div>
          </div>

          {/* Typography & Specs in refined slate palette */}
          <div className="p-4 flex-1 flex flex-col justify-between gap-1.5">
            <div>
              {/* Line 1: Name & Rating */}
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-[#1E293B] text-[15px] sm:text-base leading-snug truncate group-hover:text-[#1E3A8A] transition-colors">
                  {artisan.fullName}
                </h3>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{artisan.rating ? artisan.rating.toFixed(1) : '5.0'}</span>
                  <span className="text-slate-400 font-normal text-[11px]">
                    ({artisan.reviewCount || 0})
                  </span>
                </div>
              </div>

              {/* Line 2: Location */}
              <p className="text-xs sm:text-[13px] font-normal text-[#64748B] truncate mt-0.5">
                {artisan.commune ? `${artisan.commune}, ` : ''}{artisan.wilaya}
              </p>

              {/* Line 3: Experience & Specialties */}
              <p className="text-xs font-normal text-[#94A3B8] truncate mt-0.5">
                {artisan.yearsOfExperience || 1} {t('artisan_card_years_exp', 'ans d\'expérience')}
                {artisan.specialties && artisan.specialties.length > 0 && ` • ${artisan.specialties.slice(0, 2).join(', ')}`}
              </p>
            </div>

            {/* Line 4: Pricing */}
            <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
              <span className="text-[11px] font-medium text-slate-500">
                {t('artisan_card_indicative_price', 'Tarif indicatif')}
              </span>
              <span className="text-sm font-bold text-[#1E293B] tracking-tight">
                {startingPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Revamped Button Section with Elegant Placement */}
        <div className="px-4 pb-4 pt-1 flex items-center gap-2">
          {/* Direct Phone Call / Copy Button */}
          {artisan.phone && (
            <button
              type="button"
              onClick={handleCopyOrCallPhone}
              className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title={`${t('artisan_card_call_or_copy', 'Appeler ou copier :')} ${artisan.phone}`}
              aria-label="Contacter par téléphone"
            >
              {copiedPhone ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Phone className="w-4 h-4 text-slate-600" />
              )}
            </button>
          )}

          {/* Prominent Primary Call-To-Action Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onRequestQuote) {
                onRequestQuote(artisan);
              } else {
                setIsQuoteModalOpen(true);
              }
            }}
            className="flex-1 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer select-none"
          >
            <span>{t('artisan_card_quote_free', 'Devis gratuit')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950 stroke-[2.2] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-transform" />
          </button>
        </div>
      </motion.article>

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
