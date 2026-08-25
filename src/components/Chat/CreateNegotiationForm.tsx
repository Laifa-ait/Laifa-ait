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
    <form onSubmit={onSubmit} className="p-3 bg-[#faf8f5] border-t border-[#e8e2d4] space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-[#1e3835]">Proposer un nouveau prix</span>
        <button type="button" onClick={onCancel} className="text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer">
          Annuler
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          value={offerAmount}
          onChange={(e) => setOfferAmount(e.target.value)}
          placeholder="Montant en DZD"
          className="flex-1 bg-white border border-[#e8e2d4] rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#1e3835]"
          required
        />
        <button
          type="submit"
          className="px-4 py-1.5 bg-[#1e3835] hover:bg-[#152725] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
        >
          <DollarSign className="w-3.5 h-3.5 text-[#ebdcb8]" />
          <span>Proposer</span>
        </button>
      </div>
    </form>
  );
};
