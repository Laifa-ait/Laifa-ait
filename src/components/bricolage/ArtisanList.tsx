import React from 'react';
import { motion } from 'motion/react';
import { Star, ShieldCheck, MapPin, Phone, Award, Clock } from 'lucide-react';
import { VerifiedArtisan } from '../../types/bricolage';

interface ArtisanListProps {
  artisans: VerifiedArtisan[];
  onCallArtisan: (artisan: VerifiedArtisan) => void;
}

export const ArtisanList: React.FC<ArtisanListProps> = ({ artisans, onCallArtisan }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-700 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
            Réseau Certifié Olma Safe
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">
            Artisans & Professionnels Vérifiés
          </h2>
        </div>
        <p className="text-xs font-semibold text-slate-500 max-w-sm">
          Pièces d'identité vérifiées, diplômes ou agréments contrôlés et évaluations clients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {artisans.map((artisan) => {
          const displayName = artisan.name || artisan.fullName || 'Artisan';
          return (
            <motion.div
              key={artisan.id}
              whileHover={{ y: -3 }}
              className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-md border border-amber-400">
                    {displayName.charAt(0)}
                  </div>
                  {artisan.verifiedBadge && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Vérifié ID
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-slate-900 text-base mb-0.5">
                  {displayName}
                </h3>
                <p className="text-xs font-bold text-amber-600 mb-2">
                  {artisan.specialty}
                </p>

                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mb-3">
                  <Star className="w-4 h-4 fill-current text-amber-500" />
                  <span>{artisan.rating && typeof artisan.rating === 'number' ? Number(artisan.rating).toFixed(1) : "Aucun avis"}</span>
                  <span className="text-slate-400 font-normal">({artisan.reviewCount || 0} avis)</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 font-medium mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{artisan.wilaya} • {artisan.commune}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>{artisan.completedJobs} travaux réalisés</span>
                  </div>
                  {artisan.isAvailable24_7 && (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Disponible 24h/24 & 7j/7</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => onCallArtisan(artisan)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Contacter l'Artisan</span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
