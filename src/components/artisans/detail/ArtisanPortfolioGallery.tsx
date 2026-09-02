import React from 'react';
import { Camera } from 'lucide-react';
import { ArtisanPortfolioItem } from '../../../types/artisan';

interface ArtisanPortfolioGalleryProps {
  portfolio?: ArtisanPortfolioItem[];
}

export const ArtisanPortfolioGallery: React.FC<ArtisanPortfolioGalleryProps> = ({
  portfolio = [],
}) => {
  if (portfolio.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Camera className="w-5 h-5 text-amber-500" />
        <h2 className="text-base font-black text-slate-900">Portfolio & Réalisations</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {portfolio.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden"
          >
            <div className="h-44 overflow-hidden">
              <img loading="lazy" decoding="async" src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3.5 space-y-1">
              <h3 className="font-extrabold text-xs text-slate-900 line-clamp-1">{item.title}</h3>
              {item.description && (
                <p className="text-[11px] text-slate-500 line-clamp-2">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
