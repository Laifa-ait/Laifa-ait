import React from "react";
import { QrCode } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../utils/format";
import { ShippingLabelPreviewProps } from "./shippingLabel.types";
import { ShippingLabelBarcode } from "./ShippingLabelBarcode";

export const ShippingLabelPreview: React.FC<ShippingLabelPreviewProps> = ({
  order,
  actualTracking,
  includeBarcodes,
  remarks,
  printAreaRef,
}) => {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-7 flex flex-col items-center">
      <span className="text-[10px] rtl:text-[12px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-3 select-none">
        {t("Aperçu conforme du ticket d'expédition (Standard Algérie)")}
      </span>

      {/* The print isolated paper border */}
      <div
        className="bg-white shadow-2xl p-6 border-2 border-dashed border-zinc-300 rounded-[1.5rem] w-full max-w-[380px]"
        id="print-label-container"
      >
        {/* Embedded inner print sheet to capture as html */}
        <div className="bg-white text-zinc-950 text-left select-text" ref={printAreaRef}>
          <div className="border-[3px] border-zinc-950 p-4 font-mono space-y-4 rounded-xl">
            {/* Header info */}
            <div className="flex items-center justify-between border-b-2 border-zinc-950 pb-2">
              <div className="space-y-0.5">
                <h3 className="text-sm font-sans font-bold uppercase tracking-tighter leading-none">
                  📦 LIVRAISON DIRECTE VENDEUR
                </h3>
                <p className="text-[9px] rtl:text-[11px] font-bold text-zinc-500">
                  {t("Bordereau Algérie 58 Wilayas")}
                </p>
              </div>
              {includeBarcodes && (
                <div className="w-10 h-10 border border-zinc-950 flex items-center justify-center rounded">
                  <QrCode className="w-8 h-8 text-black" />
                </div>
              )}
            </div>

            {/* Sender vs Recipient */}
            <div className="grid grid-cols-2 gap-4 text-[10px] rtl:text-[12px] border-b border-zinc-950 pb-3">
              <div className="space-y-1">
                <span className="block text-[8px] font-sans font-bold text-zinc-500 uppercase tracking-wide">
                  {t("EXPÉDITEUR :")}
                </span>
                <strong className="block text-zinc-900 leading-tight">{t("OLMART DIRECT")}</strong>
                <span className="block text-zinc-500 font-bold">+213 23 00 00</span>
              </div>
              <div className="space-y-1 border-l border-zinc-200 pl-3">
                <span className="block text-[8px] font-sans font-bold text-zinc-500 uppercase tracking-wide">
                  {t("DESTINATAIRE :")}
                </span>
                <strong className="block text-zinc-900 leading-tight">
                  {order.shippingAddress?.name || "Client Olmart"}
                </strong>
                <span className="block text-zinc-500 font-bold">{order.shippingAddress?.phone}</span>
              </div>
            </div>

            {/* Shipping Location Address */}
            <div className="space-y-1 border-b border-zinc-950 pb-3">
              <span className="block text-[8px] font-sans font-bold text-zinc-500 uppercase tracking-wide">
                {t("ADRESSE DE LIVRAISON")}
              </span>
              <p className="text-[11px] font-sans font-bold text-zinc-950 leading-tight">
                {order.shippingAddress?.street || "Non spécifiée"}
              </p>
              <p className="text-[12px] font-sans font-bold text-zinc-900 uppercase">
                📍 {order.shippingAddress?.commune || "Commune"} • {order.shippingAddress?.wilaya || "Wilaya"}
              </p>
            </div>

            {/* Package content details */}
            <div className="space-y-2 text-[10px] rtl:text-[12px] border-b border-zinc-950 pb-3">
              <span className="block text-[8px] font-sans font-bold text-zinc-500 uppercase tracking-wide">
                {t("CONTENU COLIS / ARTICLES")}
              </span>
              <div className="space-y-1 font-sans">
                {order.items?.map((it, k: number) => (
                  <p key={k} className="text-xs rtl:text-sm text-zinc-900 font-bold leading-tight">
                    • {it.name}{" "}
                    <span className="text-zinc-500 font-normal">
                      {t("store_profile.qty_x", "x ")} {it.quantity || 1}
                    </span>
                  </p>
                ))}
              </div>
            </div>

            {/* COD amount to collect - Very highlighted for the delivery guy */}
            <div className="border-[3px] border-zinc-950 p-2 text-center rounded-lg bg-zinc-950 text-white">
              <span className="block text-[8px] font-sans font-bold tracking-widest rtl:tracking-normal text-[#FAF8F5]/70 uppercase">
                {t("MONTANT A ENCAISSER DU CLIENT (COD)")}
              </span>
              <h4 className="text-xl font-sans font-bold">{formatPrice(order.total)}</h4>
              <p className="text-[8px] tracking-wide text-zinc-300 uppercase leading-none mt-1">
                {t("Cash on Delivery - Espèces d'Algérie uniquement")}
              </p>
            </div>

            {/* Bottom barcode tracking visual simulated */}
            {includeBarcodes && (
              <ShippingLabelBarcode actualTracking={actualTracking} />
            )}

            {/* Remarks/Voucher footer details */}
            <div className="text-[9px] rtl:text-[11px] text-zinc-500 leading-tight pt-1 font-sans border-t border-zinc-200">
              <strong>{t("Notes Vendeur :")}</strong> {remarks}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
