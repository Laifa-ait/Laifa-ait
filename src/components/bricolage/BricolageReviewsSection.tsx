import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { BricolageReview } from '../../types/bricolage';

interface BricolageReviewsSectionProps {
  reviews: BricolageReview[];
}

export const BricolageReviewsSection: React.FC<BricolageReviewsSectionProps> = ({ reviews }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-800 bg-amber-400/20 px-2.5 py-1 rounded border border-amber-300">
            Avis Clients Contrôlés
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">
            Retours d'expériences en Algérie
          </h2>
        </div>
        <p className="text-xs font-semibold text-slate-500 max-w-sm">
          Avis réels collectés automatiquement après la réalisation et le règlement de chaque prestation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-amber-400 shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(rev.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-slate-400">{rev.date}</span>
              </div>

              <p className="text-xs text-slate-700 italic leading-relaxed mb-4 font-medium">
                "{rev.comment}"
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-slate-900 block">{rev.clientName}</span>
                <span className="text-[11px] text-slate-500 font-medium">{rev.wilaya}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  {rev.serviceName}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
