import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, Eye, ChevronLeft, ChevronRight, CheckSquare, Square, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useSellerModeration, Seller } from '../../hooks/useSellerModeration';

import { AdminPageHeader } from "../../components/ui/Admin/AdminPageHeader";
import { AdminDataTable } from "../../components/ui/Admin/AdminDataTable";
import { StatusBadge } from "../../components/ui/Admin/StatusBadge";
import { Button } from "../../components/ui/Button";
import { SellersBulkBar } from "../../components/Admin/Sellers/SellersBulkBar";
import { SellerRejectModal } from "../../components/Admin/Sellers/SellerRejectModal";
import { SellerDrawer } from "../../components/Admin/Sellers/SellerDrawer";
import { OptimizedImage } from "../../components/ui/OptimizedImage";
import { normalizeTimestamp } from "../../utils/date";

export const SellerModeration: React.FC = () => {
  const {
    t,
    currentUser,
    pageParam,
    statusParam,
    sellers,
    setSellers,
    loading,
    totalPages,
    totalCount,
    searchTerm,
    setSearchTerm,
    selectedSeller,
    setSelectedSeller,
    selectedSellerIds,
    setSelectedSellerIds,
    bulkLoading,
    rejectModalOpen,
    setRejectModalOpen,
    rejectReasons,
    setRejectReasons,
    rejectComment,
    setRejectComment,
    previewDocUrl,
    setPreviewDocUrl,
    ocrLoading,
    setOcrLoading,
    ocrResult,
    setOcrResult,
    handleSelectAllSellers,
    handleSelectSeller,
    handleBulkApproveSellers,
    handleBulkSuspendSellers,
    handleBulkDeleteSellers,
    handleUpdateStatus,
    handleScheduleMeet,
    handlePageChange,
    handleStatusFilter
  } = useSellerModeration();

  const [searchParams, setSearchParams] = useSearchParams();
  const sortByParam = searchParams.get('sortBy') || 'createdAt';
  const sortOrderParam = searchParams.get('sortOrder') || 'desc';

  const columns = [
    {
      header: (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectAllSellers(selectedSellerIds.length !== sellers.length && sellers.length > 0);
          }}
          className="text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          {selectedSellerIds.length > 0 && selectedSellerIds.length === sellers.length ? (
            <CheckSquare className="w-5 h-5 text-zinc-950" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>
      ),
      accessor: (s: Seller) => {
        const isSelected = selectedSellerIds.includes(s.id);
        return (
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => handleSelectSeller(s.id, !isSelected)}
              className="text-zinc-400 hover:text-zinc-900 transition-colors inline-block cursor-pointer bg-transparent border-none p-0"
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-zinc-950" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
          </div>
        );
      },
      className: "w-12 text-center"
    },
    {
      header: t("Boutique / Vendeur"),
      accessor: (s: Seller) => (
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[1.25rem] bg-zinc-100 overflow-hidden shrink-0 shadow-inner">
            <OptimizedImage
              src={s.logoUrl || `https://ui-avatars.com/api/?name=${s.shopName || s.displayName}&background=random`}
              alt={s.shopName || s.displayName || "Shop Logo"}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-sans font-bold text-lg text-zinc-950 leading-none mb-1.5">{s.shopName || s.displayName}</h4>
            <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal">{s.email}</p>
          </div>
        </div>
      )
    },
    {
      header: t("Wilaya"),
      accessor: (s: Seller) => (
        <span className="text-[11px] font-sans font-bold text-zinc-900 uppercase tracking-widest rtl:tracking-normal">{s.wilaya}</span>
      )
    },
    {
      header: t("Statut Profil"),
      accessor: (s: Seller) => (
        <StatusBadge 
          status={s.status} 
          label={s.status}
        />
      )
    },
    {
      header: (
        <div 
          className="cursor-pointer hover:text-zinc-950 transition-colors flex items-center gap-1"
          onClick={() => {
            const nextOrder = sortByParam === 'createdAt' && sortOrderParam === 'desc' ? 'asc' : 'desc';
            setSearchParams(prev => {
              prev.set('sortBy', 'createdAt'); prev.set('sortOrder', nextOrder); return prev; 
            });
          }}
        >
          {t("Date d'inscription")}
          {sortByParam === 'createdAt' && (sortOrderParam === 'desc' ? '↓' : '↑')}
        </div>
      ),
      accessor: (s: Seller) => (
        <span className="text-sm font-sans font-bold text-zinc-900">
          {s.createdAt ? normalizeTimestamp(s.createdAt).toDate().toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    {
      header: t("Commission"),
      accessor: (s: Seller) => (
        <span className="text-sm font-sans font-bold text-zinc-950">{s.commissionRate || 10}%</span>
      )
    },
    {
      header: t("Actions"),
      accessor: (s: Seller) => (
        <Button
          variant="outline"
          size="sm"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => setSelectedSeller(s)}
        />
      )
    }
  ];

  return (
    <div className="space-y-12">
      <AdminPageHeader 
        title={t("Validation & Annuaire")}
        subtitle={t("Approuvez les nouveaux vendeurs et modérez la plateforme.")}
        actions={
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            {t("Actualiser la liste")}
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1">
          <Search className="absolute start-6 rtl:start-auto rtl:end-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400" />
          <input 
            type="text" 
            placeholder={t("Rechercher par nom de boutique ou vendeur...") || "Rechercher par nom de boutique ou vendeur..."} 
            className="w-full ps-16 pe-8 rtl:pe-16 rtl:ps-8 py-5 bg-white border border-zinc-100 rounded-[2rem] outline-none font-sans font-bold text-sm tracking-tight rtl:tracking-normal focus:ring-4 ring-orange-500/5 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
          {[{ id: '', label: 'Tous' }, { id: 'pending', label: 'En attente' }, { id: 'active', label: 'Approuvés' }, { id: 'rejected', label: 'Rejetés' }, { id: 'suspended', label: 'Suspendus' }].map(st => (
            <button 
              key={st.id}
              onClick={() => handleStatusFilter(st.id)}
              className={`px-6 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest rtl:tracking-normal whitespace-nowrap transition-all ${statusParam === st.id ? 'bg-zinc-950 text-white shadow-xl' : 'bg-white border border-zinc-100 text-zinc-500 hover:text-zinc-900'}`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-zinc-100 shadow-sm overflow-hidden pb-6">
        <AdminDataTable 
          data={sellers}
          columns={columns}
          keyExtractor={(item) => item.id}
          isLoading={loading}
        />
        {totalPages > 1 && (
          <div className="p-6 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/30">
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest rtl:tracking-normal">
              {t("Page")} {pageParam} {t("sur")} {totalPages} {t("(Total:")} {totalCount})
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                icon={<ChevronLeft className="w-4 h-4" />}
                onClick={() => handlePageChange(Math.max(1, pageParam - 1))} 
                disabled={pageParam === 1 || loading}
              />
              <Button 
                variant="outline"
                icon={<ChevronRight className="w-4 h-4" />}
                onClick={() => handlePageChange(Math.min(totalPages, pageParam + 1))} 
                disabled={pageParam === totalPages || loading}
              />
            </div>
          </div>
        )}
      </div>

      <SellersBulkBar
        selectedSellerIds={selectedSellerIds}
        bulkLoading={bulkLoading}
        handleBulkApproveSellers={handleBulkApproveSellers}
        handleBulkSuspendSellers={handleBulkSuspendSellers}
        handleBulkDeleteSellers={handleBulkDeleteSellers}
        setSelectedSellerIds={setSelectedSellerIds}
      />

      <AnimatePresence>
        {selectedSeller && (
          <SellerDrawer
            selectedSeller={selectedSeller}
            setSelectedSeller={setSelectedSeller}
            setPreviewDocUrl={setPreviewDocUrl}
            currentUser={currentUser}
            setSellers={setSellers}
            sellers={sellers}
            ocrLoading={ocrLoading}
            setOcrLoading={setOcrLoading}
            ocrResult={ocrResult as { fullName?: string; documentNumber?: string; dateOfBirth?: string; expiryDate?: string } | null}
            setOcrResult={setOcrResult}
            handleScheduleMeet={handleScheduleMeet}
            handleUpdateStatus={handleUpdateStatus}
            setRejectModalOpen={setRejectModalOpen}
          />
        )}
      </AnimatePresence>

      <SellerRejectModal
        rejectModalOpen={rejectModalOpen}
        setRejectModalOpen={setRejectModalOpen}
        rejectReasons={rejectReasons}
        setRejectReasons={setRejectReasons}
        rejectComment={rejectComment}
        setRejectComment={setRejectComment}
        handleConfirmReject={() => {
          if (selectedSeller) {
            handleUpdateStatus(selectedSeller.id, "rejected");
          }
        }}
      />

      {previewDocUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-6"
        >
          <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[80vh]">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <h4 className="text-xl font-sans font-bold text-zinc-950">{t("Aperçu du Document")}</h4>
              <button
                onClick={() => setPreviewDocUrl(null)}
                className="p-2 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-colors border-none cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-zinc-950 flex items-center justify-center p-4 relative">
              {previewDocUrl.includes(".pdf") ? (
                <iframe src={previewDocUrl} className="w-full h-full rounded-xl bg-white" title="Document Preview" />
              ) : (
                <img loading="lazy" src={previewDocUrl} className="max-w-full max-h-full object-contain" alt="Document Preview" />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
