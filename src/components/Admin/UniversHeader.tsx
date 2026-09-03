import React from 'react';
import { Sparkles, Plus, Database, RefreshCw, Search } from 'lucide-react';

interface UniversHeaderProps {
  loading: boolean;
  totalApps: number;
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (val: string) => void;
  onStatusFilterChange: (val: string) => void;
  onNewApp: () => void;
  onSeed: () => void;
  onRefresh: () => void;
}

export const UniversHeader: React.FC<UniversHeaderProps> = ({
  loading,
  totalApps,
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onNewApp,
  onSeed,
  onRefresh
}) => {
  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <Sparkles className="w-5 h-5 fill-current" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Dashboard Admin Olma
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Gestion des Applications & Raccourcis Accueil
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Personnalisez les icônes, dégradés, badges et routes des applications de l'écosystème
            et de la barre d'accueil en direct.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onNewApp}
            className="px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Application</span>
          </button>
          <button
            type="button"
            onClick={onSeed}
            className="px-3.5 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Database className="w-4 h-4 text-orange-500" />
            <span>Réinitialiser (Seed)</span>
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="p-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-colors"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Filtrer une application..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-zinc-400 font-semibold">Statut :</span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl"
          >
            <option value="all">Tous les statuts ({totalApps})</option>
            <option value="active">Actif</option>
            <option value="beta">Beta</option>
            <option value="coming_soon">Bientôt</option>
            <option value="maintenance">Maintenance</option>
            <option value="hidden">Masqué</option>
          </select>
        </div>
      </div>
    </>
  );
};
