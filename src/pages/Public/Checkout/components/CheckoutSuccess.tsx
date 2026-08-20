import React from "react";
import { CheckCircle, Ticket, ShieldCheck } from "lucide-react";
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

  return (
    <div className="max-w-3xl mx-auto text-center space-y-12 py-10 px-4" id="checkout-success-view">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-32 h-32 bg-emerald-500 text-white rounded-[3rem] flex items-center justify-center mx-auto shadow-[0_10px_40px_rgba(16,185,129,0.3)]"
      >
        <CheckCircle className="w-16 h-16 animate-pulse" />
      </motion.div>
      <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-sans font-bold text-[var(--color-slate-900, #0f172a)] tracking-tighter rtl:tracking-normal">
          {t("checkout.info_registered_title", "Informations Enregistrées !")}
        </h2>
        <p className="text-stone-600 text-base font-bold max-w-lg mx-auto leading-relaxed">
          {t(
            "checkout.info_registered_desc",
            "Vos coordonnées de livraison ont été enregistrées sous la référence"
          )}{" "}
          <span className="text-[var(--color-slate-900, #0f172a)] font-mono text-sm px-1.5 py-0.5 bg-stone-100 border border-stone-200">
            #{orderSummary?.id?.substring(0, 8)}
          </span>
          .<br />
          <span className="block mt-4 text-stone-800 font-medium">
            {t(
              "checkout.phone_validation_notice",
              "Notre équipe commerciale va vous contacter par téléphone au numéro indiqué pour vérifier vos coordonnées et procéder à l'expédition de votre colis."
            )}
          </span>
          <span className="block mt-4 text-stone-550 text-sm font-semibold">
            {t("checkout.estimated_amount", "Montant estimé à la livraison :")}{" "}
            <span className="text-orange-600 font-extrabold">
              {formatPrice(orderSummary?.total || 0)}
            </span>
          </span>
        </p>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100 p-8 md:p-10 rounded-[3rem] shadow-sm transform hover:scale-[1.01] transition-transform">
        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm text-orange-500 flex items-center justify-center mx-auto mb-6">
          <Ticket className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-sans font-bold text-[var(--color-slate-900, #0f172a)] mb-4">
          {t("earn_points_title") || "Gagnez 100 Olma Points !"}
        </h3>
        <p className="text-sm font-bold text-stone-500 max-w-sm mx-auto leading-relaxed">
          {t("validate_delivery_points_desc") ||
            "Validez la réception de votre colis sur l'application dans les 24h suivant l'arrivée du livreur pour débloquer vos points."}
        </p>
      </div>

      {/* Guest Account Conversion Box */}
      {orderSummary?.guestUserId && !currentUser && (
        <div className="bg-white border border-stone-100 p-8 md:p-10 rounded-[3rem] shadow-xl text-start max-w-lg mx-auto space-y-6">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-sans font-bold text-stone-900">
              {t("convert_to_full_account", "Créer un compte complet en 1 clic")}
            </h3>
            <p className="text-sm text-stone-500 mt-1">
              {t(
                "convert_to_full_account_desc",
                "Sécurisez vos données et suivez l'état de livraison de vos colis en choisissant simplement un mot de passe. Vos données de livraison sont déjà pré-remplies."
              )}
            </p>
          </div>

          {isConverted ? (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                {t(
                  "account_converted_success_alert",
                  "Votre compte a été créé avec succès ! Vos informations ont été rattachées."
                )}
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t("email_address", "E-mail")}
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-5 py-3.5 bg-transparent border border-stone-200 rounded-xl text-sm font-semibold text-stone-400 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t("choose_password", "Choisir un mot de passe")}
                </label>
                <input
                  type="password"
                  placeholder="Min 6 caractères"
                  value={guestPassword}
                  onChange={(e) => setGuestPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-transparent border border-stone-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
              <button
                onClick={handleGuestToFullConversion}
                disabled={isConverting}
                className="w-full btn-premium-orange flex items-center justify-center gap-2 py-3.5 font-bold rounded-2xl cursor-pointer"
                type="button"
                id="btn-guest-conversion"
              >
                {isConverting
                  ? t("creating_account", "Création...")
                  : t("register_now", "Enregistrer mon compte")}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t border-stone-100">
        <button
          onClick={onNavigateToTracking}
          className="btn-premium-orange cursor-pointer"
          type="button"
          id="btn-navigate-tracking"
        >
          {t("my_orders") || "Mes commandes"}
        </button>
        <button
          onClick={onNavigateToShop}
          className="btn-ghost-teal cursor-pointer"
          type="button"
          id="btn-navigate-shop"
        >
          {t("continue_shopping") || "Continuer mes achats"}
        </button>
      </div>
    </div>
  );
};
