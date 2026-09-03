import React from "react";
import { TFunction } from "i18next";
import { motion, AnimatePresence } from "motion/react";
import { Bot, X } from "lucide-react";
import { GrowthConfigTab } from "./AgentModalTabs/GrowthConfigTab";
import { CartConfigTab } from "./AgentModalTabs/CartConfigTab";
import { ModeratorConfigTab } from "./AgentModalTabs/ModeratorConfigTab";
import { SupportConfigTab } from "./AgentModalTabs/SupportConfigTab";
import { SentinelConfigTab } from "./AgentModalTabs/SentinelConfigTab";

export type AgentKey = "growth" | "cart" | "moderator" | "support" | "sentinel";

export interface AgentModalConfig {
  isActive?: boolean;
  focusCategory?: string;
  marketContext?: string;
  analysisFrequency?: string;
  discountCode?: string;
  discountPercent?: number;
  followUpDelay?: number;
  tone?: string;
  strictness?: string;
  customForbiddenWords?: string;
  personality?: string;
  kbContext?: string;
  autoScanInterval?: string;
  alertThreshold?: string;
  [key: string]: unknown;
}

export interface GrowthReport {
  summary?: string;
  kpis?: Array<{ label: string; value: string | number; trend?: string; change?: string }>;
  topSearches?: string[];
  pricingTips?: string;
  actionableAdvice?: string;
  [key: string]: unknown;
}

export interface CartPreview {
  subject?: string;
  htmlBody?: string;
  [key: string]: unknown;
}

export interface ModeratorResult {
  approved?: boolean;
  qualityScore?: number;
  checklist?: Array<{ label: string; passed: boolean }>;
  infractionsDetected?: string[];
  feedback?: string;
  [key: string]: unknown;
}

export interface SentinelReport {
  statusLabel?: string;
  summary?: string;
  healthIndex?: number;
  systemChecks?: Array<{ name: string; detail: string; latencyMs: number; status: string }>;
  issuesFound?: Array<{
    title: string;
    severity?: string;
    component?: string;
    rootCause?: string;
    recommendedFix?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface AgentConfigModalProps {
  activeModal: AgentKey | null;
  setActiveModal: (key: AgentKey | null) => void;
  modalConfig: AgentModalConfig | null;
  setModalConfig: React.Dispatch<React.SetStateAction<AgentModalConfig | null>>;
  isSavingConfig: boolean;
  saveConfig: () => Promise<void>;
  isRunningAgent: boolean;
  runGrowthAnalysis: () => Promise<void>;
  growthReport: GrowthReport | null;
  runCartSimulation: () => Promise<void>;
  cartPreview: CartPreview | null;
  runModeratorTest: () => Promise<void>;
  moderatorResult: ModeratorResult | null;
  testProduct: { title: string; description: string };
  setTestProduct: React.Dispatch<React.SetStateAction<{ title: string; description: string }>>;
  runSentinelDiagnostic: () => Promise<void>;
  sentinelReport: SentinelReport | null;
  t: TFunction;
}

export const AgentConfigModal: React.FC<AgentConfigModalProps> = ({
  activeModal,
  setActiveModal,
  modalConfig,
  setModalConfig,
  isSavingConfig,
  saveConfig,
  isRunningAgent,
  runGrowthAnalysis,
  growthReport,
  runCartSimulation,
  cartPreview,
  runModeratorTest,
  moderatorResult,
  testProduct,
  setTestProduct,
  runSentinelDiagnostic,
  sentinelReport,
  t,
}) => {
  if (!activeModal || !modalConfig) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/45">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border border-zinc-200 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
        >
          {/* Modal header */}
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-orange-500 animate-pulse" />
              <div>
                <h3 className="text-lg font-sans font-bold text-zinc-900">
                  {t("Configuration : ")} {activeModal === "growth" && t("Growth Analyst")}
                  {activeModal === "cart" && t("Récupérateur de Paniers")}
                  {activeModal === "moderator" && t("Modérateur de Contenu")}
                  {activeModal === "support" && t("Assistant Support Client")}
                  {activeModal === "sentinel" && t("Sentinel AI Diagnostic")}
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  {t("Optimisez et testez la logique de votre agent IA en temps réel")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal content body */}
          <div className="p-8 overflow-y-auto space-y-6 flex-1 min-h-0 bg-zinc-50/50">
            {activeModal === "growth" && (
              <GrowthConfigTab
                modalConfig={modalConfig}
                setModalConfig={setModalConfig}
                runGrowthAnalysis={runGrowthAnalysis}
                isRunningAgent={isRunningAgent}
                growthReport={growthReport}
                t={t}
              />
            )}

            {activeModal === "cart" && (
              <CartConfigTab
                modalConfig={modalConfig}
                setModalConfig={setModalConfig}
                runCartSimulation={runCartSimulation}
                isRunningAgent={isRunningAgent}
                cartPreview={cartPreview}
                t={t}
              />
            )}

            {activeModal === "moderator" && (
              <ModeratorConfigTab
                modalConfig={modalConfig}
                setModalConfig={setModalConfig}
                runModeratorTest={runModeratorTest}
                isRunningAgent={isRunningAgent}
                moderatorResult={moderatorResult}
                testProduct={testProduct}
                setTestProduct={setTestProduct}
                t={t}
              />
            )}

            {activeModal === "support" && (
              <SupportConfigTab
                modalConfig={modalConfig}
                setModalConfig={setModalConfig}
                t={t}
              />
            )}

            {activeModal === "sentinel" && (
              <SentinelConfigTab
                modalConfig={modalConfig}
                setModalConfig={setModalConfig}
                runSentinelDiagnostic={runSentinelDiagnostic}
                isRunningAgent={isRunningAgent}
                sentinelReport={sentinelReport}
                t={t}
              />
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-zinc-100 flex items-center justify-end gap-3 bg-white">
            <button
              onClick={() => setActiveModal(null)}
              className="px-5 py-2.5 rounded-2xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              {t("Annuler")}
            </button>
            <button
              onClick={saveConfig}
              disabled={isSavingConfig}
              className="px-6 py-2.5 rounded-2xl bg-orange-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-orange-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSavingConfig ? t("Enregistrement...") : t("Sauvegarder la configuration")}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
