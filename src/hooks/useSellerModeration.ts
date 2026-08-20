import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost } from '../lib/api';
import { scheduleVerificationMeet } from '../services/googleWorkspace';
import toast from 'react-hot-toast';

import { Shop } from '../domains/seller/shop.types';

export type Seller = Shop;

const SELLERS_PER_PAGE = 50;

export function useSellerModeration() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
  const { currentUser, userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = parseInt(searchParams.get('page') || '1');
  const statusParam = searchParams.get('status') || '';
  const searchParam = searchParams.get('search') || '';
  const sortByParam = searchParams.get('sortBy') || 'createdAt';
  const sortOrderParam = searchParams.get('sortOrder') || 'desc';

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [selectedSellerIds, setSelectedSellerIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReasons, setRejectReasons] = useState<string[]>([]);
  const [rejectComment, setRejectComment] = useState('');
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<unknown>(null);

  const fetchSellersApi = async (
    pageUrl: number,
    statusUrl: string,
    searchUrl: string,
    sortByUrl: string,
    sortOrderUrl: string
  ) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageUrl.toString(),
        limit: SELLERS_PER_PAGE.toString(),
        sortBy: sortByUrl,
        sortOrder: sortOrderUrl
      });
      if (statusUrl) queryParams.append('status', statusUrl);
      if (searchUrl) queryParams.append('search', searchUrl);

      const data = await apiGet<{ sellers: Seller[]; totalPages: number; total: number }>(
        `/api/v1/admin/sellers?${queryParams.toString()}`
      );

      setSellers(data.sellers || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
    } catch (err: unknown) {
      console.error('[useSellerModeration] Fetch sellers API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellersApi(pageParam, statusParam, searchParam, sortByParam, sortOrderParam);
  }, [pageParam, statusParam, searchParam, sortByParam, sortOrderParam, currentUser]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== searchParam) {
        setSearchParams((prev) => {
          if (searchTerm) prev.set('search', searchTerm);
          else prev.delete('search');
          prev.set('page', '1');
          return prev;
        });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, searchParam, setSearchParams]);

  const handleSelectAllSellers = (checked: boolean) => {
    if (checked) {
      setSelectedSellerIds(sellers.map((s) => s.id));
    } else {
      setSelectedSellerIds([]);
    }
  };

  const handleSelectSeller = (sellerId: string, checked: boolean) => {
    if (checked) {
      setSelectedSellerIds((prev) => [...prev, sellerId]);
    } else {
      setSelectedSellerIds((prev) => prev.filter((id) => id !== sellerId));
    }
  };

  const handleBulkApproveSellers = async () => {
    if (selectedSellerIds.length === 0) return;
    setBulkLoading(true);
    try {
      await apiPost('/api/v1/admin/users/bulk-status', {
        userIds: selectedSellerIds,
        status: 'active'
      });

      setSellers((prev) =>
        prev.map((s) => (selectedSellerIds.includes(s.id) ? { ...s, status: 'active', role: 'seller' } : s))
      );
      setSelectedSellerIds([]);
      toast.success(t('Vendeurs approuvés avec succès'));
    } catch (err: unknown) {
      console.error('[useSellerModeration] Error performing bulk approve:', err);
      toast.error(t("Erreur lors de l'approbation en lot"));
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkSuspendSellers = async () => {
    if (selectedSellerIds.length === 0) return;
    setBulkLoading(true);
    try {
      await apiPost('/api/v1/admin/users/bulk-status', {
        userIds: selectedSellerIds,
        status: 'suspended'
      });

      setSellers((prev) =>
        prev.map((s) => (selectedSellerIds.includes(s.id) ? { ...s, status: 'suspended' } : s))
      );
      setSelectedSellerIds([]);
      toast.success(t('Vendeurs suspendus avec succès'));
    } catch (err: unknown) {
      console.error('[useSellerModeration] Error performing bulk suspend:', err);
      toast.error(t('Erreur lors de la suspension en lot'));
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDeleteSellers = async () => {
    if (selectedSellerIds.length === 0) return;
    if (!window.confirm(t('Êtes-vous sûr de vouloir supprimer définitivement les vendeurs sélectionnés ?'))) {
      return;
    }
    setBulkLoading(true);
    try {
      await apiPost('/api/v1/admin/users/bulk-delete', {
        userIds: selectedSellerIds
      });

      setSellers((prev) => prev.filter((s) => !selectedSellerIds.includes(s.id)));
      setSelectedSellerIds([]);
      toast.success(t('Vendeurs supprimés avec succès'));
    } catch (err: unknown) {
      console.error('[useSellerModeration] Error performing bulk delete:', err);
      toast.error(t('Erreur lors de la suppression en lot'));
    } finally {
      setBulkLoading(false);
    }
  };

  const handleUpdateStatus = async (sellerId: string, status: 'active' | 'rejected' | 'suspended') => {
    try {
      if (!currentUser || userProfile?.role !== 'admin') {
        toast.error('Action non autorisée');
        return;
      }

      if (status === 'rejected') {
        const reasons = [...rejectReasons];
        if (rejectComment.trim()) reasons.push(rejectComment.trim());
        if (reasons.length === 0) {
          toast.error('Veuillez sélectionner ou saisir au moins un motif');
          return;
        }

        await apiPost(`/api/v1/admin/sellers/${sellerId}/reject`, {
          reasons,
          comment: rejectComment.trim() || undefined
        });

        setRejectModalOpen(false);
        setRejectReasons([]);
        setRejectComment('');
      } else if (status === 'active') {
        await apiPost(`/api/v1/admin/sellers/${sellerId}/approve`, {});
      } else if (status === 'suspended') {
        await apiPost(`/api/v1/admin/sellers/${sellerId}/suspend`, {
          reason: 'Suspension administrateur'
        });
      }

      setSellers((prev) => prev.map((s) => (s.id === sellerId ? { ...s, status } : s)));
      if (selectedSeller && selectedSeller.id === sellerId) setSelectedSeller({ ...selectedSeller, status });

      const statusText =
        status === 'active' ? t('activé') : status === 'rejected' ? t('rejeté') : t('suspendu');

      toast.success(isArabic ? `تم ${statusText} بنجاح.` : `Vendeur ${statusText} avec succès.`);
    } catch (err: unknown) {
      console.error('Failed to update status:', err);
      toast.error(t('Erreur lors de la mise à jour du statut.'));
    }
  };

  const handleScheduleMeet = async (sellerId: string, email: string) => {
    try {
      if (typeof scheduleVerificationMeet !== 'function') {
        console.warn('scheduleVerificationMeet non disponible');
        toast.error(isArabic ? 'خدمة الجدولة غير متاحة.' : "Le service de planification n'est pas disponible.");
        return;
      }
      const start = new Date();
      start.setDate(start.getDate() + 1);
      const end = new Date(start);
      end.setHours(start.getHours() + 1);

      const res = await scheduleVerificationMeet(
        email,
        start.toISOString(),
        end.toISOString(),
        'Entretien de Vérification OLMART',
        'Entretien formel de vérification KYC (identité et registre de commerce) pour valider votre boutique.'
      );

      toast.success(
        isArabic
          ? `تم جدولة اجتماع Google Meet بنجاح! رابط الاجتماع: ${res.meetLink}\nتم إرسال بريد إلكتروني للبائع.`
          : `Réunion Google Meet planifiée avec succès ! Lien Meet: ${res.meetLink}\nUn email a été envoyé au Vendeur.`,
        { duration: 8000 }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(
        isArabic ? `خطأ في جدولة الاجتماع: ${msg}` : `Erreur de planification: ${msg}`
      );
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  const handleStatusFilter = (st: string) => {
    setSearchParams((prev) => {
      if (st) prev.set('status', st);
      else prev.delete('status');
      prev.set('page', '1');
      return prev;
    });
  };

  return {
    t,
    isArabic,
    currentUser,
    pageParam,
    statusParam,
    searchParam,
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
  };
}
