import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, RefreshCw, CheckCircle2, Wrench, Home, Car, ShoppingBag, Truck, UtensilsCrossed, Briefcase, Database } from 'lucide-react';
import { OlmaAppModule } from '../../types/olmaUnivers';
import { fetchOlmaUniversApps, updateAdminOlmaApp, seedAdminOlmaApps } from '../../services/olmaUnivers.api';

const ICON_MAP: Record<string, React.ElementType> = {
  Wrench,
  Home,
  Car,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
  Briefcase
};

export function UniversAdmin(): React.ReactElement {
  const [apps, setApps] = useState<OlmaAppModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchOlmaUniversApps();
    setApps(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (app: OlmaAppModule, newStatus: OlmaAppModule['status']) => {
    setSavingId(app.id);
    const updated = { ...app, status: newStatus };
    const res = await updateAdminOlmaApp(updated);
    if (res.success) {
      setApps(prev => prev.map(a => a.id === app.id ? updated : a));
      setMsg(`Statut mis à jour pour ${app.title.fr}`);
    } else {
      setMsg(`Erreur: ${res.message}`);
    }
    setSavingId(null);
  };

  const handleSeed = async () => {
    setLoading(true);
    const res = await seedAdminOlmaApps();
    setMsg(res.message);
    await loadData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <Sparkles className="w-5 h-5 fill-current" />
            <span className="text-xs font-bold uppercase tracking-widest">Dashboard Admin Olma</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Gestion des Applications Olma Univers
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configurez les sous-applications (Bricolage, Immo, Auto, Logistique) de l'écosystème Olmart.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Database className="w-4 h-4 text-orange-500" />
            <span>Initialiser Firestore (Seed)</span>
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </header>

      {msg && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-300 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => {
          const IconComponent = ICON_MAP[app.icon] || Sparkles;
          return (
            <motion.div
              key={app.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {app.title.fr}
                    </h3>
                    <span className="text-xs text-slate-400">ID: {app.id}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {app.description.fr}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                  Statut de l'application :
                </label>
                <select
                  value={app.status}
                  disabled={savingId === app.id}
                  onChange={(e) => handleStatusChange(app, e.target.value as OlmaAppModule['status'])}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="coming_soon">Bientôt disponible</option>
                  <option value="active">Disponible (Active)</option>
                  <option value="beta">Version Beta</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
