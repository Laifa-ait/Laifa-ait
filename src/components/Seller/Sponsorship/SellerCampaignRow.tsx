import React from "react";
import { CheckCircle2, Clock, Ban, Eye, MousePointer, CreditCard } from "lucide-react";
import { SponsoredCampaign } from "../../../types/sponsoredCampaign";

interface SellerCampaignRowProps {
  campaign: SponsoredCampaign;
  onCancel: (id: string) => Promise<void>;
  onAddProof?: (campaign: SponsoredCampaign) => void;
}

export const SellerCampaignRow: React.FC<SellerCampaignRowProps> = ({
  campaign: c,
  onCancel,
  onAddProof,
}) => {
  const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(1) : "0.0";

  const getStatusBadge = () => {
    if (c.status === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600">
          <Ban className="w-3 h-3" /> Annulée
        </span>
      );
    }
    if (c.moderationStatus === "rejected") {
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 cursor-help"
          title={c.rejectionReason ? `Motif: ${c.rejectionReason}` : "Rejetée par l'admin"}
        >
          <Ban className="w-3 h-3" /> Rejetée
        </span>
      );
    }
    if (c.status === "active") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="w-3 h-3" /> En Ligne
        </span>
      );
    }
    if (c.moderationStatus === "approved") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
          <CheckCircle2 className="w-3 h-3" /> Approuvée
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
        <Clock className="w-3 h-3" /> Modération
      </span>
    );
  };

  return (
    <tr className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors">
      <td className="py-3.5 pl-4 pr-3">
        <div className="flex items-center gap-3">
          {c.productImage ? (
            <img
              src={c.productImage}
              alt={c.productName}
              className="w-10 h-10 rounded-xl object-cover bg-zinc-100 border border-zinc-200 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
              IMG
            </div>
          )}
          <div className="min-w-0 max-w-[200px]">
            <p className="font-bold text-zinc-900 text-xs truncate">{c.productName}</p>
            <p className="text-[10px] text-zinc-400 truncate">Réf: {c.productId}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 pr-3">
        <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-800 uppercase tracking-wider">
          {c.placement}
        </span>
      </td>
      <td className="py-3.5 pr-3">
        <div className="text-[11px]">
          <span>{new Date(c.startAt).toLocaleDateString()}</span>
          <span className="text-zinc-400 mx-1">→</span>
          <span>{new Date(c.endAt).toLocaleDateString()}</span>
          <span className="block text-[10px] text-zinc-400">({c.durationDays}j)</span>
        </div>
      </td>
      <td className="py-3.5 pr-3">
        <div className="font-mono font-bold text-zinc-900">
          {c.priceAmount.toLocaleString()} DZD
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[10px] font-bold ${c.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
            {c.paymentStatus === "paid" ? "Payé" : "Paiement en attente"}
          </span>
          {c.paymentProofReference && (
            <span className="text-[9px] bg-zinc-100 text-zinc-600 px-1 rounded" title={`Réf: ${c.paymentProofReference}`}>
              Reçu joint
            </span>
          )}
        </div>
      </td>
      <td className="py-3.5 pr-3">{getStatusBadge()}</td>
      <td className="py-3.5 pr-3">
        <div className="flex items-center gap-3 text-zinc-600">
          <span className="inline-flex items-center gap-1" title="Impressions">
            <Eye className="w-3.5 h-3.5 text-zinc-400" />
            {c.impressions}
          </span>
          <span className="inline-flex items-center gap-1" title="Clics">
            <MousePointer className="w-3.5 h-3.5 text-zinc-400" />
            {c.clicks}
          </span>
          <span className="font-bold text-zinc-800 font-mono" title="CTR">
            {ctr}%
          </span>
        </div>
      </td>
      <td className="py-3.5 text-right pr-4">
        <div className="flex items-center justify-end gap-1.5">
          {c.paymentStatus !== "paid" && c.status !== "cancelled" && onAddProof && (
            <button
              type="button"
              onClick={() => onAddProof(c)}
              className="px-2 py-1 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 rounded-lg inline-flex items-center gap-1 transition-colors"
            >
              <CreditCard className="w-3 h-3" />
              {c.paymentProofReference ? "Modifier reçu" : "Transmettre reçu"}
            </button>
          )}
          {c.status !== "cancelled" && c.status !== "completed" && (
            <button
              type="button"
              onClick={() => onCancel(c.id)}
              className="px-2 py-1 text-[11px] font-bold text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Annuler
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
