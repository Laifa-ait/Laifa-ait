import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "../../../domains/product/product.types";

export interface ProductRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProduct: Product | null;
  rejectReason: string;
  onRejectReasonChange: (v: string) => void;
  customReason: string;
  onCustomReasonChange: (v: string) => void;
  preconfiguredReasons: string[];
  onSubmit: () => void;
}

export const ProductRejectModal: React.FC<ProductRejectModalProps> = ({
  isOpen,
  onClose,
  targetProduct,
  rejectReason,
  onRejectReasonChange,
  customReason,
  onCustomReasonChange,
  preconfiguredReasons,
  onSubmit,
}) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && targetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3 text-rose-600">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-lg font-sans font-bold uppercase tracking-tight">
                  {t("Motif du Rejet")}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-zinc-500 font-bold uppercase mb-2">
                {t("Produit")} : <span className="text-zinc-900">{targetProduct.name}</span>
              </p>
              <label className="block text-xs font-bold text-zinc-700 uppercase mb-3">
                {t("Sélectionnez le motif principal")} :
              </label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {preconfiguredReasons.map((reason, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                      rejectReason === reason
                        ? "border-rose-500 bg-rose-50/50 text-rose-950"
                        : "border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:border-zinc-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejectReason"
                      value={reason}
                      checked={rejectReason === reason}
                      onChange={(e) => onRejectReasonChange(e.target.value)}
                      className="mt-0.5 accent-rose-600 cursor-pointer"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
                <label
                  className={`flex items-start gap-3 p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                    rejectReason === "Autre reason"
                      ? "border-rose-500 bg-rose-50/50 text-rose-950"
                      : "border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value="Autre reason"
                    checked={rejectReason === "Autre reason"}
                    onChange={(e) => onRejectReasonChange(e.target.value)}
                    className="mt-0.5 accent-rose-600 cursor-pointer"
                  />
                  <span>{t("Autre motif personnalisé")}</span>
                </label>
              </div>

              {rejectReason === "Autre reason" && (
                <div className="mt-4">
                  <textarea
                    rows={3}
                    value={customReason}
                    onChange={(e) => onCustomReasonChange(e.target.value)}
                    placeholder={t("Précisez en détail la non-conformité constatée...")}
                    className="w-full p-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-xs font-semibold outline-none focus:border-rose-500 focus:bg-white transition-all resize-none"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                {t("Annuler")}
              </button>
              <button
                type="button"
                onClick={onSubmit}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                {t("Confirmer le Rejet")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
