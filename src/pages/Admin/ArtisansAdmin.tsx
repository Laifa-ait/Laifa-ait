import React, { useEffect, useState, useCallback } from 'react';
import { Wrench, RefreshCw, Users, Tag, History } from 'lucide-react';
import {
  adminFetchAllArtisans,
  adminFetchStats,
  fetchArtisanTrades,
  adminFetchAuditLogs,
} from '../../services/artisan.api';
import {
  ArtisanProfile,
  ArtisanStatsSummary,
  ArtisanStatus,
  ArtisanTrade,
  ArtisanAdminAuditLog,
} from '../../types/artisan';
import { AdminArtisansTable } from '../../components/admin/artisans/AdminArtisansTable';
import { AdminTradesManager } from '../../components/admin/artisans/AdminTradesManager';
import { AdminAuditLogsList } from '../../components/admin/artisans/AdminAuditLogsList';
import { AdminStatusModal } from '../../components/admin/artisans/AdminStatusModal';

export const ArtisansAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'artisans' | 'trades' | 'audit'>('artisans');
  const [stats, setStats] = useState<ArtisanStatsSummary | null>(null);
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [trades, setTrades] = useState<ArtisanTrade[]>([]);
  const [auditLogs, setAuditLogs] = useState<ArtisanAdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<ArtisanStatus | 'all'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [tradeFilter, setTradeFilter] = useState('');

  // Status Action Modal State
  const [selectedArtisan, setSelectedArtisan] = useState<ArtisanProfile | null>(null);
  const [actionTargetStatus, setActionTargetStatus] = useState<ArtisanStatus | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, artisansData, tradesData, logsData] = await Promise.all([
        adminFetchStats(),
        adminFetchAllArtisans({
          status: statusFilter,
          search: searchFilter || undefined,
          tradeId: tradeFilter || undefined,
        }),
        fetchArtisanTrades(),
        adminFetchAuditLogs(),
      ]);

      setStats(statsData);
      setArtisans(artisansData.artisans);
      setTotalCount(artisansData.total);
      setTrades(tradesData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('Error loading admin artisan view', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchFilter, tradeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div id="admin-artisans-page" className="space-y-8 p-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 font-bold">
              <Wrench className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Gestion des Artisans & Services
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Modération des candidatures, validation des profils, catégories de métiers et historique
          </p>
        </div>

        <button
          onClick={() => loadData()}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Artisans</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalArtisans || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-amber-600 uppercase">En attente</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats?.pendingCount || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-blue-600 uppercase">En Examen</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{stats?.underReviewCount || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-emerald-600 uppercase">Approuvés</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats?.approvedCount || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-red-600 uppercase">Refusés / Bloqués</p>
          <p className="text-2xl font-black text-red-600 mt-1">
            {(stats?.rejectedCount || 0) + (stats?.suspendedCount || 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-purple-600 uppercase">Devis Traités</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{stats?.totalQuoteRequests || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('artisans')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'artisans'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Liste des Artisans ({totalCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('trades')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'trades'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Métiers & Catégories ({trades.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Journal d'Audit ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: ARTISANS LIST & MODERATION */}
      {activeTab === 'artisans' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ArtisanStatus | 'all')}
              className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente (Nouveaux)</option>
              <option value="under_review">En cours d'examen</option>
              <option value="approved">Approuvés / Actifs</option>
              <option value="rejected">Refusés</option>
              <option value="suspended">Suspendus</option>
              <option value="blocked">Bloqués</option>
            </select>

            <select
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
            >
              <option value="">Tous les métiers</option>
              {trades.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <form onSubmit={handleSearch} className="flex-1 min-w-[220px] flex gap-2">
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone, commune..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
              />
              <button
                type="submit"
                className="px-4 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Filtrer
              </button>
            </form>
          </div>

          <AdminArtisansTable
            artisans={artisans}
            onOpenStatusModal={(art, targetStatus) => {
              setSelectedArtisan(art);
              setActionTargetStatus(targetStatus);
            }}
          />
        </div>
      )}

      {/* TAB 2: TRADES CATEGORIES */}
      {activeTab === 'trades' && (
        <AdminTradesManager trades={trades} onTradesUpdated={loadData} />
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && <AdminAuditLogsList auditLogs={auditLogs} />}

      {/* Confirmation Modal */}
      <AdminStatusModal
        artisan={selectedArtisan}
        targetStatus={actionTargetStatus}
        onClose={() => {
          setSelectedArtisan(null);
          setActionTargetStatus(null);
        }}
        onSuccess={loadData}
      />
    </div>
  );
};
