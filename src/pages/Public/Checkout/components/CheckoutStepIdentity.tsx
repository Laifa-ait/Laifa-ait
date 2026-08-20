import React from "react";
import { Check, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { User } from "firebase/auth";

interface CheckoutStepIdentityProps {
  activeAccordion: number;
  setActiveAccordion: (step: number) => void;
  isStep1Completed: boolean;
  isValidPhone: boolean;
  formData: {
    fullName: string;
    email: string;
    phone: string;
    wilaya: string;
    commune: string;
    address: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      fullName: string;
      email: string;
      phone: string;
      wilaya: string;
      commune: string;
      address: string;
    }>
  >;
  currentUser: User | null;
}

export const CheckoutStepIdentity: React.FC<CheckoutStepIdentityProps> = ({
  activeAccordion,
  setActiveAccordion,
  isStep1Completed,
  isValidPhone,
  formData,
  setFormData,
  currentUser,
}) => {
  const { t } = useTranslation();

  return (
    <div className="surface-card p-6 sm:p-8" id="checkout-step-identity-card">
      <button
        onClick={() => setActiveAccordion(1)}
        className="w-full flex items-center justify-between text-start bg-none border-none outline-none cursor-pointer"
        type="button"
        id="btn-identity-accordion-trigger"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-all ${
              activeAccordion === 1
                ? "bg-zinc-950 text-white shadow-md scale-105 border border-zinc-950"
                : isStep1Completed
                ? "bg-emerald-500 text-white border border-emerald-500"
                : "border-2 border-zinc-300 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-700"
            }`}
          >
            {isStep1Completed && activeAccordion !== 1 ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              "1"
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-sans font-bold text-[var(--color-slate-900, #0f172a)]">
            {t("checkout.identity", "Identité (Qui ?)")}
          </h3>
        </div>
      </button>

      <AnimatePresence>
        {activeAccordion === 1 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            id="identity-form-container"
          >
            <div className="pt-8 space-y-6">
              <div className="space-y-3">
                <label
                  htmlFor="fullName"
                  className="text-xs font-sans font-bold text-stone-400 uppercase tracking-widest rtl:tracking-normal ms-1"
                >
                  {t("full_name") || "Nom Complet"}
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  placeholder={t("full_name_placeholder") || "Ex: Selma Laifa"}
                  className="w-full px-6 py-4 bg-transparent border border-stone-200 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:border-orange-500 ring-[var(--color-orange-600, #ea580c)]/20 transition-all focus:ring-orange-500/20"
                />
              </div>
              <div className="space-y-3">
                <label
                  htmlFor="email"
                  className="text-xs font-sans font-bold text-stone-400 uppercase tracking-widest rtl:tracking-normal ms-1"
                >
                  {t("email_address") || "Adresse E-mail"}
                </label>
                <input
                  id="email"
                  type="email"
                  required={!currentUser}
                  disabled={!!currentUser}
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder={t("email_placeholder") || "Ex: selma@example.com"}
                  className="w-full px-6 py-4 bg-transparent border border-stone-200 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:border-orange-500 ring-[var(--color-orange-600, #ea580c)]/20 transition-all focus:ring-orange-500/20 disabled:opacity-60 disabled:bg-stone-100"
                />
              </div>
              <div className="space-y-3">
                <label
                  htmlFor="phone"
                  className="text-xs font-sans font-bold text-stone-400 uppercase tracking-widest rtl:tracking-normal ms-1"
                >
                  {t("phone_number") || "Numéro de téléphone"}
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder={t("phone_placeholder") || "Ex: 0550 12 34 56"}
                    className={`w-full px-6 py-4 bg-transparent border rounded-2xl outline-none font-bold text-sm transition-all focus:ring-2 ${
                      isValidPhone
                        ? "border-emerald-500 focus:border-emerald-600 ring-emerald-500/20 focus:ring-emerald-500/20 bg-emerald-50/10"
                        : "border-stone-200 focus:border-orange-500 ring-[var(--color-orange-600, #ea580c)]/20 focus:ring-orange-500/20"
                    }`}
                  />
                  {isValidPhone && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute end-4 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle className="w-6 h-6 text-emerald-500" />
                    </motion.div>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (isValidPhone && formData.fullName.trim()) {
                    setActiveAccordion(2);
                  } else {
                    toast.error(
                      t(
                        "checkout.invalid_name_phone",
                        "Veuillez saisir un nom et un numéro valide algérien."
                      )
                    );
                  }
                }}
                className="btn-ghost-teal w-full sm:w-auto mt-4"
                type="button"
                id="btn-identity-continue"
              >
                {t("checkout.continue_to_shipping", "Continuer vers l'Expédition")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
