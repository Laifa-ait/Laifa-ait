import React from "react";
import { AgentModalConfig } from "../AgentConfigModal";

interface SupportConfigTabProps {
  modalConfig: AgentModalConfig;
  setModalConfig: React.Dispatch<React.SetStateAction<AgentModalConfig | null>>;
  t: (key: string) => string;
}

export const SupportConfigTab: React.FC<SupportConfigTabProps> = ({
  modalConfig,
  setModalConfig,
  t,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-start">
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">
          {t("Base de Connaissances Support")}
        </h4>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-500">
            {t("Personnalité de l'Agent")}
          </label>
          <select
            value={modalConfig.personality || "warm"}
            onChange={(e) =>
              setModalConfig({ ...modalConfig, personality: e.target.value })
            }
            className="px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-purple-500"
          >
            <option value="warm">{t("Très Chaleureux (Hospitalité Algérienne)")}</option>
            <option value="professional">{t("Professionnel & Distingué")}</option>
            <option value="casual">{t("Sympathique & Proche")}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-zinc-500">
            {t("Base de Connaissances (Délais, Prix, Wilayas)")}
          </label>
          <textarea
            rows={10}
            value={modalConfig.kbContext || ""}
            onChange={(e) =>
              setModalConfig({ ...modalConfig, kbContext: e.target.value })
            }
            placeholder={t(
              "Saisissez les règles de retour, prix d'expéditions par wilaya d'Algérie, SAV..."
            )}
            className="px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-purple-500 resize-none text-xs leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
