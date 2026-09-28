import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc } from 'firebase/firestore';

import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../hooks/useConfirm';
import { apiGet } from '../../lib/api';
import { db } from '../../lib/firebase';
import { Order, OrderItem } from '../../domains/order/order.types';
import { Shop } from '../../domains/seller/shop.types';
import { subscribeOrderDoc } from '../../services/chatRepository';

import { OrderHeader } from '../../components/Order/OrderHeader';
import { OrderStepper } from '../../components/Order/OrderStepper';
import { OrderSellerItems } from '../../components/Order/OrderSellerItems';
import { OrderPaymentCard } from '../../components/Order/OrderPaymentCard';
import { OrderShippingCard } from '../../components/Order/OrderShippingCard';
import { OrderActionsCard } from '../../components/Order/OrderActionsCard';
import { OrderReviewModal } from '../../components/Order/OrderReviewModal';
import { OrderDisputeModal } from '../../components/Order/OrderDisputeModal';
import { LiveChatDrawer } from '../../components/Chat/LiveChatDrawer';
import { ReturnRequestForm } from '../../components/Buyer/ReturnRequestForm';
import { DisputeChat } from '../../components/Disputes/DisputeChat';

export const OrderDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { confirm: showConfirmModal, ConfirmationDialog } = useConfirm();
  const queryClient = useQueryClient();

  const { data: order, error } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => apiGet<Order>(`/api/v1/orders/${id}`),
    enabled: Boolean(id),
    refetchOnWindowFocus: true,
  });

  const [shops, setShops] = useState<Record<string, Shop>>({});
  const [cancelling, setCancelling] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<OrderItem | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [showDisputeChat, setShowDisputeChat] = useState(false);

  // Real-time Firestore sync with seller updates
  useEffect(() => {
    if (!id) return;
    const unsub = subscribeOrderDoc(id, (liveDoc) => {
      if (liveDoc) {
        queryClient.setQueryData<Order>(['order', id], (prev) => 
          prev ? { ...prev, ...liveDoc } : (liveDoc as unknown as Order)
        );
      }
    });
    return () => unsub();
  }, [id, queryClient]);

  useEffect(() => {
    if (!currentUser || !id || !order?.sellerIds?.length) return;

    // Fetch seller profiles
    order.sellerIds.forEach(async (sid) => {
      try {
        const profile = await apiGet<Shop>(`/api/v1/stores/${sid}`);
        if (profile) setShops((prev) => ({ ...prev, [sid]: profile }));
      } catch { /* non-fatal */ }
    });
  }, [id, currentUser, order?.sellerIds]);

  const handleCancelOrder = async () => {
    if (!order || (order.status || '').toLowerCase() !== 'pending') return;
    const ok = await showConfirmModal(t("Annuler la commande ?"), t("Confirmer l'annulation"));
    if (!ok) return;

    setCancelling(true);
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch("/api/v1/buyer/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: order.id }),
      });
      if (!res.ok) throw new Error("Erreur annulation");
      await queryClient.invalidateQueries({ queryKey: ['order', id] });
      toast.success(t("Commande annulée avec succès !"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setCancelling(false);
    }
  };

  if (!order && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-stone-400">
          <Package className="w-10 h-10 animate-pulse text-orange-600" />
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-600">{t("Chargement...")}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <XCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-stone-900 mb-1">{t("Commande introuvable")}</h2>
        <p className="text-xs text-stone-500 mb-6">{t("Cette commande n'existe pas ou n'est plus accessible.")}</p>
        <button onClick={() => navigate('/dashboard/buyer')} className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold cursor-pointer">
          {t("Retour aux commandes")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/40 pt-20 sm:pt-24 pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <OrderHeader order={order} />
        <OrderStepper order={order} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <OrderSellerItems order={order} shops={shops} onOpenReviewModal={(item) => setReviewItem(item)} />
          </div>

          <div className="space-y-6">
            <OrderPaymentCard order={order} />
            <OrderShippingCard shippingAddress={order.shippingAddress} />
            <OrderActionsCard
              order={order}
              cancelling={cancelling}
              onCancelOrder={handleCancelOrder}
              onOpenChat={() => setChatOpen(true)}
              onOpenReturn={() => setShowReturnForm(true)}
              onOpenDispute={() => setShowDisputeModal(true)}
              onOpenDisputeChat={() => setShowDisputeChat(true)}
            />
          </div>
        </div>
      </div>

      <OrderReviewModal
        isOpen={Boolean(reviewItem)}
        orderId={order.id}
        item={reviewItem}
        onClose={() => setReviewItem(null)}
        onSuccess={(prodId, rating, comment) => {
          queryClient.setQueryData<Order>(['order', id], (prev) => prev ? {
            ...prev,
            reviewsSubmitted: { ...(prev.reviewsSubmitted || {}), [prodId]: { rating, comment, createdAt: new Date().toISOString() } }
          } : prev);
        }}
      />

      <OrderDisputeModal
        isOpen={showDisputeModal}
        orderId={order.id}
        onClose={() => setShowDisputeModal(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['order', id] })}
      />

      {showReturnForm && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-5 shadow-2xl">
            <ReturnRequestForm
              orderId={order.id}
              onClose={() => setShowReturnForm(false)}
              onSubmit={async (data) => {
                const returnObj = { id: Date.now().toString(), status: 'pending' as const, ...data, createdAt: new Date().toISOString() };
                await updateDoc(doc(db, 'orders', order.id), { returnRequest: returnObj });
                await queryClient.invalidateQueries({ queryKey: ['order', id] });
                setShowReturnForm(false);
              }}
            />
          </div>
        </div>
      )}

      {showDisputeChat && order.disputeId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <DisputeChat disputeId={order.disputeId} onClose={() => setShowDisputeChat(false)} />
          </div>
        </div>
      )}

      <LiveChatDrawer isOpen={chatOpen} onClose={() => setChatOpen(false)} orderId={order.id} otherPartyName="Vendeur / Support" />
      <ConfirmationDialog />
    </div>
  );
};
