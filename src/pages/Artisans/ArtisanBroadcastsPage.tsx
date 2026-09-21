import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  Sparkles,
  RefreshCw,
  PlusCircle,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ArtisanNavbar } from '../../components/artisans/ArtisanNavbar';
import { ArtisanMobileBottomNav } from '../../components/artisans/ArtisanMobileBottomNav';
import { ArtisanBroadcastItemCard } from '../../components/artisans/broadcast/ArtisanBroadcastItemCard';
import { ArtisanJobBroadcastModal } from '../../components/artisans/broadcast/ArtisanJobBroadcastModal';
import {
  BOOKING_CATEGORIES,
  BookingCategoryCard,
} from '../../components/artisans/home/ArtisanCategoryBookingGrid';
import { ALGERIA_WILAYAS_58 } from '../../data/artisanGeo';
import {
  fetchArtisanJobBroadcasts,
  fetchMyArtisanProfile,
} from '../../services/artisan.api';
import { ArtisanJobBroadcast, ArtisanProfile } from '../../types/artisan';

export const ArtisanBroadcastsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTrade = searchParams.get('tradeId') || '';

  const [broadcasts, setBroadcasts] = useState<ArtisanJobBroadcast[]>([]);
  const [myProfile, setMyProfile] = useState<ArtisanProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTrade, setSelectedTrade] = useState<string>(initialTrade);
  const [selectedWilaya, setSelectedWilaya] = useState<string>('');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('');

  // Modal
  const [modalCategory, setModalCategory] = useState<BookingCategoryCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load artisan profile if user is logged in
  useEffect(() => {
    let isMounted = true;
    if (user) {
      fetchMyArtisanProfile().then((prof) => {
        if (isMounted && prof) {
          setMyProfile(prof);
          // If no trade was passed via URL, automatically default to artisan's registered trade!
          if (!initialTrade && prof.tradeId) {
            setSelectedTrade(prof.tradeId);
          }
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [user, initialTrade]);

  const loadBroadcasts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchArtisanJobBroadcasts({
        tradeId: selectedTrade || undefined,
        wilaya: selectedWilaya || undefined,
        urgency: selectedUrgency || undefined,
      });
      setBroadcasts(data);
    } catch (err) {
      console.error('Error fetching broadcasts', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTrade, selectedWilaya, selectedUrgency]);

  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts]);

  const handleOpenPublish = (category?: BookingCategoryCard) => {
    setModalCategory(category || BOOKING_CATEGORIES[0]);
    setIsModalOpen(true);
  };

  return (
    <div id="artisan-broadcasts-page" className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <ArtisanNavbar activeTab="broadcasts" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
        {/* Banner for Registered Artisans */}
        {myProfile && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-amber-500/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950">
                  <Briefcase className="w-4 h-4" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Espace Artisan Vérifié • {myProfile.fullName}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black">
                Opportunités de chantiers en {myProfile.tradeName}
              </h2>
              <p className="text-xs text-slate-300">
                Consultez ci-dessous les demandes publiées par les particuliers et professionnels dans votre catégorie d&apos;inscription.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTrade(myProfile.tradeId)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-sm transition-all"
            >
              Filtrer par mon métier ({myProfile.tradeName})
            </button>
          </div>
        )}

        {/* Header & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Annonces & Recherches d&apos;Artisans
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Chantiers et interventions publiés en direct par les clients dans les 58 Wilayas d&apos;Algérie.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenPublish()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Lancer une recherche d&apos;artisan</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="p-3.5 sm:p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            <span>Filtrer les annonces par catégorie et wilaya</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Trade Filter */}
            <select
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="">Tous les corps d&apos;état</option>
              {BOOKING_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Wilaya Filter */}
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="">Toutes les 58 Wilayas</option>
              {ALGERIA_WILAYAS_58.map((w) => (
                <option key={w.code} value={w.fullName}>
                  {w.fullName}
                </option>
              ))}
            </select>

            {/* Urgency Filter */}
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="">Toutes les urgences</option>
              <option value="urgent">🔴 Urgent (24h)</option>
              <option value="standard">🟡 Standard (48h)</option>
              <option value="flexible">🟢 Flexible</option>
            </select>
          </div>
        </div>

        {/* Broadcasts List */}
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">Chargement des annonces en direct...</p>
          </div>
        ) : broadcasts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {broadcasts.map((broadcast) => (
              <ArtisanBroadcastItemCard
                key={broadcast.id}
                broadcast={broadcast}
                isRegisteredTrade={myProfile?.tradeId === broadcast.tradeId}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 px-4 text-center rounded-3xl bg-white border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900">Aucune annonce trouvée</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Il n&apos;y a actuellement aucune recherche d&apos;artisan active correspondant à vos critères de recherche.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenPublish()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs hover:from-amber-600 hover:to-amber-700 cursor-pointer shadow-xs transition-all inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publier la première annonce</span>
            </button>
          </div>
        )}
      </main>

      {!isModalOpen && <ArtisanMobileBottomNav />}

      {/* Broadcast Modal */}
      <ArtisanJobBroadcastModal
        category={modalCategory}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          loadBroadcasts();
        }}
      />
    </div>
  );
};
