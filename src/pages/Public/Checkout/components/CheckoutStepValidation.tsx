import React from "react";
import { Check, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

interface CheckoutStepValidationProps {
  activeAccordion: number;
  setActiveAccordion: (step: number) => void;
  formData: {
    fullName: string;
    email: string;
    phone: string;
    wilaya: string;
    commune: string;
    address: string;
  };
  deliveryMethod: "domicile" | "stopdesk";
  selectedAgency: string;
  isDeliveryInfoConfirmed: boolean;
  setIsDeliveryInfoConfirmed: (confirmed: boolean) => void;
  handleConfirmDeliveryInfo: () => Promise<void>;
  isSubmitting: boolean;
}

export const CheckoutStepValidation: React.FC<CheckoutStepValidationProps> = ({
  activeAccordion,
  setActiveAccordion,
  formData,
  deliveryMethod,
  selectedAgency,
  isDeliveryInfoConfirmed,
  setIsDeliveryInfoConfirmed,
  handleConfirmDeliveryInfo,
  isSubmitting,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`surface-card p-6 sm:p-8 ${
        activeAccordion === 3 ? "" : "opacity-70"
      } transition-opacity duration-300`}
      id="checkout-step-validation-card"
    >
      <button
        onClick={() => {
          if (formData.commune && formData.address) setActiveAccordion(3);
        }}
        className="w-full flex items-center justify-between text-start bg-none border-none outline-none cursor-pointer"
        type="button"
        id="btn-validation-accordion-trigger"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-all ${
              activeAccordion === 3
                ? "bg-zinc-950 text-white shadow-md scale-105 border border-zinc-950"
                : "border-2 border-zinc-300 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-700"
            }`}
          >
            3
          </div>
          <h3 className="text-lg sm:text-xl font-sans font-bold text-[var(--color-slate-900, #0f172a)]">
            {t("checkout.review_and_pay", "Validation des informations")}
          </h3>
        </div>
      </button>

      <AnimatePresence>
        {activeAccordion === 3 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-8 space-y-6 overflow-hidden"
            id="validation-form-container"
          >
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-zinc-200/80 shadow-2xs space-y-4">
              <h4 className="font-bold text-xs font-sans text-zinc-900 uppercase tracking-wider">
                {t("checkout.delivery_info", "Vos Informations de Livraison")}
              </h4>
              <div className="text-xs sm:text-sm font-medium text-zinc-600 space-y-2.5 divide-y divide-zinc-100">
                <div className="flex gap-2 pt-1">
                  <span className="font-bold text-zinc-900 w-24 shrink-0">
                    {t("checkout.client", "Client :")}
                  </span>
                  <span className="flex-1 break-words font-semibold text-zinc-950">
                    {formData.fullName} <span className="text-zinc-500 font-normal">({formData.phone})</span>
                  </span>
                </div>
                <div className="flex gap-2 pt-2.5">
                  <span className="font-bold text-zinc-900 w-24 shrink-0">
                    {t("checkout.destination", "Destination :")}
                  </span>
                  <span className="flex-1 break-words font-semibold text-zinc-950">
                    {formData.wilaya} • {formData.commune}
                  </span>
                </div>
                {deliveryMethod === "stopdesk" ? (
                  <>
                    <div className="flex gap-2 pt-2.5">
                      <span className="font-bold text-zinc-900 w-24 shrink-0">
                        {t("checkout.agency", "Bureau :")}
                      </span>
                      <span className="flex-1 font-sans font-bold text-amber-900 break-words bg-amber-50 px-2 py-0.5 rounded-md text-xs border border-amber-200/80 w-max">
                        {selectedAgency}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2.5">
                      <span className="font-bold text-zinc-900 w-24 shrink-0">
                        {t("checkout.reference", "Consigne :")}
                      </span>
                      <span className="flex-1 break-words text-zinc-600">
                        {formData.address || "Aucune consigne spécifique"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-2 pt-2.5">
                    <span className="font-bold text-zinc-900 w-24 shrink-0">
                      {t("checkout.reference", "Repère :")}
                    </span>
                    <span className="flex-1 break-words text-zinc-700 font-medium">{formData.address}</span>
                  </div>
                )}
                <div className="flex gap-2 items-center pt-2.5">
                  <span className="font-bold text-zinc-900 w-24 shrink-0">
                    {t("checkout.mode", "Mode :")}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-sans font-bold uppercase tracking-wider shrink-0 ${
                      deliveryMethod === "stopdesk"
                        ? "bg-amber-100 text-amber-950 border border-amber-200"
                        : "bg-zinc-900 text-white"
                    }`}
                  >
                    {deliveryMethod === "stopdesk"
                      ? t("checkout.stopdesk", "Point Relais StopDesk 📦")
                      : t("checkout.door_delivery", "Livraison À Domicile 🚚")}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/60 rounded-2xl p-5 sm:p-6 border border-emerald-200/70 flex gap-4 items-start text-emerald-950">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1 text-emerald-950">
                  {t("checkout.pay_on_delivery", "Paiement à la livraison garanti 🤝")}
                </h4>
                <p className="text-xs font-medium text-emerald-800/90 leading-relaxed">
                  {t(
                    "checkout.pay_on_delivery_desc",
                    "Vous ne payez qu'à la réception de votre commande en espèces (Cash on Delivery). Vérifiez le contenu du colis directement avec le livreur."
                  )}
                </p>

                <div className="mt-4 pt-4 border-t border-emerald-200/60">
                  {isDeliveryInfoConfirmed ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-emerald-100/70 border border-emerald-300/80 p-3.5 rounded-xl text-emerald-950 text-xs font-bold w-full justify-between animate-fade-in">
                      <div className="flex items-center gap-2">
                        <Check className="w-4.5 h-4.5 text-emerald-700 shrink-0" />
                        <span>
                          {t(
                            "checkout.delivery_info_confirmed_status",
                            "Informations de livraison enregistrées avec succès ✓"
                          )}
                        </span>
                      </div>
                      <button
                        onClick={() => setIsDeliveryInfoConfirmed(false)}
                        className="text-[11px] text-zinc-600 hover:text-zinc-950 underline underline-offset-2 uppercase tracking-wider shrink-0 transition-colors bg-transparent border-none cursor-pointer font-bold"
                        type="button"
                        id="btn-modify-delivery-info"
                      >
                        {t("checkout.modify_info", "Modifier")}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleConfirmDeliveryInfo}
                      disabled={isSubmitting}
                      className="w-full h-13 flex items-center justify-center gap-2.5 px-6 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-sm transition-all disabled:opacity-60 cursor-pointer shadow-sm active:scale-98"
                      type="button"
                      id="btn-confirm-personal-info"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{t("checkout.saving_info", "Validation en cours...")}</span>
                        </>
                      ) : (
                        <span>
                          {t(
                            "checkout.confirm_info_button_v2",
                            "Valider mes informations de livraison"
                          )}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
