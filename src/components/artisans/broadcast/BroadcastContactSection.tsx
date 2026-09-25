import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Phone, DollarSign } from 'lucide-react';

interface BroadcastContactSectionProps {
  clientName: string;
  setClientName: (v: string) => void;
  clientPhone: string;
  setClientPhone: (v: string) => void;
  budget: string;
  setBudget: (v: string) => void;
}

export const BroadcastContactSection: React.FC<BroadcastContactSectionProps> = ({
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  budget,
  setBudget,
}) => {
  const { t } = useTranslation();
  return (
    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-amber-600" />
          <span>{t('artisan_broadcast_contact_title', 'Vos coordonnées pour être contacté(e)')}</span>
        </h5>
        <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
          {t('artisan_broadcast_direct_free', 'Direct & Sans commission')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            <span>{t('artisan_broadcast_name_label', 'Votre nom / prénom *')}</span>
          </label>
          <input
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder={t('artisan_broadcast_name_placeholder', 'Ex: Karim Benali')}
            className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{t('artisan_broadcast_phone_label', 'Numéro de téléphone *')}</span>
          </label>
          <input
            type="tel"
            required
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder={t('artisan_broadcast_phone_placeholder', 'Ex: 0550 12 34 56')}
            className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div className="space-y-1 pt-1 border-t border-amber-200/60">
        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-amber-600" />
          <span>{t('artisan_broadcast_budget_label', 'Budget indicatif estimé (Optionnel en DZD)')}</span>
        </label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder={t('artisan_broadcast_budget_placeholder', 'Ex: 5000')}
          className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
        />
      </div>
    </div>
  );
};
