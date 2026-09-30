import React from 'react';
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WilayaCommuneSelector } from '../WilayaCommuneSelector';

interface QuoteRequestFormFieldsProps {
  clientName: string;
  setClientName: (v: string) => void;
  clientPhone: string;
  setClientPhone: (v: string) => void;
  clientEmail: string;
  setClientEmail: (v: string) => void;
  estimatedBudget: number | undefined;
  setEstimatedBudget: (v: number | undefined) => void;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  wilaya: string;
  setWilaya: (v: string) => void;
  commune: string;
  setCommune: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  urgency: 'urgent' | 'standard' | 'flexible';
  setUrgency: (v: 'urgent' | 'standard' | 'flexible') => void;
  preferredDate: string;
  setPreferredDate: (v: string) => void;
}

export const QuoteRequestFormFields: React.FC<QuoteRequestFormFieldsProps> = ({
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  clientEmail,
  setClientEmail,
  estimatedBudget,
  setEstimatedBudget,
  title,
  setTitle,
  description,
  setDescription,
  wilaya,
  setWilaya,
  commune,
  setCommune,
  address,
  setAddress,
  urgency,
  setUrgency,
  preferredDate,
  setPreferredDate,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">{t("Votre Nom *")}</label>
          <input
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">{t("Téléphone *")}</label>
          <input
            type="tel"
            required
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">{t("Email (Optionnel)")}</label>
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">{t("Budget max (DZD)")}</label>
          <input
            type="number"
            placeholder="Ex: 5000"
            value={estimatedBudget || ''}
            onChange={(e) =>
              setEstimatedBudget(e.target.value ? parseInt(e.target.value, 10) : undefined)
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700">{t("Titre des travaux *")}</label>
        <input
          type="text"
          required
          placeholder={t("Ex: Rénovation peinture salon")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700">{t("Description détaillée *")}</label>
        <textarea
          rows={3}
          required
          placeholder={t("Décrivez les réparations, surface, pannes...", "Décrivez les réparations, surface, pannes...")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700">{t("Lieu d'intervention", "Lieu d'intervention")}</label>
        <WilayaCommuneSelector
          selectedWilaya={wilaya}
          selectedCommune={commune}
          onWilayaChange={(w: string) => setWilaya(w)}
          onCommuneChange={(c: string) => setCommune(c)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700">{t("Adresse / Repère (Optionnel)", "Adresse / Repère (Optionnel)")}</label>
        <input
          type="text"
          placeholder={t("Cité, numéro de rue...", "Cité, numéro de rue...")}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">{t("Niveau d'urgence")}</label>
          <select
            value={urgency}
            onChange={(e) =>
              setUrgency(e.target.value as 'urgent' | 'standard' | 'flexible')
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
          >
            <option value="standard">{t("Standard (1-2 sem)")}</option>
            <option value="urgent">{t("Urgent (24-48h)")}</option>
            <option value="flexible">{t("Flexible")}</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">{t("Date souhaitée")}</label>
          <div className="relative">
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
            />
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>
    </>
  );
};
