export type BricolageLanguage = 'fr' | 'ar' | 'en';

export interface BricolageTranslationDictionary {
  meta: {
    title: string;
    description: string;
  };
  header: {
    hotlineBadge: string;
    hotlineSub: string;
    clientAccount: string;
    hotlineTel: string;
    guaranteeLabel: string;
    brandTitle: string;
    brandSub: string;
    menuToggle: string;
    artisanCertified: string;
    marketplaceReturn: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchButton: string;
    btnRequestQuote: string;
    btnArtisanSpace: string;
  };
  categories: {
    plumbing: string;
    electricity: string;
    hvac: string;
    painting: string;
    locksmith: string;
    carpentry: string;
    masonry: string;
    appliance: string;
  };
  wizard: {
    modalTitle: string;
    step1Category: string;
    step2Location: string;
    step3Details: string;
    step4Photos: string;
    photosLimitBadge: string;
    photosMaxWarning: string;
    photosImportApp: string;
    photosGalleryPicker: string;
    submitQuoteBtn: string;
    urgencyStandard: string;
    urgencyExpress: string;
    urgencyEmergency: string;
  };
  artisanDashboard: {
    tabLeads: string;
    tabOffers: string;
    tabProfile: string;
    leadsAvailableCount: string;
    proposePriceBtn: string;
    viewPhotosBtn: string;
    verificationBadge: string;
  };
  clientDashboard: {
    myRequestsTitle: string;
    offersReceived: string;
    acceptOfferBtn: string;
    callArtisanBtn: string;
    statusPending: string;
    statusQuoted: string;
    statusAccepted: string;
  };
  common: {
    wilaya: string;
    commune: string;
    cancel: string;
    confirm: string;
    loading: string;
    preview: string;
    ok: string;
    close: string;
  };
}
