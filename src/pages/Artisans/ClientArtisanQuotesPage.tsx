import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  ChevronLeft,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchClientMyRequests } from '../../services/artisan.api';
import { ArtisanQuoteRequest } from '../../types/artisan';
import { ArtisanNavbar } from '../../components/artisans/ArtisanNavbar';
import { ClientQuoteCard } from '../../components/artisans/quotes/ClientQuoteCard';

export const ClientArtisanQuotesPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [quotes, setQuotes] = useState<ArtisanQuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');

  const loadQuotes = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchClientMyRequests();
      setQuotes(data);
    } catch (err) {
      console.error('Error fetching client quotes', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        navigate('/auth?redirect=/artisans/mes-demandes');
      } else {
        loadQuotes();
      }
    }
  }, [currentUser, authLoading, loadQuotes, navigate]);

  const filteredQuotes = quotes.filter((q) => {
    if (filter === 'all') return true;
    return q.status === filter;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ArtisanNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => navigate('/artisans')}
            className="hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Artisans & Services</span>
          </button>
          <span>/</span>
          <span className="font-semibold text-slate-900">Mes Demandes de Devis</span>
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Mes Demandes de Devis
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Historique et suivi en direct de vos demandes d&apos;intervention
              </p>
            </div>
          </div>

          <button
            onClick={loadQuotes}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors self-start cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Toutes ({quotes.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>En attente ({quotes.filter((q) => q.status === 'pending').length})</span>
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'accepted'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Acceptées ({quotes.filter((q) => q.status === 'accepted').length})</span>
          </button>
        </div>

        {/* Content list or empty state */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-36 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
            ))}
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Wrench className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Aucune demande de devis dans cette catégorie
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Trouvez un professionnel qualifié parmi nos artisans partenaires vérifiés dans les 58 wilayas.
              </p>
            </div>
            <button
              onClick={() => navigate('/artisans')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Rechercher un artisan</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => (
              <ClientQuoteCard key={quote.id} quote={quote} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
