import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  BOOKING_CATEGORIES,
  type BookingCategoryCard,
} from '../data/artisanBookingCategories';

export { BOOKING_CATEGORIES, type BookingCategoryCard };

interface ArtisanCategoryBookingGridProps {
  onSelectCategory: (category: BookingCategoryCard) => void;
}

export const ArtisanCategoryBookingGrid: React.FC<ArtisanCategoryBookingGridProps> = ({
  onSelectCategory,
}) => {
  const { t } = useTranslation();

  return (
    <section className="space-y-4 pt-2 pb-6" id="artisan-category-booking-grid">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {t('artisan_grid_title')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {t('artisan_grid_subtitle')}
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full shrink-0 w-fit">
          {t('artisan_grid_coverage')}
        </div>
      </div>

      {/* Grid of Thematic Framed Buttons with Tactile Elastic Motion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {BOOKING_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const ArtComponent = category.artComponent;

          return (
            <motion.div
              key={category.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              onClick={() => onSelectCategory(category)}
              className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-amber-400 p-3 sm:p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden"
            >
              {/* Image / Artistic Model Frame Container */}
              <div className="relative w-full h-40 sm:h-44 rounded-2xl overflow-hidden mb-3 bg-slate-950">
                {ArtComponent ? (
                  <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
                    <ArtComponent className="w-full h-full" />
                  </div>
                ) : (
                  <>
                    <img
                      src={category.image}
                      alt={category.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    {/* Gradient Shadow Overlay for standard images */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  </>
                )}

                {/* Floating Badge */}
                <span
                  className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm z-20 ${category.badgeColor}`}
                >
                  {category.badge}
                </span>

                {/* Icon Circle */}
                <span className="absolute bottom-2.5 left-2.5 w-8 h-8 rounded-xl bg-white/90 backdrop-blur-xs text-slate-900 flex items-center justify-center shadow-md z-20">
                  <Icon className="w-4 h-4 text-amber-600" />
                </span>
              </div>

              {/* Textual Details */}
              <div className="space-y-1.5 px-1 flex-1">
                <h3 className="font-black text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {category.summary}
                </p>
              </div>

              {/* Bottom CTA Button Frame with Olmart Orange Accent */}
              <div className="mt-4 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center justify-between shadow-xs transition-all"
                >
                  <span>{t('artisan_grid_book_cta', 'Réserver / Publier l\'annonce')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
