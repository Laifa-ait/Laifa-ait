import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Star,
  Trash2,
  ExternalLink,
  ChevronRight,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import {
  getSearchHistory,
  clearSearchHistory,
  getFavoriteArtisans,
  ArtisanSearchHistoryItem,
  ArtisanFavoriteItem,
} from '../../../services/artisanHistory';
import { fetchClientMyRequests } from '../../../services/artisan.api';
import { ArtisanQuoteRequest } from '../../../types/artisan';

interface DrawerClientSectionProps {
  onClose: () => void;
  isLoggedIn: boolean;
}

export const DrawerClientSection: React.FC<DrawerClientSectionProps> = ({
  onClose,
  isLoggedIn,
}) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ArtisanSearchHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<ArtisanFavoriteItem[]>([]);
  const [myQuotes, setMyQuotes] = useState<ArtisanQuoteRequest[]>([]);

  useEffect(() => {
    setHistory(getSearchHistory());
    setFavorites(getFavoriteArtisans());

    if (isLoggedIn) {
      fetchClientMyRequests().then((res) => setMyQuotes(res));
    }
  }, [isLoggedIn]);

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSearchHistory();
    setHistory([]);
  };

  const handleSelectHistory = (item: ArtisanSearchHistoryItem) => {
    const params = new URLSearchParams();
    if (item.tradeId) params.set('trade', item.tradeId);
    if (item.wilaya) params.set('wilaya', item.wilaya);
    if (item.term) params.set('q', item.term);
    onClose();
    navigate(`/artisans?${params.toString()}`);
  };

  return (
    <div className="space-y-5">
      {/* SECTION: Mes Demandes de Devis */}
      <div className="bg-amber-50/60 rounded-2xl p-3.5 border border-amber-200/70">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500 text-slate-950 rounded-lg">
              <FileText className="w-4 h-4" />
            </span>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Mes Demandes de Devis
            </h4>
          </div>
          {myQuotes.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black">
              {myQuotes.length} active{myQuotes.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-600 mb-3">
          Suivez l&apos;état d&apos;avancement de vos demandes et contacts avec les artisans.
        </p>

        <button
          onClick={() => {
            onClose();
            navigate(isLoggedIn ? '/artisans/mes-demandes' : '/auth?redirect=/artisans/mes-demandes');
          }}
          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
        >
          <span>Consulter mes devis ({myQuotes.length})</span>
          <ChevronRight className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      {/* SECTION: Mes Recherches Récentes */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5 text-slate-800">
            <Search className="w-3.5 h-3.5 text-amber-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Recherches Récentes
            </h4>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-[10px] text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Effacer</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-slate-400 text-[11px]">
            <Clock className="w-4 h-4 mx-auto mb-1 opacity-50" />
            <span>Aucune recherche mémorisée</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {history.slice(0, 4).map((h) => (
              <button
                key={h.id}
                onClick={() => handleSelectHistory(h)}
                className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200/60 hover:border-amber-300 transition-all flex items-center justify-between text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-2 truncate">
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">
                    {h.tradeName || h.term || 'Tous les artisans'}
                  </span>
                  {h.wilaya && (
                    <span className="text-[10px] text-slate-500 flex items-center gap-0.5 shrink-0">
                      <MapPin className="w-2.5 h-2.5" />
                      {h.wilaya}
                    </span>
                  )}
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SECTION: Mes Artisans Sauvegardés / Favoris */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5 text-slate-800">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Artisans Enregistrés ({favorites.length})
            </h4>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-slate-400 text-[11px]">
            <span>Enregistrez des artisans favoris pour les retrouver ici en 1 clic.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {favorites.slice(0, 3).map((f) => (
              <div
                key={f.id}
                onClick={() => {
                  onClose();
                  navigate(`/artisans/profile/${f.id}`);
                }}
                className="p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0">
                    {f.fullName.charAt(0)}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                      {f.fullName}
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span>{f.tradeName}</span>
                      <span>•</span>
                      <span>{f.wilaya}</span>
                    </p>
                  </div>
                </div>

                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
