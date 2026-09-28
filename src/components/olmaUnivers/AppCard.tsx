import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Bell,
  Users
} from 'lucide-react';
import { OlmaAppModule } from '../../types/olmaUnivers';
import { getAppIconComponent } from '../../utils/iconRegistry';

interface AppCardProps {
  app: OlmaAppModule;
  lang: 'fr' | 'ar' | 'en';
  onSelect: (app: OlmaAppModule) => void;
}

export const AppCard: React.FC<AppCardProps> = ({ app, lang, onSelect }) => {
  const navigate = useNavigate();
  const IconComponent = getAppIconComponent(app.icon);

  const title = app.title[lang] || app.title.fr;
  const description = app.description[lang] || app.description.fr;
  const isActive = app.status === 'active';

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive && app.targetRoute) {
      if (app.targetRoute.startsWith('http')) {
        window.open(app.targetRoute, '_blank', 'noopener,noreferrer');
      } else {
        navigate(app.targetRoute);
      }
    } else {
      onSelect(app);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      onClick={() => onSelect(app)}
      className="group relative cursor-pointer bg-white rounded-2xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs hover:shadow-md hover:border-zinc-300 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Header de la carte */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${
              app.gradient || 'from-amber-500 to-orange-600'
            } text-white flex items-center justify-center shadow-sm shrink-0`}
          >
            <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
          </div>

          <div className="flex flex-col items-end gap-1">
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {lang === 'ar' ? 'متوفر الآن' : 'Disponible'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                {lang === 'ar' ? 'قيد التطوير' : 'En cours de création'}
              </span>
            )}
          </div>
        </div>

        {/* Titre & Description */}
        <h3 className="text-base sm:text-lg font-bold text-zinc-950 group-hover:text-amber-600 transition-colors mb-1.5 tracking-tight leading-snug">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-zinc-600 line-clamp-2 leading-relaxed mb-4">
          {description}
        </p>

        {/* Tags */}
        {app.tags && app.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {app.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Boutons d'Action */}
      <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
        {app.waitingListCount ? (
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              {app.waitingListCount.toLocaleString()} {lang === 'ar' ? 'مستخدم' : 'inscrits'}
            </span>
          </div>
        ) : (
          <span className="text-xs text-zinc-400 font-medium">Olma Ecosystème</span>
        )}

        {isActive ? (
          <button
            type="button"
            onClick={handleAction}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer border-none"
          >
            <span>{lang === 'ar' ? 'فتح' : lang === 'en' ? 'Open' : 'Ouvrir'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAction}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold transition-all cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>{lang === 'ar' ? 'تنبيه' : lang === 'en' ? 'Notify' : 'Prévenir'}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};
