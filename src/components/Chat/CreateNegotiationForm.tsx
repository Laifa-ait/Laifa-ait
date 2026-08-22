import React from 'react';
import { DollarSign } from 'lucide-react';

interface CreateNegotiationFormProps {
  offerAmount: string;
  setOfferAmount: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const CreateNegotiationForm: React.FC<CreateNegotiationFormProps> = ({
  offerAmount,
  setOfferAmount,
  onSubmit,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="p-3 bg-slate-800/90 border-t border-slate-700 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-amber-400">Proposer un nouveau prix</span>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-white text-xs cursor-pointer">
          Annuler
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          value={offerAmount}
          onChange={(e) => setOfferAmount(e.target.value)}
          placeholder="Montant en DZD"
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
          required
        />
        <button
          type="submit"
          className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Proposer</span>
        </button>
      </div>
    </form>
  );
};
