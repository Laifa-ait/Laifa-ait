import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiGet } from '../../lib/api';
import { ProApplicationData, ProApplicationResponse } from '../../types/realEstate';
import { ProApplicationForm } from './ProApplicationForm';

export const ProApplicationSection: React.FC = () => {
  const { t } = useTranslation();
  const [application, setApplication] = useState<ProApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  const fetchApplicationStatus = async () => {
    setIsLoading(true);
    try {
      const res = await apiGet<ProApplicationResponse>('/api/v1/real-estate/pro-application');
      if (res.success && res.data) {
        setApplication(res.data);
      }
    } catch (err) {
      console.error('Failed to load pro application status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center">
        <Loader2 className="w-8 h-8 text-[#1E3A8A] animate-spin mx-auto mb-2" />
        <p className="text-xs font-bold text-slate-600">{t("Vérification de votre statut professionnel...")}</p>
      </div>
    );
  }

  // State 1: Verified Pro/Agency Account
  if (application && application.status === 'verified') {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-800">{t("Statut Officiel")}</span>
              <h3 className="text-xl font-bold text-[#1E3A8A]">
                {application.accountType === 'agency' ? t('Agence Immobilière Agréée') : t('Professionnel Certifié')}
              </h3>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" /> {t("Compte Validé")}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">{t("Raison Sociale")}</span>
              <p className="font-bold text-[#1E3A8A]">{application.companyName}</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">{t("N° Registre du Commerce")}</span>
              <p className="font-mono font-bold text-[#1E3A8A]">{application.tradeRegisterNumber}</p>
            </div>
            {application.agencyLicenseNumber && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">{t("N° Agrément")}</span>
                <p className="font-mono font-bold text-[#1E3A8A]">{application.agencyLicenseNumber}</p>
              </div>
            )}
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">{t("Wilaya & Contact", "Wilaya & Contact")}</span>
              <p className="font-bold text-[#1E3A8A]">{application.wilaya} · {application.contactPhone}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to="/immo/owner"
            className="flex-1 py-3 px-5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition"
          >
            <span>{t("Tableau de Bord Pro", "Tableau de Bord Pro")}</span>
            <ArrowRight className="w-4 h-4 text-[#F59E0B]" />
          </Link>
          <Link
            to="/immo/publish"
            className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-[#1E3A8A] border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            {t("Publier une annonce", "Publier une annonce")}
          </Link>
        </div>
      </div>
    );
  }

  // State 2: Application Pending Review
  if (application && application.status === 'pending') {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">{t("Demande en cours", "Demande en cours")}</span>
            <h3 className="text-xl font-bold text-[#1E3A8A]">{t("Dossier en Cours d'Examen")}</h3>
          </div>
        </div>

        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl text-xs space-y-2 text-slate-700">
          <p className="font-medium">
            {t("Votre dossier est en cours de validation par l'équipe Olmart Immo. Vous recevrez une réponse sous 24 à 48h.")}
          </p>
          <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
            <div>RC : <span className="font-mono font-bold text-slate-700">{application.tradeRegisterNumber}</span></div>
            <div>Wilaya : <span className="font-bold text-slate-700">{application.wilaya}</span></div>
            <div>{t("Soumis le", "Soumis le")} : <span className="font-bold text-slate-700">{new Date(application.submittedAt).toLocaleDateString('fr-DZ')}</span></div>
          </div>
        </div>

        <p className="text-xs text-slate-500 italic">
          {t("Délai moyen de validation : 24h à 48h ouvrées. Vous recevrez une notification dès validation.", "Délai moyen de validation : 24h à 48h ouvrées. Vous recevrez une notification dès validation.")}
        </p>
      </div>
    );
  }

  // State 3: Application Rejected
  if (application && application.status === 'rejected') {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center border border-rose-300">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-700">{t("Non validé", "Non validé")}</span>
            <h3 className="text-xl font-bold text-[#1E3A8A]">{t("Candidature Non Retenue")}</h3>
          </div>
        </div>

        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1">
          <p className="font-bold">{t("Motif du refus :", "Motif du refus :")}</p>
          <p>{application.rejectionReason || t("Documents incomplets ou informations non vérifiables.", "Documents incomplets ou informations non vérifiables.")}</p>
        </div>

        <button
          type="button"
          onClick={() => setApplication(null)}
          className="py-3 px-5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
        >
          {t("Soumettre un nouveau dossier", "Soumettre un nouveau dossier")}
        </button>
      </div>
    );
  }

  // State 4: Fresh Application Form
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#1E3A8A] flex items-center justify-center border border-slate-200">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-800">{t("Certification Olma Immo", "Certification Olma Immo")}</span>
          <h3 className="text-xl font-bold text-[#1E3A8A] font-['Playfair_Display',serif]">
            {t("Passer à un compte Pro ou Agence", "Passer à un compte Pro ou Agence")}
          </h3>
        </div>
      </div>

      <ProApplicationForm onSuccess={(data) => setApplication(data)} />
    </div>
  );
};
