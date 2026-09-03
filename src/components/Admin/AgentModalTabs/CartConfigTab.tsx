import React from "react";
import { Mail, HelpCircle, RefreshCw, Play } from "lucide-react";
import { AgentModalConfig, CartPreview } from "../AgentConfigModal";
import { sanitizeHTML } from "../../../utils/sanitization";

interface CartConfigTabProps {
  modalConfig: AgentModalConfig;
  setModalConfig: React.Dispatch<React.SetStateAction<AgentModalConfig | null>>;
  runCartSimulation: () => Promise<void>;
  isRunningAgent: boolean;
  cartPreview: CartPreview | null;
  t: (key: string) => string;
}

export const CartConfigTab: React.FC<CartConfigTabProps> = ({
  modalConfig,
  setModalConfig,
  runCartSimulation,
  isRunningAgent,
  cartPreview,
  t,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-start">
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">
          {t("Paramètres de Relance")}
        </h4>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-500">
            {t("Code Promo de Récupération")}
          </label>
          <input
            type="text"
            value={modalConfig.discountCode || ""}
            onChange={(e) =>
              setModalConfig({
                ...modalConfig,
                discountCode: e.target.value.toUpperCase().trim(),
              })
            }
            className="px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-500">
            {t("Pourcentage de Réduction (%)")}
          </label>
          <input
            type="number"
            min={5}
            max={50}
            value={modalConfig.discountPercent ?? 10}
            onChange={(e) =>
              setModalConfig({
                ...modalConfig,
                discountPercent: parseInt(e.target.value) || 10,
              })
            }
            className="px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-500">
            {t("Délai de relance automatique")}
          </label>
          <select
            value={modalConfig.followUpDelay ?? 4}
            onChange={(e) =>
              setModalConfig({ ...modalConfig, followUpDelay: parseInt(e.target.value) })
            }
            className="px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-orange-500"
          >
            <option value={1}>{t("1 Heure après l'abandon")}</option>
            <option value={4}>{t("4 Heures après l'abandon (Recommandé)")}</option>
            <option value={24}>{t("24 Heures après l'abandon")}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-500">
            {t("Tonalité des Rédacs d'e-mails")}
          </label>
          <select
            value={modalConfig.tone || "luxury"}
            onChange={(e) => setModalConfig({ ...modalConfig, tone: e.target.value })}
            className="px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-orange-500"
          >
            <option value="luxury">{t("Luxueux & Prestigieux")}</option>
            <option value="friendly">{t("Chaleureux & Traditionnel")}</option>
            <option value="persuasive">{t("Direct & Commercial")}</option>
          </select>
        </div>

        <button
          onClick={runCartSimulation}
          disabled={isRunningAgent}
          className="w-full py-3 bg-orange-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors shadow-sm cursor-pointer disabled:bg-zinc-300"
        >
          {isRunningAgent ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              {t("Génération en cours par Gemini...")}
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              {t("Générer une relance de test")}
            </>
          )}
        </button>
      </div>

      {/* Results panel */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-start min-h-[300px]">
        <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Mail className="w-4 h-4 text-orange-600" />
          {t("Aperçu de l'Email Client")}
        </h4>

        {!cartPreview && !isRunningAgent && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-200 rounded-2xl">
            <HelpCircle className="w-8 h-8 text-zinc-300 mb-2" />
            <p className="text-xs font-medium text-zinc-500">
              {t(
                "Lancez la relance de test pour voir le mail exclusif rédigé en direct par Gemini."
              )}
            </p>
          </div>
        )}

        {isRunningAgent && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-orange-600 animate-spin" />
            <span className="text-xs font-bold text-orange-600 animate-pulse uppercase tracking-wider">
              {t("Création du modèle personnalisé...")}
            </span>
          </div>
        )}

        {cartPreview && (
          <div className="space-y-4 text-sm overflow-y-auto max-h-[350px] pr-2">
            <div className="bg-zinc-100 p-3 rounded-2xl border border-zinc-200 space-y-1">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                {t("Destinataire :")}
              </span>
              <span className="text-xs text-zinc-700 font-bold block">
                Amine Belkacem (amine.belk@gmail.com)
              </span>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block pt-1">
                {t("Sujet de l'Email :")}
              </span>
              <span className="text-xs text-orange-700 font-black block">
                📧 {cartPreview.subject}
              </span>
            </div>

            <div className="border border-zinc-200 rounded-2xl p-4 bg-zinc-50/30">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-3">
                {t("Aperçu du corps HTML :")}
              </span>
              <div
                className="text-xs text-zinc-600 space-y-2 border-t border-zinc-200 pt-3"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(cartPreview.htmlBody || ""),
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
