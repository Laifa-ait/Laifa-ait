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
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        <div className="space-y-2">
          <label
            htmlFor="wilaya"
            className="text-xs font-sans font-bold text-zinc-600 uppercase tracking-wider ms-1 block"
          >
            {t("wilaya") || "Wilaya"} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
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
              className="w-full h-13 px-4 bg-zinc-50/70 border border-zinc-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 rounded-xl outline-none font-semibold text-sm text-zinc-900 cursor-pointer transition-all"
            >
              {wilayasToDisplay.length > 0 ? wilayasToDisplay.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              )) : <option value={wilaya}>{wilaya}</option>}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="commune"
            className="text-xs font-sans font-bold text-zinc-600 uppercase tracking-wider ms-1 block"
          >
            {t("commune") || "Commune"} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              id="commune"
              value={commune}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, commune: e.target.value }))
              }
              className="w-full h-13 px-4 bg-zinc-50/70 border border-zinc-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 rounded-xl outline-none font-semibold text-sm text-zinc-900 cursor-pointer transition-all"
            >
              <option value="">
                -- {t("choose_commune") || "Sélectionnez votre commune"} --
              </option>
              {availableCommunes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="Autre">{t("Autre commune")}</option>
            </select>
          </div>
        </div>
      </div>

      {commune === "Autre" && (
        <div className="space-y-2">
          <label
            htmlFor="customCommune"
            className="text-xs font-sans font-bold text-zinc-600 uppercase tracking-wider ms-1 block"
          >
            {t("enter_commune_name") || "Précisez le nom de votre commune"} <span className="text-rose-500">*</span>
          </label>
          <input
            id="customCommune"
            type="text"
            placeholder={t("Ex: Hydra, Ouled Fayet, Bab Ezzouar...") || "Ex: Hydra, Ouled Fayet, Bab Ezzouar..."}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, commune: e.target.value }))
            }
            className="w-full h-13 px-4 bg-zinc-50/70 border border-zinc-200 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 rounded-xl outline-none font-semibold text-sm text-zinc-900 transition-all"
          />
        </div>
      )}
    </div>
  );
};
