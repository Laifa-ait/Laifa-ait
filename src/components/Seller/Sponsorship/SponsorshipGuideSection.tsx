import React from "react";
import { useTranslation } from "react-i18next";
import { HelpCircle, Sparkles, Zap, TrendingUp, CheckCircle2, Clock } from "lucide-react";

export const SponsorshipGuideSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-white rounded-3xl border border-orange-100 p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3.5 border-b border-orange-100 pb-4">
        <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-900 uppercase tracking-wide">
            {t("Comment fonctionne le Sponsoring OLMART ?")}
          </h3>
          <p className="text-xs text-zinc-500">
            {t("Comprendre nos Packs Bronze, Silver & Gold et l'algorithme de priorité.")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Features & Visibilité */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" /> {t("1. Packs & Avantages Visibilité")}
          </h4>
          <div className="space-y-3">
            <div className="bg-white/90 border border-zinc-100 p-3.5 rounded-2xl flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                <Zap className="w-4 h-4 fill-orange-500 text-orange-500" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-zinc-950">{t("Badges Multi-Niveaux (Bronze, Silver, Gold)")}</h5>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {t("Choisissez votre puissance de boost algorithmique de 1.5x à 5x et vos emplacements privilégiés.")}
                </p>
              </div>
            </div>

            <div className="bg-white/90 border border-zinc-100 p-3.5 rounded-2xl flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-zinc-950">{t("Validation & Activation Rapide")}</h5>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {t("Soumettez votre demande de pack sponsoring pour validation prioritaire par notre équipe.")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Parcours */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" /> {t("2. Processus d'Activation & Suivi")}
          </h4>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
              <div>
                <h5 className="font-bold text-xs text-zinc-950">{t("Sélection du produit & Pack")}</h5>
                <p className="text-[11px] text-zinc-500 mt-0.5">{t("Sélectionnez la durée (7j, 14j, 30j) et soumettez votre candidature.")}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</div>
              <div>
                <h5 className="font-bold text-xs text-zinc-950">{t("Validation & Mise en Ligne")}</h5>
                <p className="text-[11px] text-zinc-500 mt-0.5">{t("Validation par l'administration et boost immédiat sur OLMART.")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
