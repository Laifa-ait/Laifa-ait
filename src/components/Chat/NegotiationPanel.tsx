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
    <div className="bg-[#fefbf3] border border-[#e8dcc4] rounded-2xl p-4 my-3 text-slate-800 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d4]">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#f4ecd8] text-[#1e3835] rounded-xl border border-[#e8e2d4]">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#1e3835] uppercase tracking-wider">
              Offre de négociation
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              {isProposer ? 'Votre proposition de prix' : 'Proposition reçue'}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {negotiation.status === 'ACCEPTED' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-700" /> Acceptée
            </span>
          )}
          {negotiation.status === 'REJECTED' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
              <XCircle className="w-3.5 h-3.5 text-rose-700" /> Refusée
            </span>
          )}
          {negotiation.status === 'CANCELLED' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
              <Ban className="w-3.5 h-3.5" /> Annulée
            </span>
          )}
          {negotiation.status === 'COUNTERED' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" /> Contre-offre émise
            </span>
          )}
          {isPending && !isExpired && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-700" /> En attente de réponse
            </span>
          )}
          {isExpired && negotiation.status === 'PENDING' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
              <Clock className="w-3.5 h-3.5" /> Expirée
            </span>
          )}
        </div>
      </div>

      {/* Pricing Comparison */}
      <div className="grid grid-cols-2 gap-3 my-3">
        {negotiation.initialPriceDZD > 0 && (
          <div className="bg-white rounded-xl p-2.5 border border-[#e8e2d4]">
            <span className="text-[11px] text-slate-400 block font-medium">Prix initial</span>
            <span className="text-sm font-semibold text-slate-400 line-through">
              {formatPrice(negotiation.initialPriceDZD)}
            </span>
          </div>
        )}

        <div className={`bg-white rounded-xl p-2.5 border ${negotiation.initialPriceDZD > 0 ? 'border-[#e8e2d4]' : 'col-span-2 border-[#e8e2d4]'}`}>
          <span className="text-[11px] text-[#7a824e] block font-bold">Prix proposé</span>
          <span className="text-base font-black text-[#1e3835]">
            {formatPrice(negotiation.amountDZD)}
          </span>
        </div>
      </div>

      {/* Terms or Notes */}
      {negotiation.terms && (
        <div className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-[#e8e2d4] mb-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Note de l'émetteur :</span>
          {negotiation.terms}
        </div>
      )}

      {/* Actions Determinated by Server-Side State */}
      {isPending && !isExpired && (
        <div className="pt-2 border-t border-[#e8e2d4]">
          {/* Target User Actions */}
          {isTarget && (
            <div className="space-y-2">
              {!showCounterInput ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onAccept(negotiation.offerId)}
                    disabled={loadingAction !== null}
                    className="flex-1 py-2 px-3 bg-[#1e3835] hover:bg-[#152725] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-h-[38px]"
                  >
                    {loadingAction === `accept-${negotiation.offerId}` ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 text-[#ebdcb8]" />
                    )}
                    <span>Accepter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCounterInput(true)}
                    disabled={loadingAction !== null}
                    className="flex-1 py-2 px-3 bg-[#f4ecd8] hover:bg-[#ebdcb8] disabled:opacity-50 text-[#1e3835] border border-[#e8e2d4] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#7a824e]" />
                    <span>Contre-offre</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onReject(negotiation.offerId)}
                    disabled={loadingAction !== null}
                    className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer min-h-[38px]"
                  >
                    {loadingAction === `reject-${negotiation.offerId}` ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
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
                      className="flex-1 bg-white border border-[#e8e2d4] rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#1e3835]"
                    />
                    <button
                      type="submit"
                      disabled={loadingAction !== null || !counterAmount}
                      className="py-2 px-3 bg-[#1e3835] hover:bg-[#152725] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer min-h-[36px]"
                    >
                      {loadingAction === `counter-${negotiation.offerId}` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-[#ebdcb8]" />
                      )}
                      <span>Envoyer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCounterInput(false)}
                      className="py-2 px-2.5 bg-[#f4ecd8] text-[#1e3835] hover:bg-[#ebdcb8] rounded-xl text-xs font-bold cursor-pointer min-h-[36px]"
                    >
                      Annuler
                    </button>
                  </div>
                  {counterError && (
                    <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium">
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
              <span className="text-[11px] text-slate-500 font-medium">
                En attente de la décision de votre interlocuteur.
              </span>
              <button
                type="button"
                onClick={() => onCancel(negotiation.offerId)}
                disabled={loadingAction !== null}
                className="py-1.5 px-3 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 border border-[#e8e2d4] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer min-h-[32px]"
              >
                {loadingAction === `cancel-${negotiation.offerId}` ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Ban className="w-3 h-3 text-rose-500" />
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
