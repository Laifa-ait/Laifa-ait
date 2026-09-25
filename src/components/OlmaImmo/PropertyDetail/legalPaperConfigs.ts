import { LegalPaperType } from '../../../types/realEstate';

export interface LegalDocConfig {
  title: string;
  short: string;
  scope: string;
  buyerAdvice: string;
}

export const LEGAL_PAPER_CONFIGS: Record<LegalPaperType, LegalDocConfig> = {
  acte_notarie: {
    title: "Acte Notarié",
    short: 'Acte Notarié',
    scope: 'Pleine propriété authentifiée par devant notaire et enregistrée.',
    buyerAdvice: "Titre de propriété formel. Vérifier l'identité du vendeur par rapport à l'acte.",
  },
  acte_notarie_individuel: {
    title: "Acte Notarié dans l'Individuel",
    short: 'Acte Individuel',
    scope: 'Pleine propriété individuelle enregistrée et publiée à la conservation foncière.',
    buyerAdvice: "Titre de propriété inattaquable. Vérifier l'identité du vendeur par rapport à l'acte.",
  },
  livret_foncier: {
    title: 'Livret Foncier Individuel',
    short: 'Livret Foncier',
    scope: 'Document officiel délivré par le cadastre certifiant la délimitation et la propriété du bien.',
    buyerAdvice: 'Garantie maximale en droit foncier algérien. Permet une transaction rapide chez le notaire.',
  },
  acte_dans_indivision: {
    title: "Acte Notarié dans l'Indivision (Chiyou3)",
    short: 'Indivision (Chiyou3)',
    scope: 'Part de propriété indivise au sein d’une assiette foncière partagée entre plusieurs copropriétaires.',
    buyerAdvice: 'Exiger la renonciation au droit de préemption des autres indivisaires avant la vente.',
  },
  permis_construire: {
    title: 'Permis de Construire',
    short: 'Permis de Construire',
    scope: 'Autorisation administrative délivrée par l’APC autorisant l’édification de la bâtisse.',
    buyerAdvice: 'S’assurer de la conformité des plans réalisés par rapport au permis initial déposé.',
  },
  papier_timbre: {
    title: 'Papier Timbré / Acte Sous Seing Privé (Orfi)',
    short: 'Papier Timbré (Orfi)',
    scope: 'Document rédigé sous seing privé sans publication cadastrale formelle.',
    buyerAdvice: 'Régularisation recommandée via la loi 08-15 ou procédure de certificat de possession.',
  },
  decision_attribution: {
    title: 'Décision d’Attribution / Arrêté Administratif',
    short: 'Décision Attribution',
    scope: 'Attribution légale par un organisme étatique (ex: OPGI, AADL, Agence Foncière).',
    buyerAdvice: 'Vérifier la levée de la clause d’incessibilité avant tout engagement financier.',
  },
  promesse_vente: {
    title: 'Promesse de Vente Notariée',
    short: 'Promesse Notariée',
    scope: 'Engagement synallagmatique authentifié chez le notaire avant régularisation définitive.',
    buyerAdvice: 'Respecter scrupuleusement les délais et conditions suspensives prévues à l’acte.',
  },
  certificat_conformite: {
    title: 'Certificat de Conformité',
    short: 'Certificat Conformité',
    scope: 'Attestation de l’APC confirmant l’achèvement des travaux conformément aux normes d’urbanisme.',
    buyerAdvice: 'Facilite l’obtention du livret foncier individuel pour les constructions récentes.',
  },
};
