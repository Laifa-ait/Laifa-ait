import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HardHat,
  ShieldCheck,
  CheckCircle2,
  Send,
  DollarSign,
  Clock,
  MapPin,
  MessageSquare,
  Power,
  Briefcase,
  Bell,
  Sparkles,
  Layers,
  Camera,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { ArtisanOpportunityDTO, ActiveArtisanProfile } from '../../types/bricolage';

interface BricolageArtisanDashboardProps {
  availableLeads: ArtisanOpportunityDTO[];
  loadingLeads?: boolean;
  errorLeads?: string | null;
  leadsHttpStatus?: number | null;
  onSubmitOffer: (requestId: string, priceDZD: number, duration: string, notes: string) => void;
  onOpenChat: (requestId: string, clientName: string) => void;
  onToggleAvailability: (status: boolean) => void;
  isAvailable24_7: boolean;
  activeArtisanProfile?: ActiveArtisanProfile | null;
  onRegisterClick?: () => void;
  onRefreshLeads?: () => void;
}

export const BricolageArtisanDashboard: React.FC<BricolageArtisanDashboardProps> = ({
  availableLeads,
  loadingLeads,
  errorLeads,
  leadsHttpStatus,
  onSubmitOffer,
  onOpenChat,
  onToggleAvailability,
  isAvailable24_7,
  activeArtisanProfile,
  onRegisterClick,
  onRefreshLeads
}) => {
  const [selectedLeadForOffer, setSelectedLeadForOffer] = useState<ArtisanOpportunityDTO | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>(activeArtisanProfile?.specialty || 'all');
  const [offerPrice, setOfferPrice] = useState<number>(3500);
  const [offerDuration, setOfferDuration] = useState<string>('2 heures');
  const [offerNotes, setOfferNotes] = useState<string>('Bonjour, je possède le matériel adéquat et suis disponible dès aujourd’hui.');

  // Lightbox Modal state for inspecting client project photos
  const [lightboxData, setLightboxData] = useState<{
    photos: string[];
    index: number;
    title: string;
  } | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForOffer) return;

    onSubmitOffer(
      selectedLeadForOffer.id,
      offerPrice,
      offerDuration,
      offerNotes
    );
    setSelectedLeadForOffer(null);
  };

  // Filter leads by domain if requested
  const filteredLeads = availableLeads.filter(lead => {
    if (selectedDomain === 'all') return true;
    const leadObj = lead as unknown as Record<string, unknown>;
    const catName = (lead.serviceName || String(leadObj.categoryName || '') || String(leadObj.taskName || '') || '').toLowerCase();
    const dom = selectedDomain.toLowerCase();
    if (dom.includes('plomberie') && (catName.includes('fuite') || catName.includes('plomb') || catName.includes('eau') || catName.includes('chauffe'))) return true;
    if (dom.includes('électri') && (catName.includes('électr') || catName.includes('court') || catName.includes('panne'))) return true;
    if (dom.includes('clima') && (catName.includes('clim') || catName.includes('froid') || catName.includes('gaz'))) return true;
    if (dom.includes('peinture') && (catName.includes('peint') || catName.includes('ba13') || catName.includes('plâtr'))) return true;
    return catName.includes(dom) || dom.includes(catName);
  });

  // If user is not registered with an active artisan profile, show ONLY the registration & onboarding portal
  if (!activeArtisanProfile) {
    return (
      <div className="space-y-8">
        {/* Onboarding Gateway Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-slate-950 border-2 border-amber-400 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 text-amber-400 text-xs font-black uppercase tracking-wider shadow-sm">
              <HardHat className="w-4 h-4 text-amber-400" />
              <span>Espace Pro Artisan • Bricoleur DZ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 leading-tight">
              Devenez Artisan Certifié Olma & Débloquez Vos Chantiers
            </h1>
            <p className="text-xs font-extrabold text-slate-900/90 leading-relaxed">
              Vous êtes électricien, plombier, chauffagiste, peintre ou ouvrier qualifié en Algérie ? Rejoignez le réseau professionnel N°1 pour recevoir les demandes de clients dans votre Wilaya et gérer vos devis.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={onRegisterClick}
              className="w-full px-6 py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs border-2 border-amber-400 shadow-2xl flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>S'inscrire comme Artisan Pro</span>
            </button>
            <span className="text-[11px] font-bold text-slate-900 text-center">
              Mise en service rapide & Sans engagement
            </span>
          </div>
        </div>

        {/* Notice Card explaining role requirement */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border-2 border-slate-800 shadow-xl space-y-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 font-black">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Inscription Requise pour Accéder aux Paramètres & Chantiers Pro
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed mt-1">
                Les paramètres avancés (Alertes SMS/Push par domaine, statistiques de revenus, filtres de recherche et soumission de propositions) s'affichent uniquement une fois inscrit avec le <strong className="text-amber-400">Statut Artisan Pro</strong>.
              </p>
            </div>
          </div>

          {/* 4 Feature Advantages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <Briefcase className="w-6 h-6 text-amber-400" />
              <h4 className="text-xs font-black text-white">Chantiers Qualifiés</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Recevez des alertes en temps réel pour des demandes de travaux dans votre commune et wilaya.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              <h4 className="text-xs font-black text-white">Tarifs Libres en DA</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Fixez vous-même vos prix selon le matériel fourni et la complexité de la réparation.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <MessageSquare className="w-6 h-6 text-orange-400" />
              <h4 className="text-xs font-black text-white">Messagerie Directe</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Échangez directement avec les demandeurs de services pour préciser les détails de l'intervention.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <CheckCircle2 className="w-6 h-6 text-amber-400" />
              <h4 className="text-xs font-black text-white">Badge Vérifié Olma</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Gagnez la confiance des clients grâce à notre label de qualité et vos avis clients.
              </p>
            </div>
          </div>

          {/* Action Bottom */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-300 font-medium">
              Prêt à commencer à recevoir des demandes de travaux ?
            </div>
            <button
              onClick={onRegisterClick}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md border border-amber-300"
            >
              Activer Mon Profil Artisan Pro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Artisan Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-slate-950 border-2 border-amber-400 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 text-amber-400 text-xs font-black uppercase tracking-wider shadow-sm">
            <HardHat className="w-4 h-4 text-amber-400" />
            <span>Espace Pro Artisan • Bricoleur DZ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            {activeArtisanProfile ? `Bienvenue, ${activeArtisanProfile.fullName}` : 'Espace Artisan Certifié Olma'}
          </h1>
          <p className="text-xs font-bold text-slate-900/80 max-w-lg">
            {activeArtisanProfile
              ? `Spécialité : ${activeArtisanProfile.specialty} • Wilaya : ${activeArtisanProfile.wilaya}. Vous recevez en priorité les demandes d'intervention correspondant à votre métier.`
              : 'Espace réservé aux électriciens, plombiers, chauffagistes et ouvriers qualifiés. Connectez-vous ou créez votre compte artisan pour soumettre vos devis.'
            }
          </p>
        </div>

        {/* Status Toggle & Profile Badge */}
        <div className="flex flex-wrap items-center gap-3">
          {!activeArtisanProfile ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onRegisterClick}
                className="px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs border border-amber-400 shadow-xl flex items-center gap-2 shrink-0 transition-transform active:scale-95"
              >
                <HardHat className="w-4 h-4 text-amber-400" />
                <span>Se Connecter / Créer un Compte Pro</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-950/90 text-white p-3.5 rounded-2xl border border-amber-400/40 flex items-center gap-4 shrink-0 shadow-lg">
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-extrabold block">
                  Dépannage 24/7
                </span>
                <span className="text-xs font-bold">
                  {isAvailable24_7 ? '🟢 En Ligne' : '🔴 Hors Ligne'}
                </span>
              </div>

              <button
                onClick={() => onToggleAvailability(!isAvailable24_7)}
                className={`p-2.5 rounded-xl transition-colors flex items-center gap-2 text-xs font-black ${
                  isAvailable24_7
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{isAvailable24_7 ? 'Disponible' : 'Indisponible'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Unauthenticated Gateway Card if not logged in */}
      {!activeArtisanProfile && (
        <div className="bg-gradient-to-r from-slate-950 via-zinc-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white border-2 border-amber-400 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Accès Espace Professionnel Artisan • Olma DZ</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">Consultez les chantiers et soumettez vos devis en toute simplicité</h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Pour répondre aux demandes des clients dans votre wilaya, vous devez vous connecter à votre compte professionnel certifié.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={onRegisterClick}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xl flex items-center justify-center gap-2 border border-amber-300"
            >
              <HardHat className="w-4 h-4 text-slate-950" />
              <span>Connexion / Inscription Artisan</span>
            </button>
          </div>
        </div>
      )}

      {/* Domain Alert Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-zinc-900 to-amber-950 rounded-2xl p-4 sm:p-5 text-white border-2 border-amber-500/50 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-md">
            <Bell className="w-5 h-5 text-slate-950 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wide">
                Alertes Domaine Activées
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SMS & Notification Push
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Vous recevez automatiquement des alertes d'intervention pour : <strong className="text-white">{activeArtisanProfile?.specialty || 'Toutes les spécialités de Bricolage'}</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-400">Filtrer par Domaine :</span>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-black focus:outline-none focus:border-amber-400"
          >
            <option value="all">Tous les Domaines</option>
            <option value="Plomberie & Chauffage">Plomberie & Chauffage</option>
            <option value="Électricité Bâtiment">Électricité Bâtiment</option>
            <option value="Climatisation & Froid">Climatisation & Froid</option>
            <option value="Peinture & BA13">Peinture & BA13</option>
          </select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Opportunités Ouvertes</span>
          <div className="text-2xl font-black text-slate-900">{filteredLeads.length} Demandes</div>
          <p className="text-[11px] text-emerald-600 font-bold">Alerte domaine active</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Gains Réalisés</span>
          <div className="text-2xl font-black text-amber-600">84 500 DA</div>
          <p className="text-[11px] text-slate-500 font-bold">Ce mois-ci</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Chantiers Effectués</span>
          <div className="text-2xl font-black text-slate-900">18 Chantiers</div>
          <p className="text-[11px] text-emerald-600 font-bold">100% de satisfaction</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Note Global Olma</span>
          <div className="text-2xl font-black text-amber-500">4.9 / 5.0</div>
          <p className="text-[11px] text-slate-500 font-bold">Badge Verifié ID active</p>
        </div>
      </div>

      {/* Available Opportunities List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-600" />
            <span>Demandes de Clients (Demandeurs de Service)</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">
            {filteredLeads.length} opportunité(s) disponible(s)
          </span>
        </div>

        <div className="space-y-4">
          {leadsHttpStatus === 403 ? (
            <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 text-amber-950 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                  <ShieldCheck className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Compte Artisan en Cours de Validation
                  </h3>
                  <p className="text-xs font-bold text-slate-700">
                    Validation administrative requise
                  </p>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-800 leading-relaxed pt-1">
                Votre compte artisan est en cours de vérification. Les demandes de travaux seront disponibles après validation de votre profil.
              </p>
            </div>
          ) : loadingLeads ? (
            <div className="bg-white rounded-3xl p-8 text-center border-2 border-slate-200 space-y-3">
              <div className="w-8 h-8 mx-auto border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-600">Chargement des opportunités de chantiers...</p>
            </div>
          ) : errorLeads ? (
            <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 text-rose-900 flex items-center justify-between gap-4">
              <p className="text-xs font-bold">{errorLeads}</p>
              {onRefreshLeads && (
                <button
                  onClick={onRefreshLeads}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0"
                >
                  Réessayer
                </button>
              )}
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-slate-200 space-y-2">
              <Layers className="w-8 h-8 mx-auto text-slate-400" />
              <h3 className="text-sm font-black text-slate-900">Aucune demande dans ce domaine actuellement</h3>
              <p className="text-xs text-slate-500 font-medium">Basculez sur "Tous les Domaines" pour voir l'ensemble des projets disponibles.</p>
              <button
                onClick={() => setSelectedDomain('all')}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs"
              >
                Afficher Tous les Domaines
              </button>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const leadObj = lead as unknown as Record<string, unknown>;
              const urgencyStr = (lead.urgency || String(leadObj.urgencyLevel || 'normal')).toString();
              const serviceNameStr = lead.serviceName || 'Demande de service';
              const customerNameStr = lead.customerDisplayName || 'Client Olmart';
              const createdAtStr = lead.createdAt ? String(lead.createdAt).split('T')[0] : 'Récemment';
              const minPrice = lead.estimatedPriceDZD?.min ?? 10000;
              const maxPrice = lead.estimatedPriceDZD?.max ?? 20000;

              return (
                <div
                  key={lead.id}
                  className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-amber-400 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        ID: {lead.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                        {urgencyStr.replace('_', ' ')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800">
                        {lead.offersCount || 0} devis proposé(s)
                      </span>
                      {lead.hasSubmittedOffer && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                          Mon offre : {lead.myOffer?.priceDZD ? `${lead.myOffer.priceDZD} DA` : 'Transmise'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-slate-900">
                      {serviceNameStr}
                    </h3>

                    <p className="text-xs text-slate-600 font-medium line-clamp-2">
                      "{lead.description || 'Description standard du projet.'}"
                    </p>

                    {/* Project Photos Section for Artisans */}
                    {lead.projectPhotos && lead.projectPhotos.length > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-800 border border-amber-500/20">
                            <Camera className="w-3.5 h-3.5 text-amber-600" />
                            <span>{lead.projectPhotos.length} Photo(s) du chantier transmise(s)</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            (Cliquez pour agrandir)
                          </span>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {lead.projectPhotos.map((photoUrl, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => setLightboxData({
                                photos: lead.projectPhotos!,
                                index: pIdx,
                                title: serviceNameStr
                              })}
                              className="relative group w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-amber-500 shadow-xs transition-all shrink-0 bg-slate-900"
                            >
                              <img
                                src={photoUrl}
                                alt={`Chantier ${pIdx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-amber-400">
                                <Maximize2 className="w-4 h-4" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-bold pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        {lead.wilaya} {lead.commune ? `(${lead.commune})` : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        Demandé le : {createdAtStr}
                      </span>
                      <span className="flex items-center gap-1 text-slate-800 font-extrabold">
                        Client : {customerNameStr}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col items-end justify-center gap-3 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Budget Estimé Client</span>
                      <span className="text-lg font-black text-amber-600">
                        {lead.estimatedPriceDZD
                          ? `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} DA`
                          : String(leadObj.budgetEstimate || 'Sur Estimation')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => onOpenChat(lead.id, customerNameStr)}
                        className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                        title="Contacter le client par messagerie"
                      >
                        <MessageSquare className="w-4 h-4 text-slate-900" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedLeadForOffer(lead);
                          if (lead.myOffer?.priceDZD) {
                            setOfferPrice(lead.myOffer.priceDZD);
                          } else {
                            setOfferPrice(Math.round((minPrice + maxPrice) / 2));
                          }
                        }}
                        className="py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 border border-amber-400"
                      >
                        <Send className="w-3.5 h-3.5 text-slate-950" />
                        <span>{lead.hasSubmittedOffer ? 'Modifier mon Devis' : 'Proposer une Intervention'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Offer Modal */}
      {selectedLeadForOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400 text-slate-900">
            <h3 className="text-xl font-black text-slate-900 mb-1">
              Proposer une Tarif/Intervention pour "{selectedLeadForOffer.serviceName}"
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Client : {selectedLeadForOffer.customerDisplayName || 'Client Olmart'} ({selectedLeadForOffer.wilaya})
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Client attached project photos in modal */}
              {selectedLeadForOffer.projectPhotos && selectedLeadForOffer.projectPhotos.length > 0 && (
                <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 space-y-1.5">
                  <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>Photos transmises par le client ({selectedLeadForOffer.projectPhotos.length}) :</span>
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {selectedLeadForOffer.projectPhotos.map((pUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLightboxData({
                          photos: selectedLeadForOffer.projectPhotos!,
                          index: idx,
                          title: selectedLeadForOffer.serviceName
                        })}
                        className="w-14 h-14 rounded-xl overflow-hidden border-2 border-amber-400 hover:scale-105 transition-transform shrink-0 shadow-xs"
                      >
                        <img src={pUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-800 mb-1 block">
                  Votre Tarif Proposé (DA TTC) * :
                </label>
                <input
                  type="number"
                  step="500"
                  required
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-base font-black text-amber-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 mb-1 block">
                  Durée Estimée de l'Intervention :
                </label>
                <input
                  type="text"
                  required
                  value={offerDuration}
                  onChange={(e) => setOfferDuration(e.target.value)}
                  placeholder="Ex: 2 Heures / 1 Jour"
                  className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 mb-1 block">
                  Message / Notes Professionnelles :
                </label>
                <textarea
                  rows={3}
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLeadForOffer(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md border border-amber-400"
                >
                  Valider & Envoyer au Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Fullscreen Photo Viewing */}
      <AnimatePresence>
        {lightboxData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          >
            <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-between gap-4 p-4">
              {/* Header */}
              <div className="w-full flex items-center justify-between text-white border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-400" />
                  <span className="font-black text-sm text-amber-300">{lightboxData.title}</span>
                  <span className="text-xs text-slate-400 font-bold">
                    • Photo {lightboxData.index + 1} sur {lightboxData.photos.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxData(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image Container with Nav */}
              <div className="relative w-full flex items-center justify-center flex-1 my-2 overflow-hidden rounded-2xl bg-black border border-slate-800 min-h-[300px] max-h-[65vh]">
                <img
                  src={lightboxData.photos[lightboxData.index]}
                  alt={`Photo ${lightboxData.index + 1}`}
                  className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-2xl"
                />

                {lightboxData.photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setLightboxData((prev) => prev ? {
                        ...prev,
                        index: (prev.index - 1 + prev.photos.length) % prev.photos.length
                      } : null)}
                      className="absolute left-3 p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 backdrop-blur-sm transition-transform active:scale-95"
                      title="Photo précédente"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setLightboxData((prev) => prev ? {
                        ...prev,
                        index: (prev.index + 1) % prev.photos.length
                      } : null)}
                      className="absolute right-3 p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 backdrop-blur-sm transition-transform active:scale-95"
                      title="Photo suivante"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails strip if multiple */}
              {lightboxData.photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto p-1 max-w-full">
                  {lightboxData.photos.map((pUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLightboxData((prev) => prev ? { ...prev, index: idx } : null)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        idx === lightboxData.index
                          ? 'border-amber-400 scale-105 shadow-md'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={pUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
