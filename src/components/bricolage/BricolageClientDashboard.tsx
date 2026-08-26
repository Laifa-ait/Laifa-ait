import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  PlusCircle,
  HardHat,
  Calendar,
  MapPin,
  Tag,
  Star,
  Bell,
  Camera,
  Loader2
} from 'lucide-react';
import { QuoteRequestDoc, QuoteOffer } from '../../types/bricolage';

interface BricolageClientDashboardProps {
  requests: QuoteRequestDoc[];
  onNewRequestClick: () => void;
  onOpenChat: (requestId: string, artisanName: string) => void;
  onAcceptOffer: (requestId: string, offer: QuoteOffer) => void | Promise<void>;
  acceptNotice?: { type: 'success' | 'error'; message: string } | null;
}

export const BricolageClientDashboard: React.FC<BricolageClientDashboardProps> = ({
  requests,
  onNewRequestClick,
  onOpenChat,
  onAcceptOffer,
  acceptNotice
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'quoted' | 'in_progress' | 'completed'>('all');
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);

  const handleAccept = async (requestId: string, offer: QuoteOffer) => {
    if (acceptingOfferId) return; // Prevent double click
    setAcceptingOfferId(offer.id);
    try {
      await onAcceptOffer(requestId, offer);
    } finally {
      setAcceptingOfferId(null);
    }
  };

  // Count total received quote offers
  const totalOffersReceived = requests.reduce((acc, r) => acc + (r.offers ? r.offers.length : 0), 0);

  const filteredRequests = requests.filter(r => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return r.status === 'pending';
    if (activeFilter === 'quoted') return r.status === 'quoted' || (r.offers && r.offers.length > 0 && r.status !== 'accepted' && r.status !== 'completed');
    if (activeFilter === 'in_progress') return r.status === 'accepted' || r.status === 'in_progress';
    if (activeFilter === 'completed') return r.status === 'completed';
    return true;
  });

  const getStatusBadge = (status: string, offerCount: number) => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Intervention Terminée
        </span>
      );
    }
    if (status === 'accepted' || status === 'in_progress') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
          Chantier en Cours
        </span>
      );
    }
    if (offerCount > 0 || status === 'quoted') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-900 border border-orange-300">
          <Tag className="w-3.5 h-3.5 text-orange-600" />
          {offerCount} Proposition(s) Reçue(s)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-300">
        <Clock className="w-3.5 h-3.5 text-slate-500" />
        En Attente d'Artisans
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-3xl p-6 sm:p-8 text-white border-2 border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-1 rounded border border-amber-500/30">
            Espace Demandeur • Client DZ
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
            Tableau de Bord de mes Travaux
          </h1>
          <p className="text-xs text-slate-300 font-medium max-w-lg mt-1">
            Suivez l'état de vos demandes, comparez les propositions d'artisans certifiés et échangez en direct par messagerie.
          </p>
        </div>

        <button
          onClick={onNewRequestClick}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 border border-amber-400 shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>Nouvelle Demande d'Intervention</span>
        </button>
      </div>

      {/* Quote Alerts Center */}
      <div className="bg-amber-500/10 border-2 border-amber-400/80 rounded-3xl p-5 text-slate-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-md border border-amber-400">
            <Bell className="w-6 h-6 text-slate-950 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-amber-900 tracking-wider">
                Centre d'Alertes Interventions Client
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                {totalOffersReceived} Proposition(s) Reçue(s)
              </span>
            </div>
            <p className="text-xs font-medium text-slate-700 mt-0.5">
              Les artisans certifiés Olma répondent à vos demandes. Consultez et comparez les propositions ci-dessous.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveFilter('quoted')}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs shadow-md border border-slate-800 shrink-0 flex items-center gap-1.5"
        >
          <Tag className="w-4 h-4 text-amber-400" />
          <span>Voir Propositions Reçues ({totalOffersReceived})</span>
        </button>
      </div>


      {/* Notification Banner */}
      {acceptNotice && (
        <div
          className={`p-3.5 rounded-xl mb-4 text-xs font-bold flex items-center gap-2.5 border ${
            acceptNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {acceptNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{acceptNotice.message}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-amber-400 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Toutes mes Demandes ({requests.length})
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'pending'
              ? 'bg-slate-900 text-amber-400 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          En Attente
        </button>
        <button
          onClick={() => setActiveFilter('quoted')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'quoted'
              ? 'bg-slate-900 text-amber-400 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Propositions Reçues
        </button>
        <button
          onClick={() => setActiveFilter('in_progress')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'in_progress'
              ? 'bg-slate-900 text-amber-400 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          En Cours de Réalisation
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'completed'
              ? 'bg-slate-900 text-amber-400 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Terminés & Clôturés
        </button>
      </div>

      {/* Request Cards List */}
      <div className="space-y-6">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <HardHat className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Aucune demande trouvée</h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
              Vous n'avez actuellement aucune demande dans cette catégorie. Cliquez ci-dessous pour publier votre projet.
            </p>
            <button
              onClick={onNewRequestClick}
              className="mt-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Demander une Intervention
            </button>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const reqObj = req as unknown as Record<string, unknown>;
            const offerCount = req.offers ? req.offers.length : 0;
            const urgencyStr = (req.urgency || String(reqObj.urgencyLevel || 'normal')).toString();
            const serviceNameStr = req.serviceName || String(reqObj.taskName || '') || String(reqObj.categoryName || '') || 'Demande de service';
            const createdAtStr = req.createdAt ? String(req.createdAt).split('T')[0] : 'Récemment';
            const minPrice = req.estimatedPriceDZD?.min ?? 10000;
            const maxPrice = req.estimatedPriceDZD?.max ?? 20000;

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm hover:border-amber-400 transition-all space-y-6"
              >
                {/* Main Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        N° {req.id}
                      </span>
                      {getStatusBadge(req.status, offerCount)}
                    </div>
                    <h3 className="text-xl font-black text-slate-900">
                      {serviceNameStr}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold block">
                      Estimation Budget
                    </span>
                    <span className="text-base font-black text-amber-600">
                      {req.estimatedPriceDZD
                        ? `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} DA`
                        : String(reqObj.budgetEstimate || 'Sur Estimation')}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Lieu : <strong>{req.wilaya} {req.commune ? `(${req.commune})` : ''}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Urgence : <strong className="capitalize">{urgencyStr.replace('_', ' ')}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Créé le : <strong>{createdAtStr}</strong></span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 italic">
                  "{req.description || 'Pas de description supplémentaire renseignée.'}"
                </p>

                {/* Photos attached by client */}
                {req.projectPhotos && req.projectPhotos.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5 mb-2">
                      <Camera className="w-3.5 h-3.5 text-amber-600" />
                      <span>Photos du projet transmises aux artisans ({req.projectPhotos.length}) :</span>
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {req.projectPhotos.map((photoUrl, pIdx) => (
                        <div
                          key={pIdx}
                          className="relative group w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 shadow-xs shrink-0 bg-slate-900"
                        >
                          <img
                            src={photoUrl}
                            alt={`Chantier ${pIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Received Artisan Offers Section */}
                {req.offers && req.offers.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-600" />
                      Propositions des Artisans ({req.offers.length}) :
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {req.offers.map((offer) => {
                        const isAccepted = offer.status === 'accepted';

                        return (
                          <div
                            key={offer.id}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
                              isAccepted
                                ? 'bg-amber-50 border-amber-400 shadow-md'
                                : 'bg-white border-slate-200 hover:border-amber-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h5 className="font-extrabold text-slate-900 text-sm">{offer.artisanName}</h5>
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                    {offer.artisanRating}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium">{offer.notes}</p>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-base font-black text-slate-900 block">
                                  {offer.priceDZD.toLocaleString()} DA
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold block">
                                  {offer.estimatedDuration}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                              <button
                                onClick={() => onOpenChat(req.id, offer.artisanName)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                                <span>Discuter en Direct</span>
                              </button>

                              {isAccepted ? (
                                <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Proposition Acceptée
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleAccept(req.id, offer)}
                                  disabled={Boolean(acceptingOfferId) || req.status === 'accepted'}
                                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs shadow-sm flex items-center gap-1.5"
                                >
                                  {acceptingOfferId === offer.id ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                                      <span>Validation...</span>
                                    </>
                                  ) : (
                                    <span>Accepter cette Proposition</span>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
