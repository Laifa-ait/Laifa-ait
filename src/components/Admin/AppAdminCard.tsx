import React from 'react';
import { motion } from 'motion/react';
import { Palette, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { OlmaAppModule, OlmaAppStatus } from '../../types/olmaUnivers';
import { getAppIconComponent } from '../../utils/iconRegistry';

interface AppAdminCardProps {
  app: OlmaAppModule;
  isSaving: boolean;
  onEdit: (app: OlmaAppModule) => void;
  onQuickIconPicker: (app: OlmaAppModule) => void;
  onStatusChange: (app: OlmaAppModule, newStatus: OlmaAppStatus) => void;
  onToggleHomeVisibility: (app: OlmaAppModule) => void;
  onDelete: (app: OlmaAppModule) => void;
}

export const AppAdminCard: React.FC<AppAdminCardProps> = ({
  app,
  isSaving,
  onEdit,
  onQuickIconPicker,
  onStatusChange,
  onToggleHomeVisibility,
  onDelete
}) => {
  const IconComponent = getAppIconComponent(app.icon);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
    >
      <div>
        {/* Top bar with visual Icon Preview and Action buttons */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${
                app.gradient || 'from-sky-400 via-blue-500 to-indigo-600'
              } p-0.5 shadow-md flex items-center justify-center text-white flex-shrink-0`}
            >
              <div className="w-full h-full rounded-[14px] flex items-center justify-center bg-white/10 backdrop-blur-xs">
                <IconComponent className="w-7 h-7 drop-shadow-sm stroke-[2.2]" />
              </div>
              {app.badge?.fr && (
                <span
                  className={`absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold shadow-sm uppercase ${
                    app.badgeColor || 'bg-red-500 text-white'
                  }`}
                >
                  {app.badge.fr}
                </span>
              )}
            </div>

            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded-md">
                  #{app.order} • {app.category}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base truncate mt-0.5">
                {app.title.fr}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono truncate">{app.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onQuickIconPicker(app)}
              title="Changer icône & style"
              className="p-2 rounded-xl text-slate-500 hover:text-orange-600 hover:bg-orange-500/10 transition-colors"
            >
              <Palette className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(app)}
              title="Modifier l'application"
              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-500/10 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(app)}
              title="Supprimer"
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description & Route Info */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
          {app.description.fr || 'Aucune description fournie.'}
        </p>

        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 space-y-1 mb-3 text-[11px]">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span className="font-medium text-slate-400">Cible :</span>
            <span className="font-mono font-semibold truncate max-w-[170px]">
              {app.targetRoute || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span className="font-medium text-slate-400">Affichage Accueil :</span>
            <button
              type="button"
              onClick={() => onToggleHomeVisibility(app)}
              className={`flex items-center gap-1 font-bold ${
                app.showInHomeShortcuts !== false
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              {app.showInHomeShortcuts !== false ? (
                <>
                  <Eye className="w-3 h-3" /> Visible Accueil
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3" /> Masqué Accueil
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Status Selector */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
          Statut de déploiement :
        </label>
        <select
          value={app.status}
          disabled={isSaving}
          onChange={(e) => onStatusChange(app, e.target.value as OlmaAppStatus)}
          className={`w-full px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
            app.status === 'active'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
              : app.status === 'beta'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <option value="active">Actif & Déployé (Disponible)</option>
          <option value="beta">Version Beta Publique</option>
          <option value="coming_soon">Bientôt Disponible (Waitlist)</option>
          <option value="maintenance">Maintenance</option>
          <option value="hidden">Masqué Complètement</option>
        </select>
      </div>
    </motion.div>
  );
};
