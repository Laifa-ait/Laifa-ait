import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Ticket, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CouponCreateForm } from "./CouponCreateForm";
import { CouponItemCard } from "./CouponItemCard";
import { Coupon, CouponFormData } from "../../../domains/marketing/coupon.types";

export interface CouponsTabContentProps {
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  couponForm: CouponFormData;
  setCouponForm: React.Dispatch<React.SetStateAction<CouponFormData>>;
  handleCreateCoupon: (e: React.FormEvent) => void;
  isCreatingCoupon: boolean;
  couponsLoading: boolean;
  coupons: Coupon[];
  handleToggleCouponActive: (id: string, active: boolean, code: string) => void;
  handleDeleteCoupon: (id: string, code: string) => void;
}

export const CouponsTabContent: React.FC<CouponsTabContentProps> = ({
  showAddForm,
  setShowAddForm,
  couponForm,
  setCouponForm,
  handleCreateCoupon,
  isCreatingCoupon,
  couponsLoading,
  coupons,
  handleToggleCouponActive,
  handleDeleteCoupon,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      key="coupons"
      className="bg-white rounded-[3.5rem] border border-zinc-100 shadow-sm p-12"
    >
      <div className="flex items-center justify-between mb-10">
        <h4 className="text-2xl font-sans font-bold flex items-center gap-4 text-zinc-950">
          <Ticket className="w-8 h-8 text-orange-500" />
          {t("Codes Promos & Coupons de la Plateforme (Actifs)")}
        </h4>
        <button
          id="btn-toggle-coupon-form"
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest rtl:tracking-normal flex items-center gap-2.5 transition-all shadow-md cursor-pointer border-none ${
            showAddForm
              ? "bg-zinc-900 text-white"
              : "bg-orange-600 text-white hover:bg-orange-700"
          }`}
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? "Fermer le Panel" : "Nouveau Coupon"}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CouponCreateForm
              couponForm={couponForm}
              setCouponForm={setCouponForm}
              handleCreateCoupon={handleCreateCoupon}
              isCreatingCoupon={isCreatingCoupon}
              setShowAddForm={setShowAddForm}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {couponsLoading ? (
          <div className="py-12 text-center text-zinc-400 font-bold text-sm">
            {t("Chargement des coupons...")}
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 font-bold text-sm border-2 border-dashed border-zinc-100 rounded-3xl">
            {t("Aucun coupon trouvé. Créez-en un pour commencer !")}
          </div>
        ) : (
          coupons.map((coupon) => (
            <CouponItemCard
              key={coupon.id}
              coupon={coupon}
              handleToggleCouponActive={handleToggleCouponActive}
              handleDeleteCoupon={handleDeleteCoupon}
            />
          ))
        )}
      </div>
    </motion.div>
  );
};
