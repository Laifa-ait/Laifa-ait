import { ShieldCheck, FileCheck, FileText, ScrollText, AlertCircle, Award } from 'lucide-react';
import { LegalPaperType } from '../types/realEstate';

export interface LegalPaperInfo {
  type: LegalPaperType;
  title: string;
  label: string; // Alias for title
  shortLabel: string;
  description: string;
  legalScope: string;
  buyerAdvice: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  isVerifiedLegal: boolean; // Confère pleine garantie juridique
  icon: typeof ShieldCheck;
}

export const LEGAL_PAPERS_CONFIG: Record<LegalPaperType, LegalPaperInfo> = {
  acte_notarie: {
    type: 'acte_notarie',
    title: "Acte notarié authentique",
    label: "Acte notarié authentique",
    shortLabel: 'Acte Notarié',
    description: "Acte notarié officiel enregistré et publié attestant des droits de propriété réels.",
    legalScope: "Titre authentique établi par devant notaire avec enregistrement fiscal.",
    buyerAdvice: "Titre notarié légal assurant la transmission des droits de propriété selon la loi foncière.",
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    isVerifiedLegal: true,
    icon: ShieldCheck,
  },
  acte_notarie_individuel: {
    type: 'acte_notarie_individuel',
    title: "Acte notarié dans l'individuel",
    label: "Acte notarié dans l'individuel",
    shortLabel: 'Acte Individuel',
    description: "Titre de propriété notarié privatif et individuel enregistré auprès de la Conservation Foncière.",
    legalScope: "Pleine propriété individuelle enregistrée et publiée au livre foncier.",
    buyerAdvice: "Sécurité maximale : permet l'obtention immédiate de crédit bancaire et la cession notariée sans réserve.",
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    isVerifiedLegal: true,
    icon: ShieldCheck,
  },
  acte_dans_indivision: {
    type: 'acte_dans_indivision',
    title: "Acte notarié dans l'indivision (Chiyou3)",
    label: "Acte notarié dans l'indivision (Chiyou3)",
    shortLabel: 'Indivision (Chiyou3)',
    description: "Quote-part légale notariée détenue en copropriété indivise avec les co-indivisaires.",
    legalScope: "Titre notarié authentique portant sur une quote-part idéale du bien.",
    buyerAdvice: "Vente légale chez le notaire avec purge préalable du droit de préemption des co-indivisaires.",
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-800',
    badgeBorder: 'border-teal-200',
    isVerifiedLegal: true,
    icon: FileCheck,
  },
  livret_foncier: {
    type: 'livret_foncier',
    title: 'Livret foncier individuel',
    label: 'Livret foncier individuel',
    shortLabel: 'Livret Foncier',
    description: 'Titre de propriété cadastral définitif délivré par la Conservation Foncière algérienne (Cadastre).',
    legalScope: "Identifiant cadastral officiel définitif (Ordonnance 75-74 portant cadastre général).",
    buyerAdvice: "Titre suprême en droit foncier algérien : aucune contestation de limites ou de propriété possible.",
    badgeBg: 'bg-[#1a3831]',
    badgeText: 'text-[#ebdcb8]',
    badgeBorder: 'border-[#1a3831]',
    isVerifiedLegal: true,
    icon: ShieldCheck,
  },
  permis_construire: {
    type: 'permis_construire',
    title: 'Permis de construire',
    label: 'Permis de construire',
    shortLabel: 'Permis de Construire',
    description: "Autorisation administrative d'urbanisme délivrée par les autorités municipales (APC / DUC).",
    legalScope: "Conformité administrative des plans initiaux de construction délivrée par la commune.",
    buyerAdvice: "Garantit que l'édification a été autorisée par les services d'urbanisme de la wilaya.",
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-200',
    isVerifiedLegal: true,
    icon: FileCheck,
  },
  certificat_conformite: {
    type: 'certificat_conformite',
    title: 'Certificat de conformité',
    label: 'Certificat de conformité',
    shortLabel: 'Certificat Conformité',
    description: 'Certificat attestant de la conformité de la construction aux plans approuvés (Loi 08-15).',
    legalScope: "Validation d'achèvement et de régularité architecturale selon la loi 08-15.",
    buyerAdvice: "Indispensable pour l'obtention ultérieure du livret foncier sur les constructions nouvelles.",
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
    isVerifiedLegal: true,
    icon: Award,
  },
  decision_attribution: {
    type: 'decision_attribution',
    title: "Décision d'attribution (AADL, LSP, LPP)",
    label: "Décision d'attribution (AADL, LSP, LPP)",
    shortLabel: "Décision Attribution",
    description: "Attribution administrative officielle d'un logement sous programme étatique (AADL, LSP, LPP, OPGI).",
    legalScope: "Attribution étatique nominative sous condition d'apurement des traites auprès de l'organisme.",
    buyerAdvice: "Vérifier la levée de la clause d'incessibilité temporaire avant tout engagement financier.",
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-800',
    badgeBorder: 'border-cyan-200',
    isVerifiedLegal: true,
    icon: FileText,
  },
  promesse_vente: {
    type: 'promesse_vente',
    title: 'Promesse de vente notariée',
    label: 'Promesse de vente notariée',
    shortLabel: 'Promesse Notariée',
    description: 'Avant-contrat notarié bilatéral fixant les engagements et délais avant transfert définitif.',
    legalScope: "Engagement contractuel synallagmatique authentifié par étude notariale.",
    buyerAdvice: "Bloque la vente à un tiers et garantit le prix convenu durant le délai de réalisation.",
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    isVerifiedLegal: true,
    icon: ScrollText,
  },
  papier_timbre: {
    type: 'papier_timbre',
    title: 'Papier timbré / Coutumier (Orfi)',
    label: 'Papier timbré / Coutumier (Orfi)',
    shortLabel: 'Papier Timbré (Orfi)',
    description: "Cession coutumière sous seing privé légalisée auprès de l'APC.",
    legalScope: "Reconnaissance de signature en mairie (APC) sans publicité foncière ni effet réel.",
    buyerAdvice: "Nécessite une régularisation ultérieure (enquête foncière ou prescription acquisitive).",
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-800',
    badgeBorder: 'border-orange-200',
    isVerifiedLegal: false,
    icon: AlertCircle,
  },
};

export const LEGAL_PAPERS_LIST: LegalPaperInfo[] = Object.values(LEGAL_PAPERS_CONFIG);

export function getLegalPaperInfo(paperType?: LegalPaperType | string | null): LegalPaperInfo {
  if (paperType) {
    if (paperType in LEGAL_PAPERS_CONFIG) {
      return LEGAL_PAPERS_CONFIG[paperType as LegalPaperType];
    }
    // Backward compatibility mapping for legacy values
    if (paperType === 'acte_notarie') return LEGAL_PAPERS_CONFIG.acte_notarie_individuel;
    if (paperType === 'decision') return LEGAL_PAPERS_CONFIG.decision_attribution;
    if (paperType === 'agricole') return LEGAL_PAPERS_CONFIG.acte_notarie_individuel;
    if (paperType === 'sans_papiers') return LEGAL_PAPERS_CONFIG.papier_timbre;
  }
  // Par défaut sur le marché de la vente : Acte notarié dans l'individuel
  return LEGAL_PAPERS_CONFIG.acte_notarie_individuel;
}
