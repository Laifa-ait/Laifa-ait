import React from "react";
import { Zap, RefreshCw, ShieldCheck, HelpCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { AgentModalConfig, ModeratorResult } from "../AgentConfigModal";

interface ModeratorConfigTabProps {
  modalConfig: AgentModalConfig;
  setModalConfig: React.Dispatch<React.SetStateAction<AgentModalConfig | null>>;
  runModeratorTest: () => Promise<void>;
  isRunningAgent: boolean;
  moderatorResult: ModeratorResult | null;
  testProduct: { title: string; description: string };
  setTestProduct: React.Dispatch<React.SetStateAction<{ title: string; description: string }>>;
  t: (key: string) => string;
}

export const ModeratorConfigTab: React.FC<ModeratorConfigTabProps> = ({
  modalConfig,
  setModalConfig,
  runModeratorTest,
  isRunningAgent,
  moderatorResult,
  testProduct,
  setTestProduct,
  t,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-start">
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">
          {t("Règles de Modération")}
        </h4>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-500">
            {t("Niveau de Sévérité")}
          </label>
          <select
            value={modalConfig.strictness || "strict"}
            onChange={(e) =>
              setModalConfig({ ...modalConfig, strictness: e.target.value })
            }
            className="px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="strict">
              {t("Strict (Anti-liens, anti-whatsapp, anti-numéros)")}
            </option>
            <option value="standard">
              {t("Standard (Avertissement si fraude grossière)")}
            </option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-500">
            {t("Mots clés ou canaux interdits (séparés par virgule)")}
          </label>
          <textarea
            rows={3}
            value={modalConfig.customForbiddenWords || ""}
            onChange={(e) =>
              setModalConfig({ ...modalConfig, customForbiddenWords: e.target.value })
            }
            className="px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 resize-none font-mono"
            placeholder="Ex: whatsapp, viber, ouedkniss, +213"
          />
        </div>

        {/* Playground section inside modal config */}
        <div className="border-t border-zinc-200 pt-4 space-y-3">
          <h5 className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            {t("Tester l'agent modérateur en direct")}
          </h5>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">
              {t("Titre Fictif du Produit")}
            </label>
            <input
              type="text"
              value={testProduct.title}
              onChange={(e) => setTestProduct({ ...testProduct, title: e.target.value })}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">
              {t("Description du Produit")}
            </label>
            <textarea
              rows={3}
              value={testProduct.description}
              onChange={(e) =>
                setTestProduct({ ...testProduct, description: e.target.value })
              }
              className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <button
            onClick={runModeratorTest}
            disabled={isRunningAgent}
            className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors cursor-pointer disabled:bg-zinc-300"
          >
            {isRunningAgent ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {t("Analyse de sécurité par Gemini...")}
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                {t("Auditer la fiche produit")}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results panel */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-start min-h-[300px]">
        <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          {t("Résultat de l'Audit de Modération")}
        </h4>

        {!moderatorResult && !isRunningAgent && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-200 rounded-xl">
            <HelpCircle className="w-8 h-8 text-zinc-300 mb-2" />
            <p className="text-xs font-medium text-zinc-500">
              {t(
                "Entrez les détails d'un produit à gauche et cliquez sur Auditer pour lancer le modérateur automatique."
              )}
            </p>
          </div>
        )}

        {isRunningAgent && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
            <span className="text-xs font-bold text-emerald-600 animate-pulse uppercase tracking-wider">
              {t("Scanning de la fiche produit...")}
            </span>
          </div>
        )}

        {moderatorResult && (
          <div className="space-y-4 text-sm overflow-y-auto max-h-[420px] pr-2">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                {moderatorResult.approved ? (
                  <span className="px-3 py-1 text-xs font-black uppercase rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t("APPROUVÉ")}
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-black uppercase rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {t("REFUSÉ")}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">
                  {t("Score de Qualité")}
                </span>
                <span
                  className={`text-base font-sans font-bold ${
                    (moderatorResult.qualityScore ?? 0) >= 80
                      ? "text-green-600"
                      : (moderatorResult.qualityScore ?? 0) >= 50
                      ? "text-orange-500"
                      : "text-red-500"
                  }`}
                >
                  {moderatorResult.qualityScore ?? 0} / 100
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <strong className="text-xs font-bold text-zinc-700 block">
                📋 {t("Liste de Conformité :")}
              </strong>
              <div className="space-y-1.5">
                {moderatorResult.checklist?.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs p-2 bg-zinc-50 border border-zinc-100 rounded-lg"
                  >
                    <span className="text-zinc-600 font-medium">{item.label}</span>
                    {item.passed ? (
                      <span className="text-green-600 font-black">✓</span>
                    ) : (
                      <span className="text-red-500 font-black">✗</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {(moderatorResult.infractionsDetected?.length ?? 0) > 0 && (
              <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 space-y-1">
                <strong className="text-xs font-bold text-red-900 block">
                  ⚠️ {t("Anomalies Détectées :")}
                </strong>
                <ul className="list-disc list-inside text-xs text-red-700 space-y-0.5 font-medium">
                  {moderatorResult.infractionsDetected?.map((inf, idx) => (
                    <li key={idx}>{inf}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-xl">
              <strong className="text-xs font-bold text-zinc-700 block mb-1">
                💬 {t("Retour d'Audit pour le Vendeur :")}
              </strong>
              <p className="text-xs text-zinc-600 leading-relaxed italic">
                {moderatorResult.feedback}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
