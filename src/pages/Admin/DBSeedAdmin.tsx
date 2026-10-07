import React, { useState, useEffect, useCallback } from "react";
import { Database, Plus, Trash2, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { apiGet, apiPost } from "../../lib/api";

interface SeedStatusResponse {
  success: boolean;
  count: number;
}

interface SeedActionResponse {
  success: boolean;
  count?: number;
  deletedCount?: number;
  message?: string;
  error?: string;
}

export const DBSeedAdmin: React.FC = () => {
  const { t } = useTranslation();
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [seedCount, setSeedCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const fetchSeedCount = useCallback(async () => {
    setLoadingCount(true);
    try {
      const res = await apiGet<SeedStatusResponse>("/api/v1/admin/seed/status");
      if (res && typeof res.count === "number") {
        setSeedCount(res.count);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération du statut seed:", err);
    } finally {
      setLoadingCount(false);
    }
  }, []);

  useEffect(() => {
    fetchSeedCount();
  }, [fetchSeedCount]);

  const handleSeed = async () => {
    setSeeding(true);
    const tId = toast.loading("Génération des produits de démonstration...");
    try {
      const res = await apiPost<SeedActionResponse>("/api/v1/admin/seed/generate");
      if (res && res.success) {
        toast.success(res.message || "Produits générés avec succès !", { id: tId });
        await fetchSeedCount();
      } else {
        toast.error(res?.error || "Échec de la génération.", { id: tId });
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur serveur";
      toast.error(msg, { id: tId });
    } finally {
      setSeeding(false);
    }
  };

  const executeClear = async () => {
    setShowConfirmClear(false);
    setClearing(true);
    const tId = toast.loading("Nettoyage complet des produits de démonstration...");
    try {
      const res = await apiPost<SeedActionResponse>("/api/v1/admin/seed/clear");
      if (res && res.success) {
        toast.success(res.message || `${res.deletedCount || 0} produits supprimés avec succès !`, { id: tId });
        await fetchSeedCount();
      } else {
        toast.error(res?.error || "Échec du nettoyage.", { id: tId });
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur serveur";
      toast.error(msg, { id: tId });
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8" id="db-seed-admin-page">
      <div>
        <h1 className="text-3xl font-sans font-bold text-zinc-900 tracking-tighter rtl:tracking-normal uppercase">
          {t("Base de données")}
        </h1>
        <p className="text-zinc-500 font-medium mt-2">
          {t("Gérez les données de démonstration (Seed) pour le catalogue produit Olma.")}
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 end-0 p-12 opacity-[0.03] pointer-events-none">
          <Database className="w-64 h-64" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                <Database className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-sans font-bold text-zinc-900">
                  {t("Remplissage Automatique (Seed)")}
                </h3>
                <p className="text-sm font-medium text-zinc-500 mt-1 max-w-lg leading-relaxed">
                  {t(
                    "Injectez les produits phares du terroir algérien (Miel de Ghardaïa, Vase d'Aït Yenni, Tapis de Constantine...) pour peupler immédiatement la marketplace sans créer de faux comptes vendeurs."
                  )}
                </p>
              </div>
            </div>

            {/* Live Counter Badge */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Produits Démo Actifs
                </span>
                <span className="text-lg font-black text-zinc-900">
                  {loadingCount ? "..." : seedCount !== null ? seedCount : "0"}
                </span>
              </div>
              <button
                type="button"
                onClick={fetchSeedCount}
                disabled={loadingCount}
                aria-label="Actualiser le compteur"
                className="p-2 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loadingCount ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleSeed}
              disabled={seeding || clearing}
              className="w-full sm:w-auto px-8 py-4 bg-zinc-950 text-white rounded-3xl font-sans font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-950/10 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
            >
              {seeding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {seeding ? "Injection..." : "Générer les Produits"}
            </button>

            {!showConfirmClear ? (
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                disabled={seeding || clearing || seedCount === 0}
                className="w-full sm:w-auto px-8 py-4 bg-red-50 text-red-600 border border-red-200 rounded-3xl font-sans font-bold text-[11px] uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
              >
                {clearing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                {clearing ? "Suppression..." : "Nettoyer le Seed"}
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto p-1.5 bg-red-50 border-2 border-red-300 rounded-3xl">
                <button
                  type="button"
                  onClick={executeClear}
                  disabled={clearing}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-2xl text-[11px] font-bold uppercase tracking-wider hover:bg-red-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmer la suppression ({seedCount ?? "tous"})
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmClear(false)}
                  disabled={clearing}
                  className="px-3.5 py-2.5 bg-white text-zinc-600 border border-zinc-200 rounded-2xl text-[11px] font-bold hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 mt-4">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-amber-800 leading-relaxed">
              {t("Ces produits sont identifiés sous le compte vendeur restreint \"")}
              <span className="font-sans font-bold">admin_seed</span>
              {t("\". Le bouton de nettoyage supprime directement tous les produits de démonstration de la base de données sans impacter les vrais vendeurs.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
