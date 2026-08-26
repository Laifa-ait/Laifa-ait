import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Phone, Star, Wrench, CheckCircle2 } from 'lucide-react';
import { VerifiedArtisan } from '../../types/bricolage';

interface ArtisanDetailModalProps {
  artisan: VerifiedArtisan | null;
  onClose: () => void;
  onRequestQuote: (artisan: VerifiedArtisan) => void;
  onCall: (artisan: VerifiedArtisan) => void;
}

export const ArtisanDetailModal: React.FC<ArtisanDetailModalProps> = ({
  artisan,
  onClose,
  onRequestQuote,
  onCall
}) => {
  if (!artisan) return null;

  const displayName = artisan.name || artisan.fullName || 'Artisan';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-slate-200 text-slate-900"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black flex items-center justify-center text-2xl shadow-md border-2 border-amber-400 shrink-0">
              {displayName.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">
                  {displayName}
                </h2>
                {artisan.verifiedBadge && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Badge Vérifié ID
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-amber-600">
                {artisan.specialty}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                <div className="flex items-center gap-1 text-amber-500 font-extrabold">
                  <Star className="w-4 h-4 fill-current text-amber-500" />
                  <span>{artisan.rating && typeof artisan.rating === 'number' ? Number(artisan.rating).toFixed(1) : "Aucun avis"}</span>
                </div>
                <span>•</span>
                <span>{artisan.reviewCount || 0} avis vérifiés</span>
                <span>•</span>
                <span>{artisan.completedJobs || 0} chantiers</span>
              </div>
            </div>
          </div>

          {/* Details & Certifications */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-6 text-xs text-slate-700">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
              <span className="font-bold text-slate-500">Zone d'intervention :</span>
              <span className="font-extrabold text-slate-900">{artisan.wilaya} • {artisan.commune}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
              <span className="font-bold text-slate-500">Service d'Urgence SOS :</span>
              <span className="font-extrabold text-emerald-700">
                {artisan.isAvailable24_7 ? 'Disponible 24h/24 & 7j/7' : 'Sur Rendez-vous'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="font-bold text-slate-500">Protection Client :</span>
              <span className="font-extrabold text-amber-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                Couverte par Garantie Olma Safe
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onCall(artisan)}
              className="py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Appeler ({artisan.phone})</span>
            </button>

            <button
              onClick={() => onRequestQuote(artisan)}
              className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 border border-amber-400"
            >
              <Wrench className="w-4 h-4 text-slate-950" />
              <span>Demander une Intervention</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
