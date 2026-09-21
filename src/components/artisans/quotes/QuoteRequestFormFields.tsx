import React from 'react';
import { Calendar } from 'lucide-react';
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
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Votre Nom *</label>
          <input
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Téléphone *</label>
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
          <label className="text-xs font-bold text-slate-700">Email (Optionnel)</label>
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Budget max (DZD)</label>
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
        <label className="text-xs font-bold text-slate-700">Titre des travaux *</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700">Description du besoin *</label>
        <textarea
          rows={3}
          required
          placeholder="Décrivez les réparations, surface, pannes..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700">Lieu d'intervention</label>
        <WilayaCommuneSelector
          selectedWilaya={wilaya}
          selectedCommune={commune}
          onWilayaChange={(w: string) => setWilaya(w)}
          onCommuneChange={(c: string) => setCommune(c)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700">Adresse / Repère (Optionnel)</label>
        <input
          type="text"
          placeholder="Cité, numéro de rue..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Niveau d'urgence</label>
          <select
            value={urgency}
            onChange={(e) =>
              setUrgency(e.target.value as 'urgent' | 'standard' | 'flexible')
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
          >
            <option value="standard">Standard (Sous 48h)</option>
            <option value="urgent">Urgent (Aujourd'hui)</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Date souhaitée</label>
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
