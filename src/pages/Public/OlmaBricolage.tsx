import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PhoneCall } from 'lucide-react';
import {
  BricolageServiceCategory,
  VerifiedArtisan,
  BricolageReview,
  QuoteRequestDoc,
  QuoteOffer,
  BricolageConversation,
  BricolageMessage,
  ActiveArtisanProfile,
  ArtisanOpportunityDTO
} from '../../types/bricolage';
import {
  fetchBricolageCategories,
  fetchVerifiedArtisans,
  fetchBricolageReviews,
  submitArtisanOffer,
  getArtisanOpportunities,
  acceptQuoteOffer
} from '../../services/bricolage.api';
import { useAuth } from '../../context/AuthContext';
import { BricolageHeader } from '../../components/bricolage/BricolageHeader';
import { BricolageHero } from '../../components/bricolage/BricolageHero';
import { ServiceCategoryGrid } from '../../components/bricolage/ServiceCategoryGrid';
import { ArtisanList } from '../../components/bricolage/ArtisanList';
import { ProjectWizardModal } from '../../components/bricolage/ProjectWizardModal';
import { BricolageCostEstimator } from '../../components/bricolage/BricolageCostEstimator';
import { BricolagePriceGuide } from '../../components/bricolage/BricolagePriceGuide';
import { BricolageReviewsSection } from '../../components/bricolage/BricolageReviewsSection';
import { ArtisanUpgradeModal } from '../../components/bricolage/ArtisanUpgradeModal';
import { ArtisanDetailModal } from '../../components/bricolage/ArtisanDetailModal';
import { ArtisanVerificationAdminModal } from '../../components/bricolage/ArtisanVerificationAdminModal';
import { BricolageNavTabs, BricolageViewMode } from '../../components/bricolage/BricolageNavTabs';
import { BricolageSidebar } from '../../components/bricolage/BricolageSidebar';
import { BricolageClientDashboard } from '../../components/bricolage/BricolageClientDashboard';
import { BricolageArtisanDashboard } from '../../components/bricolage/BricolageArtisanDashboard';
import { BricolageMessaging } from '../../components/bricolage/BricolageMessaging';
import { BricolageFooter } from '../../components/bricolage/BricolageFooter';

const INITIAL_REQUESTS: QuoteRequestDoc[] = [
  {
    id: 'REQ-1001',
    serviceCategoryId: 'plomberie',
    serviceName: 'Changement Chauffe-Eau 80L',
    wilaya: '16 - Alger',
    commune: 'Hydra',
    urgency: 'urgent_24h',
    customerName: 'Karim Ait',
    customerPhone: '0550123456',
    estimatedPriceDZD: { min: 15000, max: 22000 },
    description: 'Chauffe-eau électrique en panne suite à un court-circuit. Remplacement souhaité avec fourniture du matériel.',
    status: 'quoted',
    createdAt: '2026-02-14T10:30:00Z',
    projectPhotos: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80'
    ],
    offers: [
      {
        id: 'OFF-01',
        artisanId: 'art-01',
        artisanName: 'Mourad Benali',
        artisanPhone: '0661987654',
        artisanRating: 4.9,
        priceDZD: 17500,
        estimatedDuration: '1 Jour',
        notes: 'Inclus déplacement + dépose de l’ancien chauffe-eau. Garantie 1 an.',
        createdAt: '2026-02-14T11:00:00Z',
        status: 'pending'
      }
    ]
  },
  {
    id: 'REQ-1002',
    serviceCategoryId: 'electricite',
    serviceName: 'Installation Tableau Électrique & Disjoncteur',
    wilaya: '31 - Oran',
    commune: 'Es Senia',
    urgency: 'normal',
    customerName: 'Yassine K.',
    customerPhone: '0770987654',
    estimatedPriceDZD: { min: 25000, max: 35000 },
    description: 'Remise aux normes du tableau électrique de l’appartement F4.',
    status: 'pending',
    createdAt: '2026-02-15T09:15:00Z',
    projectPhotos: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
    ],
    offers: []
  }
];

type LocalViewMode = BricolageViewMode | 'cost_estimator' | 'price_guide';

export function OlmaBricolage(): React.ReactElement {
  const { i18n } = useTranslation();
  const lang = ((i18n.language || 'fr') as 'fr' | 'ar' | 'en');
  const authContext = useAuth();
  const { currentUser, userProfile } = authContext;
  const openAuthModal = (authContext as unknown as { openAuthModal?: () => void }).openAuthModal;

  const [categories, setCategories] = useState<BricolageServiceCategory[]>([]);
  const [artisans, setArtisans] = useState<VerifiedArtisan[]>([]);
  const [reviews, setReviews] = useState<BricolageReview[]>([]);

  // Unified Role & Mode setup
  const [activeRole, setActiveRole] = useState<'demandeur' | 'artisan'>('demandeur');
  const [activeViewMode, setActiveViewMode] = useState<LocalViewMode>('marketplace');

  // Dynamic state
  const [requests, setRequests] = useState<QuoteRequestDoc[]>(INITIAL_REQUESTS);
  const [opportunities, setOpportunities] = useState<ArtisanOpportunityDTO[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState<boolean>(false);
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null);
  const [opportunitiesHttpStatus, setOpportunitiesHttpStatus] = useState<number | null>(null);

  const [conversations] = useState<BricolageConversation[]>([]);
  const [messages, setMessages] = useState<BricolageMessage[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('CONV-01');
  const [isAvailable24_7, setIsAvailable24_7] = useState(true);

  // Modals & Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BricolageServiceCategory | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | undefined>(undefined);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isArtisanUpgradeOpen, setIsArtisanUpgradeOpen] = useState(false);
  const [isAdminVerificationOpen, setIsAdminVerificationOpen] = useState(false);
  const [activeArtisanDetail, setActiveArtisanDetail] = useState<VerifiedArtisan | null>(null);
  const [callAlert, setCallAlert] = useState<string | null>(null);
  const [acceptNotice, setAcceptNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active Artisan Profile from Unified Account Profile
  const activeArtisanProfile: ActiveArtisanProfile | null = (
    userProfile && ((userProfile.role as string) === 'artisan' || userProfile.artisanProfile)
      ? ({
          id: currentUser?.uid || 'art-01',
          fullName: userProfile?.displayName || currentUser?.displayName || 'Artisan Olmart',
          specialty: 'Plomberie & Chauffage',
          wilaya: userProfile?.wilaya || '16 - Alger',
          commune: 'Alger Centre',
          phone: userProfile?.phone || '0550 00 00 00',
          registryNumber: 'ART-2026-16098',
          yearsOfExperience: 5,
          isAvailable24_7: true,
          registeredAt: '2026-01-01',
          verifiedBadge: true,
          rating: 4.9,
          ...(userProfile.artisanProfile || {})
        } as ActiveArtisanProfile)
      : null
  );

  const olmartCustomerName = currentUser
    ? (userProfile?.displayName || currentUser.displayName || currentUser.email?.split('@')[0] || 'Client Olmart')
    : 'Client Olmart (Invité)';

  useEffect(() => {
    async function initData() {
      const [catData, artData, revData] = await Promise.all([
        fetchBricolageCategories(),
        fetchVerifiedArtisans(),
        fetchBricolageReviews()
      ]);
      setCategories(catData);
      setArtisans(artData);
      setReviews(revData);
    }
    initData();
  }, []);

  const loadOpportunities = useCallback(async () => {
    setLoadingOpportunities(true);
    setOpportunitiesError(null);
    setOpportunitiesHttpStatus(null);

    let token: string | undefined = undefined;
    if (currentUser) {
      try {
        token = await currentUser.getIdToken();
      } catch (e) {
        console.warn('[OlmaBricolage] Error getting idToken:', e);
      }
    }

    const res = await getArtisanOpportunities(undefined, token);
    if (res.success && res.data) {
      setOpportunities(res.data);
      setOpportunitiesHttpStatus(res.status || 200);
    } else {
      setOpportunities([]);
      setOpportunitiesError(res.error || 'Erreur lors de la récupération des opportunités.');
      setOpportunitiesHttpStatus(res.status || 500);
    }
    setLoadingOpportunities(false);
  }, [currentUser]);

  useEffect(() => {
    if (activeRole === 'artisan' || activeViewMode === 'artisan_dashboard') {
      loadOpportunities();
    }
  }, [activeRole, activeViewMode, loadOpportunities]);

  const handleArtisanSubmitOffer = async (requestId: string, priceDZD: number, duration: string, notes: string) => {
    try {
      const res = await submitArtisanOffer({
        requestId,
        priceDZD,
        estimatedDuration: duration,
        notes,
        artisanName: activeArtisanProfile?.fullName || 'Artisan Olmart'
      });
      if (res.success) {
        setCallAlert('✅ Proposition d’intervention transmise au client avec succès !');
        setTimeout(() => setCallAlert(null), 5000);
        loadOpportunities();
      } else {
        alert(res.message || 'Erreur lors de la transmission de la proposition.');
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      alert(errorMsg || 'Erreur lors de la transmission de la proposition.');
    }
  };

  const handleOpenQuoteWizard = (cat?: BricolageServiceCategory, taskName?: string) => {
    setSelectedCategory(cat || categories[0] || null);
    setSelectedTask(taskName);
    setIsQuoteModalOpen(true);
  };

  const handleCallArtisan = (artisan: VerifiedArtisan) => {
    setCallAlert(`📞 Mise en relation directe avec ${artisan.name} (${artisan.phone}). Hotline : 023 00 00 00`);
    setTimeout(() => setCallAlert(null), 8000);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    const newMsg: BricolageMessage = {
      id: `MSG-${Date.now()}`,
      conversationId: activeConversationId,
      senderId: currentUser?.uid || (activeRole === 'artisan' ? 'artisan' : 'client'),
      senderName: olmartCustomerName,
      senderType: activeRole === 'artisan' ? 'artisan' : 'client',
      text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const handleAcceptOffer = async (requestId: string, offer: QuoteOffer) => {
    setAcceptNotice(null);

    if (!currentUser) {
      if (openAuthModal) {
        openAuthModal();
      }
      setAcceptNotice({
        type: 'error',
        message: 'Votre session a expiré. Veuillez vous reconnecter.'
      });
      return;
    }

    // Call acceptQuoteOffer sending ONLY requestId and offer.id (NEVER full offer object)
    const res = await acceptQuoteOffer(requestId, offer.id);

    if (res.success) {
      setRequests(prev =>
        prev.map(req => {
          if (req.id !== requestId) return req;

          const updatedOffers = (req.offers || []).map(o => ({
            ...o,
            status: o.id === offer.id ? ('accepted' as const) : ('declined' as const)
          }));

          const backendAcceptedOffer = res.data?.acceptedOffer
            ? (res.data.acceptedOffer as unknown as QuoteOffer)
            : { ...offer, status: 'accepted' as const };

          return {
            ...req,
            status: 'accepted' as const,
            acceptedOffer: backendAcceptedOffer,
            offers: updatedOffers
          };
        })
      );

      setAcceptNotice({
        type: 'success',
        message: 'Devis accepté avec succès ! Vous pouvez maintenant échanger directement avec l\'artisan.'
      });
    } else {
      let errorMsg = res.error || 'Erreur lors de l\'acceptation du devis.';
      if (res.status === 401) {
        errorMsg = 'Votre session a expiré. Veuillez vous reconnecter.';
      } else if (res.status === 403) {
        errorMsg = 'Vous n\'êtes pas autorisé à accepter ce devis.';
      } else if (res.status === 404) {
        errorMsg = 'Ce devis ou cette demande n\'existe plus.';
      } else if (res.status === 409) {
        errorMsg = res.error || 'Un devis a déjà été accepté pour cette demande.';
      } else if (res.status === 500) {
        errorMsg = 'Une erreur serveur est survenue. Veuillez réessayer ultérieurement.';
      }

      setAcceptNotice({
        type: 'error',
        message: errorMsg
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <BricolageHeader
        onRequestQuoteClick={() => handleOpenQuoteWizard()}
        activeArtisanProfile={activeArtisanProfile}
        onOpenArtisanAuth={() => setIsArtisanUpgradeOpen(true)}
        olmartCustomerName={olmartCustomerName}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <BricolageNavTabs
        activeRole={activeRole}
        activeView={activeViewMode as BricolageViewMode}
        activeViewMode={activeViewMode as BricolageViewMode}
        onRoleChange={(role) => {
          setActiveRole(role);
          if (role === 'artisan') setActiveViewMode('artisan_dashboard');
          else setActiveViewMode('marketplace');
        }}
        onViewChange={(mode) => setActiveViewMode(mode)}
        onViewModeChange={(mode) => setActiveViewMode(mode)}
        activeArtisanProfile={activeArtisanProfile}
        olmartCustomerName={olmartCustomerName}
        onOpenArtisanAuth={() => setIsArtisanUpgradeOpen(true)}
        onOpenAdminVerification={() => setIsAdminVerificationOpen(true)}
      />

      {callAlert && (
        <div className="bg-amber-400 text-slate-950 font-black text-center py-2.5 px-4 text-xs flex items-center justify-center gap-2 border-b border-amber-500">
          <PhoneCall className="w-4 h-4 animate-bounce" />
          <span>{callAlert}</span>
        </div>
      )}

      <main className="flex-1 w-full bg-slate-100 text-slate-900 pb-16">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
          {activeViewMode === 'marketplace' && (
            <div className="space-y-12">
              <BricolageHero
                categories={categories}
                lang={lang}
                onSelectCategory={(cat) => handleOpenQuoteWizard(cat)}
                onSearch={(query, wilaya) => console.log("Search in OlmaBricolage:", query, wilaya)}
              />
              <ServiceCategoryGrid
                categories={categories}
                lang={lang}
                onSelectCategory={(cat, task) => handleOpenQuoteWizard(cat, task)}
                onRequestQuote={(cat, task) => handleOpenQuoteWizard(cat, task)}
              />
              <ArtisanList
                artisans={artisans}
                onCallArtisan={(art) => handleCallArtisan(art)}
              />
              <BricolageReviewsSection reviews={reviews} />
            </div>
          )}

          {activeViewMode === 'cost_estimator' && (
            <BricolageCostEstimator
              categories={categories}
              onOrderEstimate={(category, serviceName) => handleOpenQuoteWizard(category, serviceName)}
            />
          )}

          {activeViewMode === 'price_guide' && (
            <BricolagePriceGuide />
          )}

          {activeViewMode === 'client_dashboard' && (
            <BricolageClientDashboard
              requests={requests}
              onNewRequestClick={() => handleOpenQuoteWizard()}
              onOpenChat={() => setActiveViewMode('messaging')}
              onAcceptOffer={handleAcceptOffer}
              acceptNotice={acceptNotice}
            />
          )}

          {activeViewMode === 'artisan_dashboard' && (
            <BricolageArtisanDashboard
              availableLeads={opportunities}
              loadingLeads={loadingOpportunities}
              errorLeads={opportunitiesError}
              leadsHttpStatus={opportunitiesHttpStatus}
              onSubmitOffer={handleArtisanSubmitOffer}
              onOpenChat={() => setActiveViewMode('messaging')}
              onToggleAvailability={(status) => setIsAvailable24_7(status)}
              isAvailable24_7={isAvailable24_7}
              activeArtisanProfile={activeArtisanProfile}
              onRegisterClick={() => setIsArtisanUpgradeOpen(true)}
              onRefreshLeads={loadOpportunities}
            />
          )}

          {activeViewMode === 'messaging' && (
            <BricolageMessaging
              conversations={conversations}
              messages={messages}
              activeConversationId={activeConversationId}
              onSelectConversation={(id) => setActiveConversationId(id)}
              onSendMessage={handleSendMessage}
              currentUserType={activeRole === 'artisan' ? 'artisan' : 'client'}
            />
          )}
        </div>
      </main>

      <BricolageFooter />

      <BricolageSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeRole={activeRole}
        onRoleChange={(role) => {
          setActiveRole(role);
          if (role === 'artisan') setActiveViewMode('artisan_dashboard');
          else setActiveViewMode('marketplace');
        }}
        activeView={activeViewMode as BricolageViewMode}
        onViewChange={(view) => setActiveViewMode(view)}
        activeArtisanProfile={activeArtisanProfile}
        onOpenArtisanAuth={() => setIsArtisanUpgradeOpen(true)}
        olmartCustomerName={olmartCustomerName}
        onRequestQuoteClick={() => handleOpenQuoteWizard()}
      />

      {isQuoteModalOpen && (
        <ProjectWizardModal
          category={selectedCategory}
          initialTask={selectedTask}
          lang={lang}
          onClose={() => setIsQuoteModalOpen(false)}
        />
      )}

      {isArtisanUpgradeOpen && (
        <ArtisanUpgradeModal
          onClose={() => setIsArtisanUpgradeOpen(false)}
          onOpenMainAuthModal={openAuthModal}
          onSuccessUpgrade={(profile) => {
            setIsArtisanUpgradeOpen(false);
            setActiveRole('artisan');
            setActiveViewMode('artisan_dashboard');
            setCallAlert(`🎉 Félicitations ${profile.fullName} ! Votre compte Olmart bénéficie du statut Artisan Certifié.`);
          }}
        />
      )}

      {activeArtisanDetail && (
        <ArtisanDetailModal
          artisan={activeArtisanDetail}
          onClose={() => setActiveArtisanDetail(null)}
          onCall={(art) => handleCallArtisan(art)}
          onRequestQuote={(art) => {
            setActiveArtisanDetail(null);
            handleOpenQuoteWizard(categories[0], art.specialty);
          }}
        />
      )}

      {isAdminVerificationOpen && (
        <ArtisanVerificationAdminModal
          onClose={() => setIsAdminVerificationOpen(false)}
          onStatusUpdated={() => {
            setCallAlert("✅ Modération terminée : Le statut de l'artisan a été mis à jour.");
            setTimeout(() => setCallAlert(null), 5000);
          }}
        />
      )}
    </div>
  );
}
