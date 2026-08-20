import React from "react";
import { Truck } from "lucide-react";
import { useTranslation } from "react-i18next";

interface OrderTrackingFormProps {
  carrier: string;
  setCarrier: (val: string) => void;
  trackingNumber: string;
  setTrackingNumber: (val: string) => void;
  trackingLink: string;
  setTrackingLink: (val: string) => void;
  savingTracking: boolean;
  onSaveTracking: () => void;
}

export const OrderTrackingForm: React.FC<OrderTrackingFormProps> = ({
  carrier,
  setCarrier,
  trackingNumber,
  setTrackingNumber,
  trackingLink,
  setTrackingLink,
  savingTracking,
  onSaveTracking,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 space-y-4 text-start">
      <div className="text-start">
        <h4 className="text-xs font-sans font-bold text-zinc-800 uppercase tracking-widest rtl:tracking-normal flex items-center gap-2">
          <Truck className="w-4 h-4 text-orange-600 shrink-0" />
          {t("Suivi Transporteur National")}
        </h4>
        <p className="text-[10px] text-zinc-500 font-medium mt-1">
          {t(
            "Saisissez le lien de suivi de n'importe quel transporteur national (Yassir, Mayestro, Kazitour, ZR Express, etc.)"
          )}
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[8px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-1">
            {t("Nom du Transporteur")} *
          </label>
          <input
            type="text"
            placeholder="Ex: Yassir, ZR Express, Mayestro..."
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-zinc-200 focus:border-orange-500 rounded-xl text-xs font-bold outline-none"
          />
        </div>

        <div>
          <label className="block text-[8px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-1">
            {t("Numéro d'expédition")} *
          </label>
          <input
            type="text"
            placeholder="Ex: YS-23194B"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-zinc-200 focus:border-orange-500 rounded-xl text-xs font-bold outline-none"
          />
        </div>

        <div>
          <label className="block text-[8px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-1">
            {t("Lien Web de Suivi (Optionnel)")}
          </label>
          <input
            type="url"
            placeholder="Ex: https://tracking.yassir.com/shipment/YS-23194B"
            value={trackingLink}
            onChange={(e) => setTrackingLink(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-zinc-200 focus:border-orange-500 rounded-xl text-xs font-bold outline-none"
          />
        </div>

        <button
          type="button"
          disabled={savingTracking}
          onClick={onSaveTracking}
          className="w-full py-3 bg-zinc-950 hover:bg-zinc-850 text-white font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
        >
          {savingTracking ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t("Enregistrement...")}</span>
            </>
          ) : (
            <span>{t("Enregistrer le Suivi")}</span>
          )}
        </button>
      </div>
    </div>
  );
};
