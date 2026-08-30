export interface AiAgentConfigGrowth {
  isActive: boolean;
  focusCategory: string;
  marketContext: string;
  analysisFrequency: string;
}

export interface AiAgentConfigCart {
  isActive: boolean;
  discountCode: string;
  discountPercent: number;
  followUpDelay: number;
  tone: string;
}

export interface AiAgentConfigModerator {
  isActive: boolean;
  strictness: string;
  languages: string;
  customForbiddenWords: string;
}

export interface AiAgentConfigSupport {
  isActive: boolean;
  kbContext: string;
  personality: string;
}

export interface AiAgentConfigSentinel {
  isActive: boolean;
  autoScanInterval: string;
  alertThreshold: string;
  autoFixEnabled: boolean;
}

export interface AiAgentsConfigMap {
  growth: AiAgentConfigGrowth;
  cart: AiAgentConfigCart;
  moderator: AiAgentConfigModerator;
  support: AiAgentConfigSupport;
  sentinel: AiAgentConfigSentinel;
  [key: string]:
    | AiAgentConfigGrowth
    | AiAgentConfigCart
    | AiAgentConfigModerator
    | AiAgentConfigSupport
    | AiAgentConfigSentinel
    | Record<string, unknown>;
}

export interface AiTranslationPreviewResult {
  ar: string;
  en: string;
  isNew: boolean;
}

export interface AiGrowthKpi {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

export interface AiGrowthReport {
  summary: string;
  kpis: AiGrowthKpi[];
  pricingTips: string;
  topSearches: string[];
  actionableAdvice: string;
  createdAt: unknown;
}

export interface CheckoutAuditDoc {
  timestamp: unknown;
  overallScore: number;
  scores: Record<string, number>;
  checksPassed: number;
  checksFailed: number;
  authorEmail: string;
}
