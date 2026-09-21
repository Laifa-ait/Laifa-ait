import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { ArtisanJobBroadcast } from '../../../types/artisan';

interface BroadcastSuccessViewProps {
  broadcast: ArtisanJobBroadcast;
  onClose: () => void;
}

export const BroadcastSuccessView: React.FC<BroadcastSuccessViewProps> = ({
  broadcast,
  onClose,
}) => {
  return (
    <div className="p-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-black text-slate-900">Annonce publiée avec succès !</h4>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Votre recherche d&apos;artisan pour <strong className="text-slate-800">{broadcast.title}</strong> est désormais visible par tous les artisans en {broadcast.tradeName} de la wilaya de {broadcast.wilaya}.
        </p>
      </div>
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left space-y-1">
        <p className="font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Que va-t-il se passer maintenant ?
        </p>
        <p className="text-[11px] text-amber-800">
          Les professionnels qualifiés vont examiner votre besoin et vous contacteront directement par téléphone au <strong>{broadcast.clientPhone}</strong>.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs hover:from-amber-600 hover:to-amber-700 cursor-pointer shadow-xs"
      >
        Terminer & Retourner à l&apos;accueil
      </button>
    </div>
  );
};
