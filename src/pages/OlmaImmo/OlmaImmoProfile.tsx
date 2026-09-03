import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut,
  Calendar,
  Settings,
  Heart,
  Building2,
  User,
  ArrowLeft,
} from 'lucide-react';
import { OlmaImmoNavbar } from '../../components/OlmaImmo/OlmaImmoNavbar';
import { ProApplicationSection } from '../../components/OlmaImmo/ProApplicationSection';
import { ProfileFavoritesSection } from '../../components/OlmaImmo/ProfileFavoritesSection';
import { ProfileSettingsSection } from '../../components/OlmaImmo/ProfileSettingsSection';
import { ProfileStaysSection } from '../../components/OlmaImmo/ProfileStaysSection';

export const OlmaImmoProfile: React.FC = () => {
  const { currentUser, userProfile, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'favorites' | 'stays' | 'pro' | 'settings'>('favorites');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/immo');
    } catch {
      // Ignored
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] font-sans pb-12 text-[#1c211e]">
        <OlmaImmoNavbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-10 h-10 border-4 border-[#1a3831] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-slate-600">Chargement de votre profil...</p>
        </main>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#faf8f5] font-sans pb-12 text-[#1c211e]">
        <OlmaImmoNavbar />
        <main className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="bg-white rounded-3xl p-8 border border-[#e8e2d4] shadow-xs space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#f4ecd8] text-[#1a3831] flex items-center justify-center mx-auto border border-[#ebdcb8]">
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">
                Espace Membre Olma Immo
              </h1>
              <p className="text-xs text-slate-600">
                Connectez-vous pour accéder à vos favoris, gérer vos réservations de séjours et vos annonces.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('auth:openModal', { detail: { mode: 'login' } }))}
                className="w-full sm:w-auto py-3.5 px-6 bg-[#1a3831] hover:bg-[#122b24] text-[#ebdcb8] rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md"
              >
                Se connecter / S'inscrire
              </button>
              <button
                type="button"
                onClick={() => navigate('/immo')}
                className="w-full sm:w-auto py-3.5 px-6 bg-[#f4ecd8] hover:bg-[#ebdcb8] text-[#1a3831] rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer border border-[#e8e2d4]"
              >
                Retour aux annonces
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans pb-16 text-[#1c211e]">
      <OlmaImmoNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        {/* Navigation fil d'ariane & retour */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/immo')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#1a3831] hover:text-[#122b24] px-3.5 py-2 rounded-xl bg-white border border-[#e8e2d4] hover:bg-[#f4ecd8]/40 transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-800" />
            <span>Retour à Olma Immo</span>
          </button>
        </div>

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e8e2d4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#f4ecd8] text-[#1a3831] border border-[#ebdcb8] rounded-2xl flex items-center justify-center font-bold text-2xl uppercase shrink-0">
              {userProfile?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">
                  {userProfile?.displayName || 'Mon Compte'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#f4ecd8] text-[#1a3831] border border-[#ebdcb8]">
                  Membre Vérifié
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{currentUser?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/immo/owner"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1a3831] text-[#ebdcb8] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#122b24] shadow-xs transition"
            >
              <Building2 className="w-4 h-4" />
              <span>Espace Annonceur</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 border border-[#e8e2d4] text-slate-700 rounded-xl hover:bg-[#faf8f5] transition font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Navigation Sidebar */}
          <div className="col-span-1 space-y-2">
            {[
              { id: 'favorites' as const, label: 'Mes Biens Favoris', icon: Heart },
              { id: 'stays' as const, label: 'Mes Séjours & Visites', icon: Calendar },
              { id: 'pro' as const, label: 'Compte Pro & Agence', icon: Building2 },
              { id: 'settings' as const, label: 'Paramètres du compte', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-xs transition cursor-pointer border ${
                    isSelected
                      ? 'bg-[#1a3831] text-[#ebdcb8] border-[#1a3831] shadow-xs'
                      : 'bg-white hover:bg-[#f4ecd8]/40 text-slate-700 border-[#e8e2d4]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#ebdcb8]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              className="md:hidden w-full flex items-center gap-3 p-4 rounded-2xl bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 transition mt-6 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter</span>
            </button>
          </div>

          {/* Right Main Content Panel */}
          <div className="col-span-1 md:col-span-2">
            {activeTab === 'favorites' && <ProfileFavoritesSection />}
            {activeTab === 'stays' && <ProfileStaysSection />}
            {activeTab === 'pro' && <ProApplicationSection />}
            {activeTab === 'settings' && <ProfileSettingsSection />}
          </div>
        </div>
      </main>
    </div>
  );
};
