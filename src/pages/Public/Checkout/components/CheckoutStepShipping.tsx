import React from "react";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { CheckoutDeliveryMethods } from "./CheckoutDeliveryMethods";
import { CheckoutLocationSelector } from "./CheckoutLocationSelector";
import { ShippingLocation } from "../../../../services/shippingClient";

interface CheckoutStepShippingProps {
  activeAccordion: number;
  setActiveAccordion: (step: number) => void;
  isStep1Completed: boolean;
  isStep2Completed: boolean;
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
  deliveryMethod: "domicile" | "stopdesk";
  setDeliveryMethod: (method: "domicile" | "stopdesk") => void;
  selectedAgency: string;
  setSelectedAgency: (agency: string) => void;
  availableCommunes: string[];
  availableCenters: string[];
  shippingData?: { wilayas: ShippingLocation[] };
}

export const CheckoutStepShipping: React.FC<CheckoutStepShippingProps> = ({
  activeAccordion,
  setActiveAccordion,
  isStep1Completed,
  isStep2Completed,
  isValidPhone,
  formData,
  setFormData,
  deliveryMethod,
  setDeliveryMethod,
  selectedAgency,
  setSelectedAgency,
  availableCommunes,
  availableCenters,
  shippingData,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`surface-card p-6 sm:p-8 ${
        activeAccordion === 2 ? "" : "opacity-70"
      } transition-opacity duration-300`}
      id="checkout-step-shipping-card"
    >
      <button
        onClick={() => {
          if (isValidPhone && formData.fullName.trim()) setActiveAccordion(2);
        }}
        className="w-full flex items-center justify-between text-start bg-none border-none outline-none cursor-pointer"
        type="button"
        id="btn-shipping-accordion-trigger"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-all ${
              activeAccordion === 2
                ? "bg-zinc-950 text-white shadow-md scale-105 border border-zinc-950"
                : isStep2Completed && isStep1Completed
                ? "bg-emerald-500 text-white border border-emerald-500"
                : "border-2 border-zinc-300 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-700"
            }`}
          >
            {isStep2Completed && isStep1Completed && activeAccordion !== 2 ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              "2"
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-sans font-bold text-[var(--color-slate-900, #0f172a)]">
            {t("checkout.shipping", "Expédition (Où ?)")}
          </h3>
        </div>
      </button>

      <AnimatePresence>
        {activeAccordion === 2 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            id="shipping-form-container"
          >
            <div className="pt-8 space-y-6">
              <CheckoutLocationSelector
                wilaya={formData.wilaya}
                commune={formData.commune}
                setFormData={setFormData}
                availableCommunes={availableCommunes}
                shippingData={shippingData}
              />

              <CheckoutDeliveryMethods
                deliveryMethod={deliveryMethod}
                setDeliveryMethod={setDeliveryMethod}
                selectedAgency={selectedAgency}
                setSelectedAgency={setSelectedAgency}
                wilaya={formData.wilaya}
                availableCenters={availableCenters}
              />

              <div className="space-y-3">
                <label
                  htmlFor="landmark"
                  className="text-xs font-sans font-bold text-stone-400 uppercase tracking-widest rtl:tracking-normal ms-1"
                >
                  {deliveryMethod === "stopdesk"
                    ? t(
                        "checkout.landmark_stopdesk",
                        "Instructions complémentaires (ex : disponible l'après-midi)"
                      )
                    : t(
                        "checkout.landmark_home",
                        "Adresse exacte & Repères (ex: N° de maison, près de la pharmacie)"
                      )}
                </label>
                <textarea
                  id="landmark"
                  rows={3}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder={
                    deliveryMethod === "stopdesk"
                      ? t(
                          "checkout.placeholder_stopdesk",
                          "Saisissez toute consigne utile pour la préparation ou l'arrivée du colis."
                        )
                      : t(
                          "checkout.placeholder_home",
                          "Pas de code postal. Indiquez plutôt un lieu connu, votre quartier, le numéro d'appartement ou particularité de votre bâtiment."
                        )
                  }
                  className="w-full px-6 py-4 bg-transparent border border-stone-200 rounded-2xl outline-none font-bold text-sm resize-none focus:ring-2 ring-[var(--color-orange-600, #ea580c)]/20"
                />
              </div>

              <button
                onClick={() => {
                  if (deliveryMethod === "stopdesk" && !selectedAgency) {
                    toast.error(
                      t(
                        "checkout.select_agency_error",
                        "Veuillez sélectionner un bureau de retrait pour la livraison en agence."
                      )
                    );
                    return;
                  }
                  if (formData.commune && formData.address) {
                    setActiveAccordion(3);
                  } else {
                    toast.error(
                      t(
                        "checkout.invalid_commune_landmark",
                        "Veuillez choisir une commune et un point de repère."
                      )
                    );
                  }
                }}
                className="btn-ghost-teal w-full sm:w-auto mt-4"
                type="button"
                id="btn-shipping-continue"
              >
                {t("checkout.continue_validation", "Passer à la validation")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
