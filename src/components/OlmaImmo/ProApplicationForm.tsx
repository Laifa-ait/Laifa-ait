import React, { useState } from 'react';
import { Building2, Briefcase, Send, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiPost } from '../../lib/api';
import { ProApplicationData, ProApplicationResponse } from '../../types/realEstate';
import toast from 'react-hot-toast';

interface ProApplicationFormProps {
  onSuccess: (data: ProApplicationData) => void;
}

export const ProApplicationForm: React.FC<ProApplicationFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const [accountType, setAccountType] = useState<'pro' | 'agency'>('agency');
  const [companyName, setCompanyName] = useState('');
  const [tradeRegisterNumber, setTradeRegisterNumber] = useState('');
  const [agencyLicenseNumber, setAgencyLicenseNumber] = useState('');
  const [taxIdentificationNumber, setTaxIdentificationNumber] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [wilaya, setWilaya] = useState('Alger');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !tradeRegisterNumber.trim() || !contactPhone.trim()) {
      toast.error(t('Veuillez renseigner tous les champs obligatoires.'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        accountType,
        companyName: companyName.trim(),
        tradeRegisterNumber: tradeRegisterNumber.trim(),
        agencyLicenseNumber: agencyLicenseNumber.trim() || undefined,
        taxIdentificationNumber: taxIdentificationNumber.trim() || undefined,
        contactPhone: contactPhone.trim(),
        wilaya,
        address: address.trim(),
        description: description.trim(),
      };

      const res = await apiPost<ProApplicationResponse>('/api/v1/real-estate/pro-application', payload);
      if (res.success && res.data) {
        toast.success(t('Votre demande a été soumise avec succès !'));
        onSuccess(res.data);
      } else {
        toast.error(res.error || t('Erreur lors de la soumission.'));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('Erreur lors de la soumission.');
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Account Type Selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setAccountType('agency')}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            accountType === 'agency'
              ? 'bg-blue-50/70 border-[#1E3A8A] text-[#1E3A8A]'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-5 h-5 mb-1.5 text-[#1E3A8A]" />
          <p className="text-xs font-bold">{t("Agence Immobilière")}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{t("Pour les agences avec agrément et registre")}</p>
        </button>

        <button
          type="button"
          onClick={() => setAccountType('pro')}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            accountType === 'pro'
              ? 'bg-blue-50/70 border-[#1E3A8A] text-[#1E3A8A]'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Briefcase className="w-5 h-5 mb-1.5 text-[#1E3A8A]" />
          <p className="text-xs font-bold">{t("Agent / Courtier Pro")}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{t("Pour les professionnels indépendants")}</p>
        </button>
      </div>

      {/* Company & Register Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t("Nom de l'agence ou Raison Sociale *")}
          </label>
          <input
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder={t("Ex: Agence Immobilière El Bahdja")}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t("N° Registre du Commerce *")}
          </label>
          <input
            type="text"
            required
            value={tradeRegisterNumber}
            onChange={(e) => setTradeRegisterNumber(e.target.value)}
            placeholder="Ex: 16/00-1234567B19"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
          />
        </div>
      </div>

      {/* Optional Agency License & NIF */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {accountType === 'agency' ? t("N° Agrément Immobilier (Optionnel)") : t("N° Agrément Immobilier (Optionnel)")}
          </label>
          <input
            type="text"
            value={agencyLicenseNumber}
            onChange={(e) => setAgencyLicenseNumber(e.target.value)}
            placeholder="Ex: AGR-2023-987"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t("NIF / Numéro Fiscal (Optionnel)")}
          </label>
          <input
            type="text"
            value={taxIdentificationNumber}
            onChange={(e) => setTaxIdentificationNumber(e.target.value)}
            placeholder="Ex: 001916012345678"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
          />
        </div>
      </div>

      {/* Wilaya & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t("Wilaya principale *")}</label>
          <select
            value={wilaya}
            onChange={(e) => setWilaya(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
          >
            <option value="Alger">16 - Alger</option>
            <option value="Oran">31 - Oran</option>
            <option value="Constantine">25 - Constantine</option>
            <option value="Blida">09 - Blida</option>
            <option value="Tipaza">42 - Tipaza</option>
            <option value="Boumerdès">35 - Boumerdès</option>
            <option value="Béjaïa">06 - Béjaïa</option>
            <option value="Tizi Ouzou">15 - Tizi Ouzou</option>
            <option value="Sétif">19 - Sétif</option>
            <option value="Annaba">23 - Annaba</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">{t("Téléphone Professionnel *")}</label>
          <input
            type="tel"
            required
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder={t("Ex: 0550 12 34 56")}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">{t("Adresse du bureau / Siège")}</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t("Ex: 12 Rue Didouche Mourad, Alger")}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">{t("Présentation de l'activité (Optionnel)")}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("Décrivez brièvement vos zones d'intervention, spécialités...")}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#1E3A8A] h-20 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-5 bg-[#1E3A8A] hover:bg-blue-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#F59E0B]" />
        ) : (
          <Send className="w-4 h-4 text-[#F59E0B]" />
        )}
        <span>{isSubmitting ? t("Soumission en cours...") : t("Soumettre ma candidature Pro")}</span>
      </button>
    </form>
  );
};
