import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Edit2, Trash2, Zap, AlertTriangle, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { SellerProduct } from '../../../types/seller';
import { formatPrice } from '../../../utils/format';
import { getOptimizedImageUrl } from '../../../utils/imageUtils';

interface SellerProductCardProps {
  product: SellerProduct;
  currentUserId?: string;
  onDuplicate: (product: SellerProduct) => void;
  onEdit: (product: SellerProduct) => void;
  onDeleteRequest: (product: SellerProduct) => void;
  onStockUpdate: (productId: string, newStock: number) => Promise<void>;
}

export const SellerProductCard: React.FC<SellerProductCardProps> = ({
  product,
  currentUserId,
  onDuplicate,
  onEdit,
  onDeleteRequest,
  onStockUpdate,
}) => {
  const { t } = useTranslation();
  const [stockVal, setStockVal] = useState<number>(product.stock);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  const handleStockBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val !== product.stock && val >= 0) {
      setIsUpdatingStock(true);
      try {
        await onStockUpdate(product.id, val);
      } catch (err) {
        setStockVal(product.stock);
      } finally {
        setIsUpdatingStock(false);
      }
    } else {
      setStockVal(product.stock);
    }
  };

  const isPendingDeletion = product.status === 'pending_deletion';
  const effectivePrice = product.flashSaleActive && product.flashPrice
    ? product.flashPrice
    : product.promoPrice || product.price;
  const hasDiscount = (product.promoPrice && product.promoPrice < product.price) || (product.flashSaleActive && product.flashPrice);

  return (
    <div className="p-3.5 sm:p-4 hover:bg-zinc-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group border-b border-zinc-100 last:border-b-0">
      {/* Product Image + Details */}
      <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
        {/* Thumbnail */}
        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-zinc-100 border border-zinc-200/80 overflow-hidden shrink-0 relative shadow-sm">
          <img
            loading="lazy"
            src={getOptimizedImageUrl(product.image, 200) || "https://placehold.co/200x200/png?text=Article"}
            className="w-full h-full object-cover"
            alt={product.name}
          />
          {product.isSponsored && (
            <div className="absolute top-1 start-1 bg-amber-500 text-white p-0.5 rounded-md shadow">
              <Zap className="w-3 h-3 fill-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Title */}
          <h3
            className="font-bold text-sm sm:text-base text-zinc-900 leading-snug line-clamp-2"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Category & Status */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
              {product.category || t("Général")}
            </span>
            <span className="text-zinc-300">•</span>

            {/* Status Pill */}
            {(!product.status || product.status === 'active') && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/70">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{t("En ligne")}</span>
              </span>
            )}
            {product.status === 'pending' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200/70">
                <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                <span>{t("En examen")}</span>
              </span>
            )}
            {product.status === 'pending_deletion' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[10px] font-bold border border-red-200 animate-pulse">
                <span>{t("Suppression demandée")}</span>
              </span>
            )}
            {product.status === 'rejected' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>{t("Refusé")}</span>
              </span>
            )}
            {product.status === 'draft' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-bold border border-zinc-200">
                <span>{t("Brouillon")}</span>
              </span>
            )}

            {product.flashSaleActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>{t("Vente Flash")}</span>
              </span>
            )}
          </div>

          {/* Rejection reason if any */}
          {product.status === 'rejected' && product.rejectionReason && (
            <p className="text-[11px] text-rose-600 font-medium italic">
              {t("Motif :")} "{product.rejectionReason}"
            </p>
          )}

          {/* Price & Stock Line */}
          <div className="flex flex-wrap items-center gap-3 pt-0.5">
            {/* Price */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-[#C75C1A]">
                {formatPrice(effectivePrice || 0)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-zinc-400 line-through font-semibold">
                  {formatPrice(product.price || 0)}
                </span>
              )}
            </div>

            {/* Quick Stock Editor */}
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-100 border border-zinc-200/80 text-[11px]">
              <span className="text-zinc-500 font-bold">{t("Stock :")}</span>
              <input
                type="number"
                min="0"
                value={stockVal}
                onChange={(e) => setStockVal(parseInt(e.target.value, 10) || 0)}
                onBlur={handleStockBlur}
                disabled={isUpdatingStock || isPendingDeletion}
                className="w-10 text-center font-bold text-zinc-900 bg-white border border-zinc-300 rounded px-1 py-0.2 text-xs focus:ring-1 focus:ring-[#C75C1A] outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-1.5 pt-2 sm:pt-0 border-t border-zinc-100 sm:border-t-0 shrink-0">
        {/* Duplicate */}
        <button
          type="button"
          disabled={isPendingDeletion}
          onClick={() => onDuplicate(product)}
          title={t("Dupliquer")}
          className={`h-9 w-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${
            isPendingDeletion
              ? 'bg-zinc-50 text-zinc-300 border-zinc-200 cursor-not-allowed'
              : 'bg-white text-zinc-600 border-zinc-200 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 shadow-sm'
          }`}
        >
          <Copy className="w-4 h-4" />
        </button>

        {/* Edit */}
        <button
          type="button"
          disabled={isPendingDeletion}
          onClick={() => onEdit(product)}
          title={t("Modifier")}
          className={`h-9 w-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${
            isPendingDeletion
              ? 'bg-zinc-50 text-zinc-300 border-zinc-200 cursor-not-allowed'
              : 'bg-white text-zinc-600 border-zinc-200 hover:text-zinc-950 hover:border-zinc-300 hover:bg-zinc-50 shadow-sm'
          }`}
        >
          <Edit2 className="w-4 h-4" />
        </button>

        {/* Delete */}
        <button
          type="button"
          disabled={isPendingDeletion}
          onClick={() => onDeleteRequest(product)}
          title={t("Supprimer")}
          className={`h-9 w-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${
            isPendingDeletion
              ? 'bg-zinc-50 text-zinc-300 border-zinc-200 cursor-not-allowed'
              : 'bg-white text-zinc-400 border-zinc-200 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 shadow-sm'
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
