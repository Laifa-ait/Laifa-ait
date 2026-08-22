import React, { useState } from 'react';
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Ban,
  AlertCircle,
  Loader2,
  Send
} from 'lucide-react';
import { NegotiationOfferPayload } from '../../types/messaging';

interface NegotiationPanelProps {
  negotiation: NegotiationOfferPayload;
  currentUserId: string;
  onAccept: (offerId: string) => Promise<void>;
  onReject: (offerId: string) => Promise<void>;
  onCounter: (offerId: string, counterAmount: number) => Promise<void>;
  onCancel: (offerId: string) => Promise<void>;
  loadingAction: string | null;
}

export const NegotiationPanel: React.FC<NegotiationPanelProps> = ({
  negotiation,
  currentUserId,
  onAccept,
  onReject,
  onCounter,
  onCancel,
  loadingAction
}) => {
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [counterAmount, setCounterAmount] = useState<string>('');
  const [counterError, setCounterError] = useState<string | null>(null);

  const isProposer = negotiation.proposedByUid === currentUserId;
  const isTarget = negotiation.targetUid === currentUserId;
  const isPending = negotiation.status === 'PENDING';

  const isExpired =
    negotiation.status === 'EXPIRED' ||
    (isPending && new Date(negotiation.expiresAt).getTime() < Date.now());

  const formatPrice = (amt: number) =>
    amt.toLocaleString('fr-DZ', { maximumFractionDigits: 0 }) + ' DZD';

  const handleCounterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(counterAmount, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setCounterError('Veuillez entrer un montant valide supérieur à 0.');
      return;
    }
    setCounterError(null);
    await onCounter(negotiation.offerId, parsed);
    setShowCounterInput(false);
    setCounterAmount('');
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-slate-900/40 border border-amber-500/30 rounded-2xl p-4 my-3 text-slate-100 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Offre de négociation
            </h4>
            <span className="text-[11px] text-slate-400">
              {isProposer ? 'Votre proposition de prix' : 'Proposition reçue'}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {negotiation.status === 'ACCEPTED' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle className="w-3.5 h-3.5" /> Acceptée
            </span>
          )}
          {negotiation.status === 'REJECTED' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
              <XCircle className="w-3.5 h-3.5" /> Refusée
            </span>
          )}
          {negotiation.status === 'CANCELLED' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30">
              <Ban className="w-3.5 h-3.5" /> Annulée
            </span>
          )}
          {negotiation.status === 'COUNTERED' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <RotateCcw className="w-3.5 h-3.5" /> Contre-offre émise
            </span>
          )}
          {isPending && !isExpired && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
              <Clock className="w-3.5 h-3.5" /> En attente de réponse
            </span>
          )}
          {isExpired && negotiation.status === 'PENDING' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">
              <Clock className="w-3.5 h-3.5" /> Expirée
            </span>
          )}
        </div>
      </div>

      {/* Pricing Comparison */}
      <div className="grid grid-cols-2 gap-3 my-3">
        {negotiation.initialPriceDZD > 0 && (
          <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Prix initial</span>
            <span className="text-sm font-semibold text-slate-300 line-through">
              {formatPrice(negotiation.initialPriceDZD)}
            </span>
          </div>
        )}

        <div className={`bg-slate-900/80 rounded-xl p-2.5 border ${negotiation.initialPriceDZD > 0 ? 'border-amber-500/30' : 'col-span-2 border-amber-500/30'}`}>
          <span className="text-[11px] text-amber-400 block font-medium">Prix proposé</span>
          <span className="text-base font-extrabold text-amber-300">
            {formatPrice(negotiation.amountDZD)}
          </span>
        </div>
      </div>

      {/* Terms or Notes */}
      {negotiation.terms && (
        <div className="text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800 mb-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Note de l'émetteur :</span>
          {negotiation.terms}
        </div>
      )}

      {/* Actions Determinated by Server-Side State */}
      {isPending && !isExpired && (
        <div className="pt-2 border-t border-amber-500/20">
          {/* Target User Actions */}
          {isTarget && (
            <div className="space-y-2">
              {!showCounterInput ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onAccept(negotiation.offerId)}
                    disabled={loadingAction !== null}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow cursor-pointer min-h-[38px]"
                  >
                    {loadingAction === `accept-${negotiation.offerId}` ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    <span>Accepter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCounterInput(true)}
                    disabled={loadingAction !== null}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow cursor-pointer min-h-[38px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Contre-offre</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onReject(negotiation.offerId)}
                    disabled={loadingAction !== null}
                    className="py-2 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 disabled:opacity-50 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer min-h-[38px]"
                  >
                    {loadingAction === `reject-${negotiation.offerId}` ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    <span>Refuser</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCounterSubmit} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={counterAmount}
                      onChange={(e) => setCounterAmount(e.target.value)}
                      placeholder="Montant contre-offre (DZD)"
                      disabled={loadingAction !== null}
                      className="flex-1 bg-slate-900 border border-blue-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400"
                    />
                    <button
                      type="submit"
                      disabled={loadingAction !== null || !counterAmount}
                      className="py-2 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer min-h-[36px]"
                    >
                      {loadingAction === `counter-${negotiation.offerId}` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Envoyer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCounterInput(false)}
                      className="py-2 px-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs cursor-pointer min-h-[36px]"
                    >
                      Annuler
                    </button>
                  </div>
                  {counterError && (
                    <div className="flex items-center gap-1 text-[11px] text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      <span>{counterError}</span>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}

          {/* Proposer User Actions */}
          {isProposer && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                En attente de la décision de votre interlocuteur.
              </span>
              <button
                type="button"
                onClick={() => onCancel(negotiation.offerId)}
                disabled={loadingAction !== null}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 border border-slate-700 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer min-h-[32px]"
              >
                {loadingAction === `cancel-${negotiation.offerId}` ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Ban className="w-3 h-3 text-red-400" />
                )}
                <span>Retirer mon offre</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
