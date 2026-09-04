import React from "react";
import { CheckCircle2, XCircle, Clock, Eye, MousePointer, CreditCard } from "lucide-react";
import { SponsoredCampaign } from "../../../types/sponsoredCampaign";

interface AdminCampaignRowProps {
  campaign: SponsoredCampaign;
  onApprove: (id: string) => Promise<void>;
  onRejectClick: (id: string) => void;
  onSuspend: (id: string) => Promise<void>;
  onConfirmPayment: (id: string) => void;
}

export const AdminCampaignRow: React.FC<AdminCampaignRowProps> = ({
  campaign: c,
  onApprove,
  onRejectClick,
  onSuspend,
  onConfirmPayment,
}) => {
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
            <p className="text-[10px] text-zinc-400 truncate">Vendeur: {c.sellerId}</p>
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
        <p className="font-mono font-bold text-zinc-900">{c.priceAmount.toLocaleString()} DZD</p>
        <div className="mt-0.5 space-y-0.5">
          <span
            className={`text-[10px] font-bold block ${
              c.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            {c.paymentStatus === "paid" ? "✓ Paiement validé" : "⏳ Paiement en attente"}
          </span>
          {c.paymentProofReference && (
            <div className="text-[9px] text-zinc-500 bg-amber-50/80 border border-amber-200/50 p-1 rounded max-w-[150px] truncate" title={`Réf: ${c.paymentProofReference} | Notes: ${c.paymentProofNotes || "N/A"}`}>
              <span className="font-bold text-amber-900">Reçu:</span> {c.paymentProofReference}
            </div>
          )}
        </div>
      </td>
      <td className="py-3.5 pr-3">
        {c.moderationStatus === "approved" ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Approuvée
          </span>
        ) : c.moderationStatus === "rejected" ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" /> Rejetée
          </span>
        ) : c.moderationStatus === "suspended" ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Suspendue
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> En attente
          </span>
        )}
      </td>
      <td className="py-3.5 pr-3">
        <div className="flex items-center gap-2 text-zinc-600 text-[11px]">
          <span title="Impressions" className="inline-flex items-center gap-0.5">
            <Eye className="w-3 h-3 text-zinc-400" />
            {c.impressions}
          </span>
          <span title="Clics" className="inline-flex items-center gap-0.5">
            <MousePointer className="w-3 h-3 text-zinc-400" />
            {c.clicks}
          </span>
        </div>
      </td>
      <td className="py-3.5 text-right pr-4">
        <div className="flex items-center justify-end gap-1.5">
          {c.paymentStatus !== "paid" && c.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => onConfirmPayment(c.id)}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] transition-colors inline-flex items-center gap-1"
            >
              <CreditCard className="w-3 h-3" />
              Valider Paiement
            </button>
          )}
          {c.moderationStatus !== "approved" && c.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => onApprove(c.id)}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors"
            >
              Approuver
            </button>
          )}
          {c.moderationStatus !== "rejected" && c.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => onRejectClick(c.id)}
              className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-bold text-[11px] transition-colors"
            >
              Rejeter
            </button>
          )}
          {c.moderationStatus === "approved" && c.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => onSuspend(c.id)}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 font-bold text-[11px] transition-colors"
            >
              Suspendre
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
