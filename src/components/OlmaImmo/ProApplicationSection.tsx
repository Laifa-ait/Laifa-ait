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
import { apiGet } from '../../lib/api';
import { ProApplicationData, ProApplicationResponse } from '../../types/realEstate';
import { ProApplicationForm } from './ProApplicationForm';

export const ProApplicationSection: React.FC = () => {
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
      <div className="bg-white rounded-3xl p-10 border border-[#e8e2d4] text-center">
        <Loader2 className="w-8 h-8 text-[#1e3835] animate-spin mx-auto mb-2" />
        <p className="text-xs font-bold text-slate-600">Vérification de votre statut professionnel...</p>
      </div>
    );
  }

  // State 1: Verified Pro/Agency Account
  if (application && application.status === 'verified') {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e8e2d4] shadow-xs space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7a824e]">Statut Officiel</span>
              <h3 className="text-xl font-bold text-[#1e3835]">
                {application.accountType === 'agency' ? 'Agence Immobilière Agréée' : 'Professionnel Certifié'}
              </h3>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Compte Validé
          </span>
        </div>

        <div className="bg-[#f9f7f2] border border-[#e8e2d4] rounded-2xl p-4 text-xs space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Raison Sociale</span>
              <p className="font-bold text-[#1e3835]">{application.companyName}</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">N° Registre du Commerce</span>
              <p className="font-mono font-bold text-[#1e3835]">{application.tradeRegisterNumber}</p>
            </div>
            {application.agencyLicenseNumber && (
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">N° Agrément</span>
                <p className="font-mono font-bold text-[#1e3835]">{application.agencyLicenseNumber}</p>
              </div>
            )}
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Wilaya & Contact</span>
              <p className="font-bold text-[#1e3835]">{application.wilaya} · {application.contactPhone}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to="/immo/owner"
            className="flex-1 py-3 px-5 bg-[#1e3835] hover:bg-[#152725] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition"
          >
            <span>Tableau de Bord Pro</span>
            <ArrowRight className="w-4 h-4 text-[#ebdcb8]" />
          </Link>
          <Link
            to="/immo/publish"
            className="py-3 px-5 bg-[#f4ecd8] hover:bg-[#ebdcb8] text-[#1e3835] border border-[#e8e2d4] rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            Publier une annonce
          </Link>
        </div>
      </div>
    );
  }

  // State 2: Application Pending Review
  if (application && application.status === 'pending') {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e8e2d4] shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Demande en cours</span>
            <h3 className="text-xl font-bold text-[#1e3835]">Dossier en attente de validation</h3>
          </div>
        </div>

        <div className="p-4 bg-[#fefbf3] border border-[#e8dcc4] rounded-2xl text-xs space-y-2 text-slate-700">
          <p className="font-medium">
            Votre demande pour le compte <strong>{application.companyName}</strong> ({application.accountType === 'agency' ? 'Agence' : 'Pro'}) est actuellement examinée par notre équipe conformité.
          </p>
          <div className="pt-2 border-t border-[#e8e2d4] grid grid-cols-2 gap-2 text-[11px] text-slate-500">
            <div>RC : <span className="font-mono font-bold text-slate-700">{application.tradeRegisterNumber}</span></div>
            <div>Wilaya : <span className="font-bold text-slate-700">{application.wilaya}</span></div>
            <div>Soumis le : <span className="font-bold text-slate-700">{new Date(application.submittedAt).toLocaleDateString('fr-DZ')}</span></div>
          </div>
        </div>

        <p className="text-xs text-slate-500 italic">
          Délai moyen de validation : 24h à 48h ouvrées. Vous recevrez une notification dès validation.
        </p>
      </div>
    );
  }

  // State 3: Application Rejected
  if (application && application.status === 'rejected') {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e8e2d4] shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center border border-rose-300">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-700">Non validé</span>
            <h3 className="text-xl font-bold text-[#1e3835]">Dossier à corriger</h3>
          </div>
        </div>

        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1">
          <p className="font-bold">Motif du refus :</p>
          <p>{application.rejectionReason || 'Documents incomplets ou informations non vérifiables.'}</p>
        </div>

        <button
          type="button"
          onClick={() => setApplication(null)}
          className="py-3 px-5 bg-[#1e3835] hover:bg-[#152725] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
        >
          Soumettre un nouveau dossier
        </button>
      </div>
    );
  }

  // State 4: Fresh Application Form
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e8e2d4] shadow-xs space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#f0ebd8]">
        <div className="w-12 h-12 rounded-2xl bg-[#f4ecd8] text-[#1e3835] flex items-center justify-center border border-[#e8e2d4]">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7a824e]">Certification Olma Immo</span>
          <h3 className="text-xl font-bold text-[#1e3835] font-['Playfair_Display',serif]">
            Passer à un compte Pro ou Agence
          </h3>
        </div>
      </div>

      <ProApplicationForm onSuccess={(data) => setApplication(data)} />
    </div>
  );
};
