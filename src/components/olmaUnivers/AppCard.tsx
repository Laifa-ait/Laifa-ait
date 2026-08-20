import React from 'react';
import { motion } from 'motion/react';
import {
  Wrench,
  Home,
  Car,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
  Briefcase,
  Sparkles,
  ArrowRight,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { OlmaAppModule } from '../../types/olmaUnivers';

interface AppCardProps {
  app: OlmaAppModule;
  lang: 'fr' | 'ar' | 'en';
  onSelect: (app: OlmaAppModule) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Wrench,
  Home,
  Car,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
  Briefcase
};

export const AppCard: React.FC<AppCardProps> = ({ app, lang, onSelect }) => {
  const IconComponent = ICON_MAP[app.icon] || Sparkles;

  const title = app.title[lang] || app.title.fr;
  const description = app.description[lang] || app.description.fr;
  const badge = app.badge ? (app.badge[lang] || app.badge.fr) : null;

  const getStatusBadge = () => {
    switch (app.status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'متوفر' : 'Disponible'}
          </span>
        );
      case 'beta':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'تجريبي' : 'Version Beta'}
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'صيانة' : 'Maintenance'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'قريباً' : 'Bientôt'}
          </span>
        );
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(app)}
      className="group relative cursor-pointer bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-orange-500/30 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-indigo-500/10 dark:from-orange-500/20 dark:to-indigo-500/20 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-sm">
            <IconComponent className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="flex flex-col items-end gap-1">
            {getStatusBadge()}
            {badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {badge}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-1">
          {title}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {description}
        </p>
      </div>

      <div>
        {app.tags && app.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {app.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          {app.waitingListCount ? (
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Users className="w-3.5 h-3.5 text-orange-500" />
              {app.waitingListCount.toLocaleString()} {lang === 'ar' ? 'مهتم' : 'inscris'}
            </span>
          ) : (
            <span className="text-slate-400">Ecosystème Olma</span>
          )}

          <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1">
            {app.status === 'active' ? (lang === 'ar' ? 'دخول' : 'Explorer') : (lang === 'ar' ? 'تفاصيل' : 'Découvrir')}
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};
