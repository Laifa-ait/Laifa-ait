import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ArtisanProfile } from '../../types/artisan';

interface QuoteRequestSuccessProps {
  artisan: ArtisanProfile;
  onClose: () => void;
}

export const QuoteRequestSuccess: React.FC<QuoteRequestSuccessProps> = ({ artisan, onClose }) => {
  return (
    <div className="text-center py-6 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-black text-slate-900">Demande envoyée avec succès !</h3>
      <p className="text-xs text-slate-600">
        L'artisan <strong>{artisan.fullName}</strong> a reçu votre demande de devis et vous contactera
        rapidement par téléphone ou WhatsApp.
      </p>
      <button
        onClick={onClose}
        className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
      >
        Fermer
      </button>
    </div>
  );
};
