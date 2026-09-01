import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Tag, Camera, Settings, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchMyArtisanProfile,
  fetchArtisanMyQuotes,
  updateArtisanMyProfile,
} from '../../services/artisan.api';
import { ArtisanProfile, ArtisanQuoteRequest } from '../../types/artisan';
import { ArtisanNavbar } from '../../components/artisans/ArtisanNavbar';
import { ArtisanDashboardHeader } from '../../components/artisans/dashboard/ArtisanDashboardHeader';
import { ArtisanQuotesTab } from '../../components/artisans/dashboard/ArtisanQuotesTab';
import { ArtisanServicesTab } from '../../components/artisans/dashboard/ArtisanServicesTab';
import { ArtisanPortfolioTab } from '../../components/artisans/dashboard/ArtisanPortfolioTab';
import { ArtisanSettingsTab } from '../../components/artisans/dashboard/ArtisanSettingsTab';

export const ArtisanDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<ArtisanProfile | null>(null);
  const [quotes, setQuotes] = useState<ArtisanQuoteRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'quotes' | 'services' | 'portfolio' | 'settings'>('quotes');
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const myProf = await fetchMyArtisanProfile();
      if (!myProf) {
        navigate('/artisans/devenir-artisan', { replace: true });
        return;
      }
      setProfile(myProf);

      const quotesData = await fetchArtisanMyQuotes();
      setQuotes(quotesData);
    } catch (err) {
      console.error('Error loading artisan dashboard', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth?redirect=/artisans/dashboard');
      return;
    }
    loadData();
  }, [currentUser, loadData, navigate]);

  const handleToggleAvailability = async () => {
    if (!profile) return;
    setUpdatingAvailability(true);
    try {
      const nextVal = !profile.isAvailable;
      await updateArtisanMyProfile({ isAvailable: nextVal });
      setProfile({ ...profile, isAvailable: nextVal });
    } finally {
      setUpdatingAvailability(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div id="artisan-dashboard-page" className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <ArtisanNavbar activeTab="dashboard" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <ArtisanDashboardHeader
          profile={profile}
          onToggleAvailability={handleToggleAvailability}
          updatingAvailability={updatingAvailability}
        />

        {/* Dashboard Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'quotes'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Demandes de Devis ({quotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'services'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Prestations & Tarifs ({(profile.services || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'portfolio'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Portfolio ({(profile.portfolio || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Paramètres Profil</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'quotes' && (
          <ArtisanQuotesTab quotes={quotes} onRefreshQuotes={loadData} />
        )}
        {activeTab === 'services' && (
          <ArtisanServicesTab profile={profile} onProfileUpdated={loadData} />
        )}
        {activeTab === 'portfolio' && (
          <ArtisanPortfolioTab profile={profile} onProfileUpdated={loadData} />
        )}
        {activeTab === 'settings' && (
          <ArtisanSettingsTab profile={profile} onProfileUpdated={loadData} />
        )}
      </main>
    </div>
  );
};
