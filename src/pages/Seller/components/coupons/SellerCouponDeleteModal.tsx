import React from "react";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SellerCouponDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SellerCouponDeleteModal: React.FC<SellerCouponDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white max-w-sm w-full p-6 rounded-3xl shadow-2xl border border-zinc-200/80 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-base font-bold text-zinc-950">
            {t("seller.coupons.delete_confirm_title", "Supprimer ce code promo ?")}
          </h4>
          <p className="text-xs text-zinc-500 mt-1">
            {t(
              "seller.coupons.delete_confirm_desc",
              "Cette action est irréversible. Les clients ne pourront plus utiliser ce code."
            )}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
          >
            {t("common.cancel", "Annuler")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            {t("common.delete", "Supprimer")}
          </button>
        </div>
      </div>
    </div>
  );
};
