import React from "react";
import { CheckCircle2, PhoneCall, Truck, Banknote, ShieldCheck, ArrowRight, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../../utils/format";
import { User } from "firebase/auth";
import { CheckoutOrderSummary } from "../hooks/useCheckout";

interface CheckoutSuccessProps {
  orderSummary: CheckoutOrderSummary | null;
  currentUser: User | null;
  formData: {
    fullName: string;
    email: string;
    phone: string;
    wilaya: string;
    commune: string;
    address: string;
  };
  guestPassword: string;
  setGuestPassword: (val: string) => void;
  isConverted: boolean;
  isConverting: boolean;
  handleGuestToFullConversion: () => Promise<void>;
  onNavigateToTracking: () => void;
  onNavigateToShop: () => void;
}

export const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({
  orderSummary,
  currentUser,
  formData,
  guestPassword,
  setGuestPassword,
  isConverted,
  isConverting,
  handleGuestToFullConversion,
  onNavigateToTracking,
  onNavigateToShop,
}) => {
  const { t } = useTranslation();

  const referenceCode = orderSummary?.id ? orderSummary.id.substring(0, 8).toUpperCase() : "OLMA-DZ";

  return (
    <div className="max-w-3xl mx-auto text-center space-y-10 py-6 sm:py-10 px-4" id="checkout-success-view">
      {/* Animated Success Badge */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25"
        >
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
        </motion.div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            {t("checkout.order_received", "Commande validée avec succès")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black text-zinc-950 tracking-tight">
            {t("checkout.thank_you_title", "Merci pour votre commande !")}
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base font-medium max-w-md mx-auto">
            {t("Référence de suivi :")}{" "}
            <span className="font-mono font-bold text-zinc-950 px-2 py-0.5 bg-zinc-100 rounded-md border border-zinc-200 text-xs sm:text-sm">
              #{referenceCode}
            </span>
          </p>
        </div>
      </div>

      {/* Order Quick Recap Card */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-7 shadow-xs text-start space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              {t("Destinataire & Wilaya")}
            </span>
            <p className="font-bold text-sm sm:text-base text-zinc-950 mt-0.5">
              {formData.fullName || t("Client")} • {formData.wilaya} ({formData.commune})
            </p>
            <p className="text-xs text-zinc-500 font-medium">{formData.phone}</p>
          </div>
          <div className="sm:text-end">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              {t("Montant total à régler (COD)")}
            </span>
            <p className="text-xl sm:text-2xl font-sans font-black text-amber-600 tabular-nums">
              {formatPrice(orderSummary?.total || 0)}
            </p>
          </div>
        </div>

        {/* 3-Step COD Process Roadmap */}
        <div className="pt-2">
          <h4 className="text-xs font-bold font-sans text-zinc-900 uppercase tracking-wider mb-4">
            {t("Prochaines étapes de votre livraison")} :
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="text-start">
                <h5 className="font-bold text-xs text-zinc-950">{t("1. Appel de validation")}</h5>
                <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">
                  {t("Notre service client vous appelle pour confirmer vos informations.")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-start">
                <h5 className="font-bold text-xs text-zinc-950">{t("2. Expédition rapide")}</h5>
                <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">
                  {t("Acheminement vers votre wilaya avec notification par SMS.")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Banknote className="w-4 h-4" />
              </div>
              <div className="text-start">
                <h5 className="font-bold text-xs text-zinc-950">{t("3. Paiement en espèces")}</h5>
                <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">
                  {t("Réglez le montant exact au livreur à la réception de votre colis.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Account Conversion Box */}
      {orderSummary?.guestUserId && !currentUser && (
        <div className="bg-white border border-zinc-200/90 p-6 sm:p-8 rounded-2xl shadow-xs text-start max-w-lg mx-auto space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-sans font-bold text-zinc-950">
                {t("convert_to_full_account", "Activer mon compte en 1 clic")}
              </h3>
              <p className="text-xs text-zinc-500">
                {t("Suivez vos colis en direct et retrouvez vos factures.")}
              </p>
            </div>
          </div>

          {isConverted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center gap-2.5 text-emerald-900 text-xs font-bold">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>{t("Compte activé avec succès ! Vos commandes y sont désormais associées.")}</span>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block">
                  {t("email_address", "E-mail")}
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full h-11 px-3.5 bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block">
                  {t("choose_password", "Créer un mot de passe")}
                </label>
                <input
                  type="password"
                  placeholder={t("Min 6 caractères") || "Min 6 caractères"}
                  value={guestPassword}
                  onChange={(e) => setGuestPassword(e.target.value)}
                  className="w-full h-11 px-3.5 bg-zinc-50/70 border border-zinc-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 rounded-xl text-xs font-semibold text-zinc-900 outline-none transition-all"
                />
              </div>
              <button
                onClick={handleGuestToFullConversion}
                disabled={isConverting}
                className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer border-none active:scale-95 shadow-xs flex items-center justify-center gap-2"
                type="button"
                id="btn-guest-conversion"
              >
                {isConverting ? (
                  <span>{t("creating_account", "Création en cours...")}</span>
                ) : (
                  <span>{t("register_now", "Enregistrer mon compte client")}</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3.5 justify-center pt-4">
        <button
          onClick={onNavigateToTracking}
          className="h-13 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
          type="button"
          id="btn-navigate-tracking"
        >
          <span>{t("my_orders") || "Suivre ma commande"}</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>

        <button
          onClick={onNavigateToShop}
          className="h-13 px-8 rounded-2xl bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-sm border border-zinc-200 shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          type="button"
          id="btn-navigate-shop"
        >
          <ShoppingBag className="w-4 h-4 text-zinc-600" />
          <span>{t("continue_shopping") || "Continuer mes achats"}</span>
        </button>
      </div>
    </div>
  );
};

