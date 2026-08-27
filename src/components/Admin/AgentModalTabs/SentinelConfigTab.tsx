import React from "react";
import { Zap, RefreshCw, Play } from "lucide-react";
import { AgentModalConfig, SentinelReport } from "../AgentConfigModal";

interface SentinelConfigTabProps {
  modalConfig: AgentModalConfig;
  setModalConfig: React.Dispatch<React.SetStateAction<AgentModalConfig | null>>;
  runSentinelDiagnostic: () => Promise<void>;
  isRunningAgent: boolean;
  sentinelReport: SentinelReport | null;
  t: (key: string) => string;
}

export const SentinelConfigTab: React.FC<SentinelConfigTabProps> = ({
  modalConfig,
  setModalConfig,
  runSentinelDiagnostic,
  isRunningAgent,
  sentinelReport,
  t,
}) => {
  return (
    <div className="space-y-6 text-start">
      {/* Settings section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
            {t("Fréquence de Diagnostic Automatique")}
          </label>
          <select
            value={modalConfig.autoScanInterval || "hourly"}
            onChange={(e) =>
              setModalConfig({ ...modalConfig, autoScanInterval: e.target.value })
            }
            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="realtime">{t("Temps réel (Événementiel)")}</option>
            <option value="hourly">{t("Toutes les heures")}</option>
            <option value="daily">{t("Quotidien (Toutes les 24h)")}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
            {t("Seuil de Tolérance d'Alerte")}
          </label>
          <select
            value={modalConfig.alertThreshold || "warning"}
            onChange={(e) =>
              setModalConfig({ ...modalConfig, alertThreshold: e.target.value })
            }
            className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
          >
            <option value="info">{t("Sensibilité Haute (Avertir dès Info)")}</option>
            <option value="warning">{t("Standard (Avertir à partir de Warning)")}</option>
            <option value="critical">{t("Strict (Seulement Erreurs Critiques)")}</option>
          </select>
        </div>
      </div>

      {/* Interactive Diagnostic Trigger */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <Zap className="w-4 h-4 text-amber-600" />
            {t("Scanner Sentinel en Temps Réel")}
          </div>
          <p className="text-zinc-500 text-xs">
            {t(
              "Analyse les exceptions récentes, la réactivité des 58 Wilayas et la santé des API."
            )}
          </p>
        </div>
        <button
          onClick={runSentinelDiagnostic}
          disabled={isRunningAgent}
          className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-700 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 shrink-0"
        >
          {isRunningAgent ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              {t("Analyse en cours...")}
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              {t("Lancer le diagnostic système")}
            </>
          )}
        </button>
      </div>

      {/* Sentinel Report Display */}
      {sentinelReport && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <h4 className="font-sans font-bold text-sm text-zinc-900">
                {sentinelReport.statusLabel || t("Santé globale optimale")}
              </h4>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-extrabold">
              {t("Indice de Santé : ")} {sentinelReport.healthIndex || 98}%
            </span>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed font-medium">
            {sentinelReport.summary}
          </p>

          {sentinelReport.systemChecks && sentinelReport.systemChecks.length > 0 && (
            <div className="space-y-2 pt-2">
              <h5 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                {t("Contrôles d'Infrastructures :")}
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sentinelReport.systemChecks.map((chk, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-zinc-800">{chk.name}</p>
                      <p className="text-[10px] text-zinc-400">{chk.detail}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                      {chk.latencyMs}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
