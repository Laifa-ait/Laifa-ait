import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, Users } from 'lucide-react';
import { fetchArtisanTrades, searchPublicArtisans } from '../../services/artisan.api';
import { saveSearchHistory } from '../../services/artisanHistory';
import { ArtisanProfile, ArtisanTrade } from '../../types/artisan';
import { ArtisanNavbar } from '../../components/artisans/ArtisanNavbar';
import { ArtisanCard } from '../../components/artisans/ArtisanCard';
import { QuoteRequestModal } from '../../components/artisans/QuoteRequestModal';
import { ArtisansSearchHero } from '../../components/artisans/home/ArtisansSearchHero';
import { ArtisansTrustBanner } from '../../components/artisans/home/ArtisansTrustBanner';
import { ArtisansTradesGrid } from '../../components/artisans/home/ArtisansTradesGrid';

export const ArtisansHome: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTradeId = searchParams.get('tradeId') || searchParams.get('trade') || '';
  const initialWilaya = searchParams.get('wilaya') || '';
  const initialCommune = searchParams.get('commune') || '';
  const initialQ = searchParams.get('q') || '';

  const [trades, setTrades] = useState<ArtisanTrade[]>([]);
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
  const [totalArtisans, setTotalArtisans] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState(initialQ);
  const [selectedTradeId, setSelectedTradeId] = useState<string>(initialTradeId);
  const [selectedWilaya, setSelectedWilaya] = useState<string>(initialWilaya);
  const [selectedCommune, setSelectedCommune] = useState<string>(initialCommune);

  // Quote modal
  const [selectedArtisanForQuote, setSelectedArtisanForQuote] =
    useState<ArtisanProfile | null>(null);

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
        search: searchTerm || undefined,
        tradeId: selectedTradeId || undefined,
        wilaya: selectedWilaya || undefined,
        commune: selectedCommune || undefined,
      });
      setArtisans(res.artisans);
      setTotalArtisans(res.total);

      // Save to client search history if meaningful criteria provided
      if (searchTerm || selectedTradeId || selectedWilaya) {
        const tradeObj = trades.find((t) => t.id === selectedTradeId);
        saveSearchHistory({
          term: searchTerm,
          tradeId: selectedTradeId,
          tradeName: tradeObj?.name,
          wilaya: selectedWilaya,
          commune: selectedCommune,
        });
      }
    } catch (err) {
      console.error('Failed to load artisans', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedTradeId, selectedWilaya, selectedCommune, trades]);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  useEffect(() => {
    loadArtisans();
  }, [loadArtisans]);

  const handleSelectTrade = (tradeId: string) => {
    const nextTrade = selectedTradeId === tradeId ? '' : tradeId;
    setSelectedTradeId(nextTrade);
    if (nextTrade) {
      searchParams.set('tradeId', nextTrade);
    } else {
      searchParams.delete('tradeId');
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadArtisans();
  };

  return (
    <div id="artisans-home-page" className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <ArtisanNavbar activeTab="home" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10">
        <ArtisansSearchHero
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          selectedWilaya={selectedWilaya}
          selectedCommune={selectedCommune}
          onWilayaChange={(w, c) => {
            setSelectedWilaya(w);
            setSelectedCommune(c);
          }}
          onSearchSubmit={handleSearchSubmit}
        />

        <ArtisansTrustBanner />

        <ArtisansTradesGrid
          trades={trades}
          selectedTradeId={selectedTradeId}
          onSelectTrade={handleSelectTrade}
        />

        {/* Artisans Results Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Artisans Disponibles ({totalArtisans})
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Professionnels prêts à intervenir pour vos travaux
              </p>
            </div>

            {(selectedTradeId || selectedWilaya || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedTradeId('');
                  setSelectedWilaya('');
                  setSelectedCommune('');
                  setSearchTerm('');
                  setSearchParams({});
                }}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-16 text-center">
              <RefreshCw className="w-8 h-8 mx-auto text-amber-500 animate-spin" />
              <p className="text-xs font-bold text-slate-500 mt-2">
                Recherche des artisans en cours...
              </p>
            </div>
          ) : artisans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artisans.map((artisan) => (
                <ArtisanCard
                  key={artisan.id}
                  artisan={artisan}
                  onRequestQuote={(art) => setSelectedArtisanForQuote(art)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
              <Users className="w-10 h-10 mx-auto text-slate-300" />
              <div className="space-y-1">
                <p className="font-extrabold text-sm text-slate-800">
                  Aucun artisan ne correspond à ces critères
                </p>
                <p className="text-xs text-slate-500">
                  Essayez d'élargir votre recherche à toute la wilaya ou à un autre métier.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      <QuoteRequestModal
        artisan={selectedArtisanForQuote}
        isOpen={Boolean(selectedArtisanForQuote)}
        onClose={() => setSelectedArtisanForQuote(null)}
      />
    </div>
  );
};
