import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { RefreshCw, Users, Sparkles, Send } from 'lucide-react';
import { fetchArtisanTrades, searchPublicArtisans } from '../../services/artisan.api';
import { saveSearchHistory } from '../../services/artisanHistory';
import { ArtisanProfile, ArtisanTrade } from '../../types/artisan';
import { OlmaArtisanShell } from '../../components/artisans/shell/OlmaArtisanShell';
import { OlmaArtisanHero } from '../../components/artisans/hero/OlmaArtisanHero';
import { OlmaArtisanCategoryBar } from '../../components/artisans/home/OlmaArtisanCategoryBar';
import {
  ArtisanCategoryBookingGrid,
  BookingCategoryCard,
} from '../../components/artisans/home/ArtisanCategoryBookingGrid';
import { ArtisanJobBroadcastModal } from '../../components/artisans/broadcast/ArtisanJobBroadcastModal';
import { ArtisanActiveFilterPills } from '../../components/artisans/filters/ArtisanActiveFilterPills';
import { ArtisanFilterOptions } from '../../components/artisans/filters/OlmaArtisanFilterModal';
import { ArtisanCard } from '../../components/artisans/ArtisanCard';
import { QuoteRequestModal } from '../../components/artisans/QuoteRequestModal';

export const ArtisansHome: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [trades, setTrades] = useState<ArtisanTrade[]>([]);
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
  const [totalArtisans, setTotalArtisans] = useState(0);
  const [loading, setLoading] = useState(true);

  // Consolidated Filter State
  const [filters, setFilters] = useState<ArtisanFilterOptions>({
    q: searchParams.get('q') || undefined,
    tradeId: searchParams.get('tradeId') || searchParams.get('trade') || undefined,
    wilaya: searchParams.get('wilaya') || undefined,
    commune: searchParams.get('commune') || undefined,
    availableOnly: searchParams.get('available') === 'true',
    minRating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
    sort: (searchParams.get('sort') as 'rating' | 'experience' | 'recent') || 'recent',
  });

  const [selectedArtisanForQuote, setSelectedArtisanForQuote] =
    useState<ArtisanProfile | null>(null);
  const [selectedBroadcastCategory, setSelectedBroadcastCategory] =
    useState<BookingCategoryCard | null>(null);

  const loadTrades = useCallback(async () => {
    try {
      const data = await fetchArtisanTrades();
      setTrades(data);
    } catch (err) {
      console.error('Failed to load trades', err);
    }
  }, []);

  const loadArtisans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchPublicArtisans({
        search: filters.q,
        tradeId: filters.tradeId,
        wilaya: filters.wilaya,
        commune: filters.commune,
      });

      let results = [...res.artisans];

      // Client-side auxiliary filtering
      if (filters.availableOnly) {
        results = results.filter((a) => a.isAvailable);
      }
      if (filters.minRating) {
        results = results.filter((a) => (a.rating || 5) >= filters.minRating!);
      }

      // Sort
      if (filters.sort === 'rating') {
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (filters.sort === 'experience') {
        results.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
      }

      setArtisans(results);
      setTotalArtisans(results.length);

      // Save search history
      if (filters.q || filters.tradeId || filters.wilaya) {
        const tradeObj = trades.find((t) => t.id === filters.tradeId);
        saveSearchHistory({
          term: filters.q,
          tradeId: filters.tradeId,
          tradeName: tradeObj?.name,
          wilaya: filters.wilaya,
          commune: filters.commune,
        });
      }
    } catch (err) {
      console.error('Failed to load artisans', err);
    } finally {
      setLoading(false);
    }
  }, [filters, trades]);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  useEffect(() => {
    loadArtisans();
  }, [loadArtisans]);

  const handleCategorySelect = (catId: string) => {
    const normalizedId = catId === 'all' || catId === 'reserve' ? undefined : catId;
    const nextFilters = { ...filters, tradeId: normalizedId };
    setFilters(nextFilters);

    if (normalizedId) {
      searchParams.set('tradeId', normalizedId);
    } else {
      searchParams.delete('tradeId');
    }
    setSearchParams(searchParams);
  };

  const handleRemoveFilter = (key: keyof ArtisanFilterOptions) => {
    const nextFilters = { ...filters, [key]: undefined };
    setFilters(nextFilters);
    searchParams.delete(key as string);
    setSearchParams(searchParams);
  };

  const handleResetAllFilters = () => {
    setFilters({});
    setSearchParams({});
  };

  const isAnyModalOpen = Boolean(selectedBroadcastCategory || selectedArtisanForQuote);

  return (
    <OlmaArtisanShell fullWidth activeTab="explorer" showBottomNav={!isAnyModalOpen}>
      {/* Top Search Hero matching Olma Immo rounded pill search */}
      <OlmaArtisanHero
        trades={trades}
        filters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onSearchSubmit={loadArtisans}
      />

      <div className="max-w-[1920px] 2xl:max-w-[2100px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 w-full pt-2 pb-14 space-y-3">
        {/* Horizontal Category Pill Bar with tactile motion */}
        <OlmaArtisanCategoryBar
          trades={trades}
          activeCategory={filters.tradeId || ''}
          onCategorySelect={handleCategorySelect}
        />

        {/* Active Filter Dismissible Pills */}
        <ArtisanActiveFilterPills
          filters={filters}
          trades={trades}
          onRemoveFilter={handleRemoveFilter}
          onResetAll={handleResetAllFilters}
        />

        {/* Framed Category Buttons with Images for Reservation & Job Broadcast */}
        {(!filters.tradeId || filters.tradeId === 'all') && (
          <ArtisanCategoryBookingGrid
            onSelectCategory={(cat) => setSelectedBroadcastCategory(cat)}
          />
        )}

        {/* Header Results & Sort Bar matching Olma Immo */}
        <div className="flex items-center justify-between pt-2 pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-[#1E293B] tracking-tight">
              {loading ? 'Recherche en cours...' : `${totalArtisans} artisan${totalArtisans > 1 ? 's' : ''} vérifié${totalArtisans > 1 ? 's' : ''}`}
            </h2>
            <Link
              to="/artisans/annonces"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded-full transition-colors"
            >
              <Send className="w-3 h-3 text-amber-600" />
              <span>Voir les annonces de chantiers</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <label className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              <span>Trier par :</span>
            </label>
            <select
              value={filters.sort || 'recent'}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sort: e.target.value as 'rating' | 'experience' | 'recent',
                }))
              }
              className="bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
            >
              <option value="recent">Plus récents</option>
              <option value="rating">Mieux notés (★)</option>
              <option value="experience">Plus d'expérience</option>
            </select>
          </div>
        </div>

        {/* Artisans Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 mx-auto text-[#1E3A8A] animate-spin" />
            <p className="text-xs font-bold text-slate-500 mt-3">
              Chargement des artisans qualifiés...
            </p>
          </div>
        ) : artisans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 pt-2">
            {artisans.map((artisan) => (
              <ArtisanCard
                key={artisan.id}
                artisan={artisan}
                onRequestQuote={(art) => setSelectedArtisanForQuote(art)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-lg mx-auto my-8 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Aucun artisan ne correspond à ces critères
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Essayez d'élargir la localisation à toute la wilaya ou de réinitialiser vos filtres.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              Réinitialiser tous les filtres
            </button>
          </div>
        )}
      </div>

      {/* Quote Request Modal */}
      <QuoteRequestModal
        artisan={selectedArtisanForQuote}
        isOpen={Boolean(selectedArtisanForQuote)}
        onClose={() => setSelectedArtisanForQuote(null)}
      />

      {/* Job Broadcast Modal */}
      <ArtisanJobBroadcastModal
        category={selectedBroadcastCategory}
        isOpen={Boolean(selectedBroadcastCategory)}
        onClose={() => setSelectedBroadcastCategory(null)}
      />
    </OlmaArtisanShell>
  );
};

