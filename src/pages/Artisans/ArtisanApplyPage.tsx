import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wrench, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchArtisanTrades, fetchMyArtisanProfile } from '../../services/artisan.api';
import { ArtisanProfile, ArtisanTrade } from '../../types/artisan';
import { ArtisanNavbar } from '../../components/artisans/ArtisanNavbar';
import { ArtisanApplyForm } from '../../components/artisans/ArtisanApplyForm';
import { ArtisanApplySuccess } from '../../components/artisans/ArtisanApplySuccess';

export const ArtisanApplyPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedTradeId = searchParams.get('tradeId') || '';

  const { currentUser } = useAuth();
  const [trades, setTrades] = useState<ArtisanTrade[]>([]);
  const [submittedProfile, setSubmittedProfile] = useState<ArtisanProfile | null>(null);

  useEffect(() => {
    fetchArtisanTrades().then((data) => setTrades(data));

    if (currentUser) {
      fetchMyArtisanProfile().then((existing) => {
        if (existing) {
          navigate('/artisans/dashboard', { replace: true });
        }
      });
    }
  }, [currentUser, navigate]);

  return (
    <div id="artisan-apply-page" className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <ArtisanNavbar activeTab="apply" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {submittedProfile ? (
          <ArtisanApplySuccess artisan={submittedProfile} />
        ) : (
          <div className="space-y-8">
            {/* Header Hero */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-black uppercase tracking-wider">
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                <span>Rejoignez les professionnels Olmart</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Devenez Artisan Partenaire Olmart
              </h1>
              <p className="text-sm text-slate-600 max-w-xl mx-auto">
                Augmentez votre clientèle, recevez des demandes de devis qualifiées et développez
                votre activité dans votre wilaya.
              </p>
            </div>

            {/* Auth check warning */}
            {!currentUser && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-amber-950 font-medium">
                  <strong>Vous n'êtes pas connecté :</strong> Connectez-vous ou créez un compte
                  Olmart pour lier votre profil artisan.
                </div>
                <button
                  onClick={() => navigate('/auth?redirect=/artisans/devenir-artisan')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <span>Connexion / Inscription</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Application Form Box */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <ArtisanApplyForm
                trades={trades}
                initialTradeId={preSelectedTradeId}
                onSuccess={(profile) => setSubmittedProfile(profile)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
