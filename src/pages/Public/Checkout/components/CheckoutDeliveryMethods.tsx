import React from "react";
import { Check, Truck, Package, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

interface CheckoutDeliveryMethodsProps {
  deliveryMethod: "domicile" | "stopdesk";
  setDeliveryMethod: (method: "domicile" | "stopdesk") => void;
  selectedAgency: string;
  setSelectedAgency: (agency: string) => void;
  wilaya: string;
  availableCenters: string[];
}

export const CheckoutDeliveryMethods: React.FC<CheckoutDeliveryMethodsProps> = ({
  deliveryMethod,
  setDeliveryMethod,
  selectedAgency,
  setSelectedAgency,
  wilaya,
  availableCenters,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Mode de Livraison Option Selector */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-sans font-bold text-stone-400 uppercase tracking-widest rtl:tracking-normal ms-1">
          {t("checkout.delivery_mode", "Mode de livraison")}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setDeliveryMethod("domicile")}
            className={`p-5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between h-36 relative overflow-hidden ${
              deliveryMethod === "domicile"
                ? "border-orange-500 bg-orange-50/5 ring-2 ring-orange-500/20"
                : "border-stone-200 hover:border-stone-300 bg-stone-50/30"
            }`}
          >
            <div className="flex justify-between items-start w-full">
              <span className="p-2.5 bg-orange-100 rounded-xl text-orange-600">
                <Truck className="w-5 h-5" />
              </span>
              {deliveryMethod === "domicile" && (
                <span className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center animate-scale-in">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--color-slate-900, #0f172a)]">
                {t("checkout.domicile_title", "À Domicile 🚚")}
              </h4>
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-0.5 leading-tight">
                {t("checkout.domicile_sub", "Livraison directe à votre adresse")}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setDeliveryMethod("stopdesk")}
            className={`p-5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between h-36 relative overflow-hidden ${
              deliveryMethod === "stopdesk"
                ? "border-orange-500 bg-orange-50/5 ring-2 ring-orange-500/20"
                : "border-stone-200 hover:border-stone-300 bg-stone-50/30"
            }`}
          >
            <div className="flex justify-between items-start w-full">
              <span className="p-2.5 bg-purple-100 rounded-xl text-purple-600">
                <Package className="w-5 h-5" />
              </span>
              {deliveryMethod === "stopdesk" && (
                <span className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center animate-scale-in">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--color-slate-900, #0f172a)]">
                {t("checkout.stopdesk_title", "Point Relais (Stop-Desk) 📦")}
              </h4>
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-0.5 leading-tight">
                {t("checkout.stopdesk_sub", "Tarif réduit, retrait en bureau de poste / agence relais")}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* If Point Relais StopDesk: display list of agencies */}
      <AnimatePresence mode="wait">
        {deliveryMethod === "stopdesk" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 p-5 rounded-2xl bg-orange-50/20 border border-orange-100/60"
          >
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  {t("checkout.agency_selection", "Sélection du Bureau de Retrait")}
                </h4>
                <p className="text-[10px] text-stone-500 leading-normal mt-0.5">
                  {t(
                    "checkout.agency_desc",
                    "Sélectionnez le bureau de retrait le plus proche. Vous serez notifié par SMS dès que votre colis y sera disponible."
                  )}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <select
                id="selectedAgency"
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(e.target.value)}
                className="w-full px-5 py-3 bg-white border border-stone-200 rounded-xl outline-none font-bold text-xs cursor-pointer focus:ring-2 ring-orange-500/10"
              >
                {availableCenters.map((agency) => (
                  <option key={agency} value={agency}>
                    {agency}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
