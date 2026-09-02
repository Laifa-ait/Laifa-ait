import React from 'react';
import {
  ShieldCheck,
  MapPin,
  Briefcase,
  Phone,
  MessageCircle,
  FileText,
} from 'lucide-react';
import { ArtisanProfile } from '../../../types/artisan';

interface ArtisanDetailHeroProps {
  artisan: ArtisanProfile;
  onRequestQuote: () => void;
}

export const ArtisanDetailHero: React.FC<ArtisanDetailHeroProps> = ({
  artisan,
  onRequestQuote,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          <img loading="lazy" decoding="async" src={
              artisan.avatarUrl ||
              'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=180&auto=format&fit=crop&q=80'
            }
            alt={artisan.fullName}
            referrerPolicy="no-referrer"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-amber-500/20 shadow-md shrink-0"
          />

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {artisan.professionalName || artisan.fullName}
              </h1>
              {!!artisan.verifiedAt && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase">
                  <ShieldCheck className="w-3 h-3" />
                  Vérifié
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm font-bold text-amber-700">
              {artisan.tradeName}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                {artisan.commune}, {artisan.wilaya}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {artisan.yearsOfExperience || 1} ans d'expérience
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full sm:w-auto">
          <button
            onClick={onRequestQuote}
            className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Demander un Devis Gratuit</span>
          </button>

          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <a
              href={`tel:${artisan.phone}`}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Appeler</span>
            </a>

            {artisan.whatsapp && (
              <a
                href={`https://wa.me/213${artisan.whatsapp.replace(/\D/g, '').slice(-9)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {artisan.bio && (
        <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
          <p className="font-bold text-slate-800 mb-1">Présentation :</p>
          <p>{artisan.bio}</p>
        </div>
      )}
    </div>
  );
};
