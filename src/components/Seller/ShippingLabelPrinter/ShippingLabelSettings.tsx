import React from "react";
import { Building2, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ShippingLabelSettingsProps } from "./shippingLabel.types";

export const ShippingLabelSettings: React.FC<ShippingLabelSettingsProps> = ({
  labelSize,
  setLabelSize,
  remarks,
  setRemarks,
  includeBarcodes,
  setIncludeBarcodes,
  formats,
}) => {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-5 space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm space-y-5">
        <h3 className="text-xs rtl:text-sm font-sans font-bold text-[var(--color-slate-900, #0f172a)] uppercase tracking-widest rtl:tracking-normal flex items-center gap-1">
          <Settings className="w-4 h-4 text-[var(--color-orange-600, #ea580c)]" />
          {t("Format & Paramètres")}
        </h3>

        {/* Paper format size */}
        <div className="space-y-2">
          <label className="block text-[10px] rtl:text-[12px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal">
            {t("Format du Bordereau")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {formats.map((sz) => (
              <button
                key={sz.id}
                onClick={() => setLabelSize(sz.id)}
                className={`py-2 px-2 rounded-xl text-[10px] rtl:text-[12px] font-black uppercase tracking-wider rtl:tracking-normal transition-all border cursor-pointer ${labelSize === sz.id ? "bg-[var(--color-slate-900, #0f172a)] text-white border-transparent" : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100"}`}
              >
                {sz.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Remarks for courier */}
        <div className="space-y-2">
          <label className="block text-[10px] rtl:text-[12px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal">
            {t("Instructions de livraison (Bordereau Vendeur)")}
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            placeholder={t("Ex: Appeler avant d'arriver...") || "Ex: Appeler avant d'arriver..."}
            className="w-full text-xs rtl:text-sm font-semibold p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-[var(--color-orange-600, #ea580c)] outline-none"
          />
        </div>

        {/* Include elements */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs rtl:text-sm font-bold text-zinc-600">{t("Imprimer les Codes Barres & QR")}</span>
          <button
            onClick={() => setIncludeBarcodes(!includeBarcodes)}
            className={`w-11 h-6 rounded-full transition-all relative ${includeBarcodes ? "bg-[#ea580c]" : "bg-zinc-200"}`}
          >
            <div
              className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.75 transition-all ${includeBarcodes ? "right-1" : "left-1"}`}
            />
          </button>
        </div>
      </div>

      {/* Direct Seller Logistics Info Box */}
      <div className="bg-[var(--color-slate-900, #0f172a)] text-white rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-orange-400" />
          <h4 className="text-xs rtl:text-sm font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-[#FAF8F5]">
            {t("Livraison Directe Vendeur")}
          </h4>
        </div>
        <p className="text-[11px] text-zinc-300 leading-relaxed font-semibold">
          {t(
            "Vous gérez directement l'expédition et la livraison de ce colis aux clients. Imprimez ce bordereau officiel pour accompagner le colis lors de l'acheminement."
          )}
        </p>

        <div className="bg-white/10 p-3.5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="block text-[8px] font-sans font-bold uppercase text-zinc-300">{t("Mode de Gestion")}</span>
            <span className="text-xs rtl:text-sm font-bold">
              Autonome Vendeur Olmart
            </span>
          </div>
          <span
            className="px-2.5 py-1 text-[9px] rtl:text-[11px] font-black uppercase tracking-widest rtl:tracking-normal rounded-lg bg-emerald-500 text-white"
          >
            ACTIF
          </span>
        </div>
      </div>
    </div>
  );
};
