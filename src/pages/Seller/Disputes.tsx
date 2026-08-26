import React, { useEffect, useState } from "react";
import { AlertTriangle, Package, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { formatPrice } from "../../utils/format";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { DisputeChat } from "../../components/Disputes/DisputeChat";
import { Dispute } from "../../domains/dispute/dispute.types";
import { apiGet } from "../../lib/api";

export const SellerDisputes: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [cases, setCases] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpenFor, setChatOpenFor] = useState<string | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const data = await apiGet<{ success: boolean; disputes: Dispute[] }>('/api/v1/disputes');
        if (data && data.disputes) {
          setCases(data.disputes);
        }
      } catch (e) {
        console.error("Error fetching disputes:", e);
        toast.error(t("Erreur lors du chargement des litiges"));
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [currentUser, t]);

  return (
    <div className="space-y-6 px-4 md:px-0">
      <h2 className="text-2xl font-sans font-bold text-zinc-900">{t("Mes Litiges")}</h2>
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-zinc-100">
        {cases.length === 0 && !loading ? (
          <div className="py-12 text-center text-zinc-600 font-medium">
            {t("Aucun litige en cours.")}
          </div>
        ) : (
          <div className="space-y-6">
            {cases.map((c) => (
              <div
                key={c.id}
                className="p-6 bg-zinc-50 border border-zinc-100 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-start gap-5 w-full">
                  <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl shadow-inner">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-sans font-bold text-zinc-900">
                        {t("Commande #")}
                        {c.orderId?.substring(0, 8) || c.id?.substring(0, 8) || ""}
                      </p>
                      <span className="text-[10px] bg-zinc-200 text-zinc-700 font-sans font-bold px-2 py-0.5 rounded-md uppercase tracking-wider rtl:tracking-normal">
                        {c.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-zinc-800">
                      {t("Raison:")} {c.reason}
                    </p>
                    <p className="text-xs text-zinc-600 font-medium italic">
                      "{c.details}"
                    </p>
                    
                    <div className="pt-2 flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-zinc-600" />
                      <span className="text-xs font-sans font-bold text-orange-600">
                        {formatPrice(c.frozenAmount || 0)} {t("DZD (Fonds gelés)")}
                      </span>
                      <button
                         onClick={() => setChatOpenFor(c.id || null)}
                         className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                      >
                         <MessageSquare className="w-3.5 h-3.5" />
                         {t("Chat avec le client")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {chatOpenFor && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <DisputeChat disputeId={chatOpenFor} onClose={() => setChatOpenFor(null)} />
          </div>
        </div>
      )}
    </div>
  );
};
