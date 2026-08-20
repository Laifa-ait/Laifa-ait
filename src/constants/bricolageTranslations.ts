import { BricolageTranslationDictionary } from '../types/bricolageI18n';

/**
 * Pre-configured Bricolage Multi-Language Structure (FR, AR, EN)
 * Base French structure + English & Arabic key structures ready for localized values.
 */
export const BRICOLAGE_I18N_BASE_FR: BricolageTranslationDictionary = {
  meta: {
    title: "Olma Bricolage Pro DZ - Demande de Devis & Artisans en Algérie",
    description: "Trouvez un artisan certifié pour vos travaux de plomberie, électricité, climatisation, peinture et serrurerie dans les 58 Wilayas."
  },
  header: {
    hotlineBadge: "SOS DÉPANNAGE 24/7",
    hotlineSub: "Interventions rapides à domicile : Plomberie, Climatisation, Électricité & Serrurerie",
    clientAccount: "Compte Client :",
    hotlineTel: "Hotline : 023 00 00 00",
    guaranteeLabel: "Garantie Travaux Olma Safe",
    brandTitle: "OLMA BRICOLAGE",
    brandSub: "Artisans Qualifiés & Services Industriels en Algérie",
    menuToggle: "Menu",
    artisanCertified: "Pro Certifié",
    marketplaceReturn: "Marketplace Olmart"
  },
  hero: {
    badge: "INSPIRE D'ANGI.COM • ARTISANS VÉRIFIÉS & DÉPANNAGE PRO DZ",
    title: "Trouvez un artisan certifié pour vos travaux & dépannages",
    subtitle: "Plomberie, électricité, climatisation, peinture, menuiserie et rénovation. Trouvez et contactez directement des artisans vérifiés dans votre wilaya.",
    searchPlaceholder: "Ex: Réparation fuite d'eau, installation climatiseur...",
    searchButton: "Rechercher",
    btnRequestQuote: "Demander un Devis Gratuit",
    btnArtisanSpace: "Espace Artisan Pro"
  },
  categories: {
    plumbing: "Plomberie & Sanitaire",
    electricity: "Électricité & Tableau",
    hvac: "Climatisation & Chauffage",
    painting: "Peinture & Rénovation",
    locksmith: "Serrurerie & Sécurité",
    carpentry: "Menuiserie & Aluminium",
    masonry: "Maçonnerie & Carrelage",
    appliance: "Dépannage Électroménager"
  },
  wizard: {
    modalTitle: "DEMANDE D'INTERVENTION OLMA BRICOLAGE",
    step1Category: "Prestation souhaitée",
    step2Location: "Wilaya & Commune d'intervention",
    step3Details: "Détails du problème ou du projet",
    step4Photos: "Photos du problème ou du chantier (Max 5 photos)",
    photosLimitBadge: "5 photos max",
    photosMaxWarning: "Limite maximale de 5 photos atteinte",
    photosImportApp: "Depuis votre appareil",
    photosGalleryPicker: "Sélectionner dans la Galerie Media",
    submitQuoteBtn: "Envoyer la demande d'intervention",
    urgencyStandard: "Standard (Dans la semaine)",
    urgencyExpress: "Express (Sous 24-48h)",
    urgencyEmergency: "Urgence SOS (Immédiat)"
  },
  artisanDashboard: {
    tabLeads: "Chantiers Disponibles",
    tabOffers: "Mes Devis Envoyés",
    tabProfile: "Mon Profil Pro",
    leadsAvailableCount: "Demandes en attente",
    proposePriceBtn: "Proposer un Tarif",
    viewPhotosBtn: "Voir les photos du client",
    verificationBadge: "Artisan Certifié"
  },
  clientDashboard: {
    myRequestsTitle: "Mes Demandes de Devis",
    offersReceived: "Offres reçues",
    acceptOfferBtn: "Accepter l'offre",
    callArtisanBtn: "Appeler l'artisan",
    statusPending: "En attente d'artisans",
    statusQuoted: "Devis reçus",
    statusAccepted: "Offre acceptée"
  },
  common: {
    wilaya: "Wilaya",
    commune: "Commune (Baladia)",
    cancel: "Annuler",
    confirm: "Confirmer",
    loading: "Chargement en cours...",
    preview: "Prévisualiser",
    ok: "OK",
    close: "Fermer"
  }
};

export const BRICOLAGE_I18N_BASE_AR: Partial<BricolageTranslationDictionary> = {
  meta: {
    title: "أولما للخدمات الحرفية - طلب تقدير أسعار وحرفيين في الجزائر",
    description: "اعثر على حرفي معتمد لأعمال السباكة والكهرباء والدهان والتكييف عبر 58 ولاية."
  },
  header: {
    hotlineBadge: "طوارئ الصيانة 24/7",
    hotlineSub: "تدخلات سريعة في المنزل: سباكة، تكييف، كهرباء وقفل",
    brandTitle: "أولما للخدمات الحرفية",
    brandSub: "حرفيون مؤهلون وخدمات منزلية في الجزائر",

    clientAccount: "حساب العميل",
    hotlineTel: "0550 00 00 00",
    guaranteeLabel: "ضمان أولما",
    menuToggle: "القائمة",
    artisanCertified: "حرفي معتمد",
    marketplaceReturn: "العودة للسوق"
  }
};

export const BRICOLAGE_I18N_BASE_EN: Partial<BricolageTranslationDictionary> = {
  meta: {
    title: "Olma Bricolage Pro DZ - Request Quotes & Verified Artisans in Algeria",
    description: "Find certified artisans for plumbing, electrical, HVAC, painting, and locksmith services across 58 Wilayas."
  },
  header: {
    hotlineBadge: "24/7 EMERGENCY REPAIR",
    hotlineSub: "Fast home repairs: Plumbing, HVAC, Electrical & Locksmith",
    brandTitle: "OLMA BRICOLAGE",
    brandSub: "Qualified Artisans & Home Services in Algeria",

    clientAccount: "Client Account",
    hotlineTel: "0550 00 00 00",
    guaranteeLabel: "Olma Guarantee",
    menuToggle: "Menu",
    artisanCertified: "Certified Artisan",
    marketplaceReturn: "Return to Market"
  }
};
