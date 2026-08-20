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
            <div className="bg-transparent rounded-2xl p-6 border border-stone-200">
              <h4 className="font-bold text-sm text-[var(--color-slate-900, #0f172a)] mb-4 uppercase tracking-widest rtl:tracking-normal">
                {t("checkout.delivery_info", "Vos Informations de Livraison")}
              </h4>
              <div className="text-sm font-medium text-stone-600 space-y-2">
                <p className="flex gap-2">
                  <span className="font-bold text-stone-900 w-24 shrink-0">
                    {t("checkout.client", "Client :")}
                  </span>{" "}
                  <span className="flex-1 break-words">
                    {formData.fullName} ({formData.phone})
                  </span>
                </p>
                <p className="flex gap-2">
                  <span className="font-bold text-stone-900 w-24 shrink-0">
                    {t("checkout.destination", "Destination :")}
                  </span>{" "}
                  <span className="flex-1 break-words">
                    {formData.wilaya} • {formData.commune}
                  </span>
                </p>
                {deliveryMethod === "stopdesk" ? (
                  <>
                    <p className="flex gap-2">
                      <span className="font-bold text-stone-900 w-24 shrink-0">
                        {t("checkout.agency", "Bureau :")}
                      </span>{" "}
                      <span className="flex-1 font-sans font-extrabold text-orange-600 break-words bg-orange-50 px-2 py-0.5 rounded text-xs border border-orange-100 w-max">
                        {selectedAgency}
                      </span>
                    </p>
                    <p className="flex gap-2">
                      <span className="font-bold text-stone-900 w-24 shrink-0">
                        {t("checkout.reference", "Consigne :")}
                      </span>{" "}
                      <span className="flex-1 break-words">
                        {formData.address || "Aucune consigne"}
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="flex gap-2">
                    <span className="font-bold text-stone-900 w-24 shrink-0">
                      {t("checkout.reference", "Repère :")}
                    </span>{" "}
                    <span className="flex-1 break-words">{formData.address}</span>
                  </p>
                )}
                <p className="flex gap-2 items-center">
                  <span className="font-bold text-stone-900 w-24 shrink-0">
                    {t("checkout.mode", "Mode :")}
                  </span>{" "}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase tracking-widest shrink-0 ${
                      deliveryMethod === "stopdesk"
                        ? "bg-purple-600 text-white"
                        : "bg-orange-600 text-white"
                    }`}
                  >
                    {deliveryMethod === "stopdesk"
                      ? t("checkout.stopdesk", "📦 Point Relais StopDesk")
                      : t("checkout.door_delivery", "🚚 À Domicile")}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 flex gap-4 items-start text-emerald-800">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">
                  {t("checkout.pay_on_delivery", "Paiement à la livraison 🤝")}
                </h4>
                <p className="text-xs font-medium text-emerald-700/80 leading-relaxed mb-6">
                  {t(
                    "checkout.pay_on_delivery_desc",
                    "Vous ne payez que lorsque vous recevez vos articles en main propre. Aucun paiement par carte n'est requis aujourd'hui."
                  )}
                </p>

                <div className="mt-4 pt-4 border-t border-emerald-100/60">
                  {isDeliveryInfoConfirmed ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-emerald-100/50 border border-emerald-200 p-4 rounded-2xl text-emerald-800 text-xs font-bold w-full justify-between animate-fade-in">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>
                          {t(
                            "checkout.delivery_info_confirmed_status",
                            "Coordonnées de livraison confirmées et enregistrées ✓"
                          )}
                        </span>
                      </div>
                      <button
                        onClick={() => setIsDeliveryInfoConfirmed(false)}
                        className="text-[10px] text-stone-500 hover:text-stone-700 underline uppercase tracking-wider shrink-0 transition-colors bg-transparent border-none cursor-pointer"
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
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-sm transition-all disabled:opacity-60 cursor-pointer"
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
                            "Confirmer mes informations personnelles"
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
