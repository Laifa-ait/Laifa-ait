import React from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "../../../domains/product/product.types";
import { formatPrice } from "../../../utils/format";

export interface ProductModerationCardProps {
  product: Product;
  activeTab: "pending" | "active" | "rejected" | "pending_deletion";
  onOpenRejectModal: (p: Product) => void;
  onApprove: (p: Product) => void;
  onConfirmDelete: (p: Product) => void;
  onDenyDelete: (p: Product) => void;
}

export const ProductModerationCard: React.FC<ProductModerationCardProps> = ({
  product: p,
  activeTab,
  onOpenRejectModal,
  onApprove,
  onConfirmDelete,
  onDenyDelete,
}) => {
  const { t } = useTranslation();

  const score =
    p.qualityScore !== undefined
      ? p.qualityScore
      : parseFloat(
          (
            (p.salesCount || 0) * 10 +
            (p.viewsCount || 0) * 0.1 +
            (p.sellerRating !== undefined && p.sellerRating !== null ? p.sellerRating * 5 : 0) -
            (p.rtoRate || 0) * 50
          ).toFixed(2)
        );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border border-stone-150 rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-transform duration-300 group"
    >
      {/* Image container */}
      <div className="aspect-[4/3] bg-zinc-50 relative overflow-hidden shrink-0 border-b border-stone-100">
        {p.image ? (
          <img
            loading="lazy"
            src={p.image}
            alt={p.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
            {t("Pas d'image")}
          </div>
        )}

        {/* Floating badge */}
        <div className="absolute top-4 start-4 flex flex-col gap-2">
          {p.status === "pending" && (
            <>
              <span className="px-3 py-1.5 w-fit rounded-lg bg-orange-100 text-orange-800 text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal">
                {t("⏳ En attente de modération")}
              </span>
              {p.moderationType === "update" ? (
                <span className="px-3 py-1.5 w-fit rounded-lg bg-blue-100 text-blue-800 border border-blue-500/20 text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal shadow-sm flex items-center gap-1.5">
                  <RefreshCw size={12} className="inline-block" /> {t("Produit Modifié")}
                </span>
              ) : (
                <span className="px-3 py-1.5 w-fit rounded-lg bg-purple-100 text-purple-800 border border-purple-500/20 text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal shadow-sm flex items-center gap-1.5">
                  <Sparkles size={12} className="inline-block" /> {t("Nouveau Produit")}
                </span>
              )}
            </>
          )}
          {p.status === "active" && (
            <span className="px-3 py-1.5 w-fit rounded-lg bg-emerald-100 text-emerald-800 text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal">
              {t("✅ Actif")}
            </span>
          )}
          {p.status === "rejected" && (
            <span className="px-3 py-1.5 w-fit rounded-lg bg-red-100 text-red-800 text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal">
              {t("❌ Refusé")}
            </span>
          )}
          {p.status === "pending_deletion" && (
            <span className="px-3 py-1.5 w-fit rounded-lg bg-red-100 text-red-800 text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal animate-pulse">
              {t("🗑️ Suppression Demandée")}
            </span>
          )}
        </div>
      </div>

      {/* Body Info */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest rtl:tracking-normal leading-none">
              {p.category || "Sans catégorie"}
            </span>
            <span className="text-[10px] font-bold text-[#E55B3C] font-mono">{p.wilaya || "N/A"}</span>
          </div>

          <h2 className="text-base font-sans font-bold text-zinc-950 mt-1 lines-clamp-2 leading-tight uppercase font-sans tracking-tight rtl:tracking-normal">
            {p.name}
          </h2>

          <div className="flex items-center gap-2 mt-2">
            {p.brand && (
              <span className="text-[9px] font-sans font-bold px-2 py-1 rounded bg-[#F8F5F1] text-zinc-650 uppercase tracking-wide border border-stone-250">
                {p.brand}
              </span>
            )}
            <span className="text-[9px] font-bold text-zinc-500">
              {t("Vendeur:")}{" "}
              <b className="text-zinc-700 underline">{p.sellerName || "Inconnu"}</b>
            </span>
          </div>

          {p.rejectionReason && activeTab === "rejected" && (
            <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100 text-red-800 text-[10px] font-semibold">
              {t("Motif de rejet:")}{" "}
              <span className="font-normal italic">"{p.rejectionReason}"</span>
            </div>
          )}
        </div>

        {/* Stats metric drawer */}
        <div className="grid grid-cols-2 gap-2 bg-[#FAF8F6] p-3 rounded-xl border border-stone-200/50">
          <div className="text-center">
            <span className="text-[8px] font-sans font-bold text-stone-400 uppercase tracking-wide">
              {t("Score de Qualité")}
            </span>
            <p className="text-xs font-sans font-bold text-stone-800 flex items-center justify-center gap-1 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              {score}
            </p>
          </div>
          <div className="text-center border-l border-stone-300/40">
            <span className="text-[8px] font-sans font-bold text-stone-400 uppercase tracking-wide">
              {t("Prix de Vente")}
            </span>
            <p className="text-xs font-sans font-bold text-zinc-900 mt-0.5">{formatPrice(p.price)}</p>
          </div>
        </div>

        {/* Action buttons */}
        {activeTab === "pending" && (
          <div className="grid grid-cols-2 gap-3 shrink-0 pt-2 border-t border-stone-100">
            <button
              onClick={() => onOpenRejectModal(p)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-700 text-[10px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal transition-all cursor-pointer bg-white"
            >
              <XCircle className="w-3.5 h-3.5" />
              {t("Rejeter")}
            </button>
            <button
              onClick={() => onApprove(p)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 text-[10px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t("Approuver")}
            </button>
          </div>
        )}

        {activeTab === "active" && (
          <div className="shrink-0 pt-2 border-t border-stone-100">
            <button
              onClick={() => onOpenRejectModal(p)}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-700 text-[10px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal transition-all cursor-pointer bg-white"
            >
              <XCircle className="w-3.5 h-3.5" />
              {t("Désactiver / Rejeter")}
            </button>
          </div>
        )}

        {activeTab === "rejected" && (
          <div className="shrink-0 pt-2 border-t border-stone-100">
            <button
              onClick={() => onApprove(p)}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 text-[10px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t("Re-valider ce Produit")}
            </button>
          </div>
        )}

        {activeTab === "pending_deletion" && (
          <div className="grid grid-cols-2 gap-3 shrink-0 pt-2 border-t border-stone-100">
            <button
              onClick={() => onDenyDelete(p)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-zinc-700 text-[10px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal transition-all cursor-pointer bg-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t("Refuser & Garder")}
            </button>
            <button
              onClick={() => onConfirmDelete(p)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 text-[10px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t("Confirmer Suppression")}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
