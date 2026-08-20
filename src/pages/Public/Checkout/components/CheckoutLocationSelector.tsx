import React from "react";
import { useTranslation } from "react-i18next";
import { ShippingLocation } from "../../../../services/shippingClient";

interface CheckoutLocationSelectorProps {
  wilaya: string;
  commune: string;
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
  availableCommunes: string[];
  shippingData?: { wilayas: ShippingLocation[] };
}

export const CheckoutLocationSelector: React.FC<CheckoutLocationSelectorProps> = ({
  wilaya,
  commune,
  setFormData,
  availableCommunes,
  shippingData,
}) => {
  const { t } = useTranslation();

  const wilayasToDisplay = shippingData?.wilayas?.map(w => w.name) || [];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label
            htmlFor="wilaya"
            className="text-xs font-sans font-bold text-stone-400 uppercase tracking-widest rtl:tracking-normal ms-1"
          >
            {t("wilaya") || "Wilaya"}
          </label>
          <select
            id="wilaya"
            value={wilaya}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                wilaya: e.target.value,
                commune: "",
              }));
              localStorage.setItem("olma_default_wilaya", e.target.value);
            }}
            className="w-full px-6 py-4 bg-transparent border border-stone-200 rounded-2xl outline-none font-bold text-sm cursor-pointer focus:ring-2 ring-[var(--color-orange-600, #ea580c)]/20"
          >
            {wilayasToDisplay.length > 0 ? wilayasToDisplay.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            )) : <option value={wilaya}>{wilaya}</option>}
          </select>
        </div>
        <div className="space-y-3">
          <label
            htmlFor="commune"
            className="text-xs font-sans font-bold text-stone-400 uppercase tracking-widest rtl:tracking-normal ms-1"
          >
            {t("commune") || "Commune"}
          </label>
          <select
            id="commune"
            value={commune}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, commune: e.target.value }))
            }
            className="w-full px-6 py-4 bg-transparent border border-stone-200 rounded-2xl outline-none font-bold text-sm cursor-pointer focus:ring-2 ring-[var(--color-orange-600, #ea580c)]/20"
          >
            <option value="">
              -- {t("choose_commune") || "Choisissez la commune"} --
            </option>
            {availableCommunes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="Autre">{t("Autre")}</option>
          </select>
        </div>
      </div>

      {commune === "Autre" && (
        <div className="space-y-3">
          <label
            htmlFor="customCommune"
            className="text-xs font-sans font-bold text-stone-400 uppercase tracking-widest rtl:tracking-normal ms-1"
          >
            {t("enter_commune_name") || "Saisir le nom de la Commune"}
          </label>
          <input
            id="customCommune"
            type="text"
            placeholder={t("Ex: Hydra, Hussein Dey") || "Ex: Hydra, Hussein Dey"}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, commune: e.target.value }))
            }
            className="w-full px-6 py-4 bg-transparent border border-stone-200 rounded-2xl outline-none font-bold focus:ring-2 ring-[var(--color-orange-600, #ea580c)]/20"
          />
        </div>
      )}
    </div>
  );
};
