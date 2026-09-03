import React from "react";
import { TrendingUp, HelpCircle, RefreshCw, Play } from "lucide-react";
import { AgentModalConfig, GrowthReport } from "../AgentConfigModal";

interface GrowthConfigTabProps {
  modalConfig: AgentModalConfig;
  setModalConfig: React.Dispatch<React.SetStateAction<AgentModalConfig | null>>;
  runGrowthAnalysis: () => Promise<void>;
  isRunningAgent: boolean;
  growthReport: GrowthReport | null;
  t: (key: string) => string;
}

export const GrowthConfigTab: React.FC<GrowthConfigTabProps> = ({
  modalConfig,
  setModalConfig,
  runGrowthAnalysis,
  isRunningAgent,
  growthReport,
  t,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-start">
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">
          {t("Paramètres de l'Agent")}
        </h4>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-500">
            {t("Catégorie à Cibler")}
          </label>
          <select
            value={modalConfig.focusCategory || "Tout"}
            onChange={(e) =>
              setModalConfig({ ...modalConfig, focusCategory: e.target.value })
            }
            className="px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="Tout">{t("Toutes les catégories")}</option>
            <option value="Traditionnel">{t("Artisanat & Traditionnel")}</option>
            <option value="Cosmétiques">{t("Cosmétiques & Beauté")}</option>
            <option value="Épices/Gastronomie">
              {t("Épices & Gastronomie Algérienne")}
            </option>
            <option value="Bijoux/Maroquinerie">{t("Bijoux & Maroquinerie")}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-500">
            {t("Contexte du Marché Algérien")}
          </label>
          <textarea
            rows={5}
            value={modalConfig.marketContext || ""}
            onChange={(e) =>
              setModalConfig({ ...modalConfig, marketContext: e.target.value })
            }
            placeholder={t(
              "Saisissez des d'informations clés sur la saisonnalité, la monnaie..."
            )}
            className="px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-500">
            {t("Fréquence de Réévaluation")}
          </label>
          <select
            value={modalConfig.analysisFrequency || "daily"}
            onChange={(e) =>
              setModalConfig({ ...modalConfig, analysisFrequency: e.target.value })
            }
            className="px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="hourly">{t("Toutes les heures")}</option>
            <option value="daily">{t("Chaque jour (conseillé)")}</option>
            <option value="weekly">{t("Chaque semaine")}</option>
          </select>
        </div>

        <button
          onClick={runGrowthAnalysis}
          disabled={isRunningAgent}
          className="w-full py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer disabled:bg-zinc-300"
        >
          {isRunningAgent ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              {t("Analyse en cours par Gemini...")}
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              {t("Lancer l'analyse stratégique")}
            </>
          )}
        </button>
      </div>

      {/* Results panel */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-start min-h-[300px]">
        <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          {t("Rapport Stratégique Généré")}
        </h4>

        {!growthReport && !isRunningAgent && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-200 rounded-2xl">
            <HelpCircle className="w-8 h-8 text-zinc-300 mb-2" />
            <p className="text-xs font-medium text-zinc-500">
              {t(
                "Cliquez sur le bouton de gauche pour générer un rapport commercial réel via Gemini."
              )}
            </p>
          </div>
        )}

        {isRunningAgent && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-xs font-bold text-blue-600 animate-pulse uppercase tracking-wider">
              {t("Extraction des données + Diagnostic IA...")}
            </span>
          </div>
        )}

        {growthReport && (
          <div className="space-y-4 text-sm overflow-y-auto max-h-[350px] pr-2">
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-zinc-700 text-xs leading-relaxed">
              <strong className="text-blue-900 block mb-1">
                💡 {t("Synthèse Globale :")}
              </strong>
              {growthReport.summary}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {growthReport.kpis?.map((kpi, idx) => (
                <div
                  key={idx}
                  className="border border-zinc-100 p-3 rounded-2xl bg-zinc-50"
                >
                  <span className="text-xs text-zinc-400 font-bold uppercase block">
                    {kpi.label}
                  </span>
                  <span className="text-base font-sans font-bold text-zinc-800 block">
                    {kpi.value}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      kpi.trend === "up" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {kpi.change}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <strong className="text-xs font-bold text-zinc-700 block">
                🔑 {t("Mots-clés chauds en Algérie (58 Wilayas) :")}
              </strong>
              <div className="flex flex-wrap gap-1.5">
                {growthReport.topSearches?.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-zinc-100 text-zinc-700 text-xs rounded-lg font-bold uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-3 space-y-2">
              <strong className="text-xs font-bold text-zinc-700 block">
                🎯 {t("Conseils d'Optimisation :")}
              </strong>
              <p className="text-xs text-zinc-600 leading-relaxed italic">
                {growthReport.pricingTips}
              </p>
            </div>

            <div className="bg-green-50/30 p-4 rounded-2xl border border-green-100">
              <strong className="text-green-900 text-xs block mb-1">
                🏁 {t("Plan d'Action Direct :")}
              </strong>
              <p className="text-xs text-zinc-700 font-medium">
                {growthReport.actionableAdvice}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
