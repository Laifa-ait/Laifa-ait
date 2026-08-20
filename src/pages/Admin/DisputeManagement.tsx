import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Package, Check, X, User, CreditCard, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { formatPrice } from "../../utils/format";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { DisputeChat } from "../../components/Disputes/DisputeChat";
import { MessageSquare } from "lucide-react";
import { apiGet, apiPost } from "../../lib/api";

import { Dispute } from "../../domains/dispute/dispute.types";

export const DisputeManagement: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, userProfile } = useAuth();
  const [cases, setCases] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [decisions, setDecisions] = useState<{ [key: string]: string }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [chatOpenFor, setChatOpenFor] = useState<string | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        const data = await apiGet<{ success: boolean; disputes: Dispute[] }>('/api/v1/disputes/admin/all');
        if (data && data.disputes) {
          setCases(data.disputes.filter((d) => d.status === 'open' || d.status === 'mediation'));
        }
      } catch (e) {
        console.error("Error fetching disputes:", e);
        toast.error(t("Erreur lors du chargement des litiges"));
      } finally {
        setLoading(false);
      }
    };
    if (userProfile?.role === "admin") {
      fetchCases();
    }
  }, [userProfile]);

  const handleResolve = async (c: Dispute) => {
    if (!currentUser || userProfile?.role !== "admin" || !c.id) {
      toast.error(t("Action non autorisée"));
      return;
    }
    
    const decision = decisions[c.id];
    if (!decision) {
      toast.error(t("Veuillez sélectionner une décision avant de résoudre."));
      return;
    }
    const note = notes[c.id] || "";

    try {
      await apiPost(`/api/v1/disputes/admin/${c.id}/resolve`, {
        resolution: decision,
        note
      });

      toast.success(t("Litige résolu et tâche financière envoyée !"));
      setCases((prev) => prev.filter((item) => item.id !== c.id));
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : t("Erreur lors de la résolution");
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-0">
      <h2 className="text-2xl font-sans font-bold text-zinc-900">{t("Litiges et Retours Admin")}</h2>
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-zinc-100">
        {cases.length === 0 ? (
          <div className="py-12 text-center text-zinc-600 font-medium">
            {t("Aucun litige ou demande de retour active.")}
          </div>
        ) : (
          <div className="space-y-6">
            {cases.map((c) => {
              const id = c.id || "";
              return (
                <div
                  key={id}
                  className="p-6 bg-zinc-50 border border-zinc-100 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-5 w-full">
                    <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl shadow-inner">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-sans font-bold text-zinc-900">
                          {t("Commande #")}
                          {c.orderId?.substring(0, 8) || id.substring(0,8)}
                        </p>
                        <span className="text-[10px] bg-zinc-200 text-zinc-700 font-sans font-bold px-2 py-0.5 rounded-md uppercase tracking-wider rtl:tracking-normal">
                          {c.status}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-zinc-800">
                        {t("Raison:")}
                        {c.reason}
                      </p>
                      <p className="text-xs text-zinc-600 font-medium italic">
                        "{c.details}"
                      </p>
                      
                      {c.aiSummary && (
                        <div className="mt-4 mb-2 p-4 bg-indigo-50/50 border border-indigo-100/60 rounded-2xl flex gap-3">
                          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <div className="text-xs text-indigo-900 font-medium leading-relaxed whitespace-pre-wrap">
                            <span className="font-bold block mb-1 uppercase tracking-widest text-[10px] text-indigo-500">
                              Pré-Analyse IA
                            </span>
                            {c.aiSummary}
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-2 flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-zinc-600" />
                        <span className="text-xs font-sans font-bold text-emerald-600">
                          {formatPrice(c.frozenAmount || 0)} {t("DZD (Gelés)")}
                        </span>
                        <button
                           onClick={() => setChatOpenFor(id)}
                           className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                           <MessageSquare className="w-3.5 h-3.5" />
                           {t("Chat & Preuves")}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="w-full md:w-auto">
                      <select
                        value={decisions[id] || ""}
                        onChange={(e) => setDecisions({ ...decisions, [id]: e.target.value })}
                        className="w-full bg-white border border-zinc-200 px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest rtl:tracking-normal outline-none focus:ring-2 ring-emerald-500/20"
                      >
                        <option value="">{t("Décision...")}</option>
                        <option value="buyer_refunded">{t("Rembourser l'acheteur")} ({formatPrice(c.frozenAmount || 0)} DZD)</option>
                        <option value="seller_paid">{t("Clôturer en faveur du vendeur")}</option>
                        <option value="split">{t("Partage à l'amiable (50/50)")}</option>
                      </select>
                    </div>
                    <button
                      onClick={() => handleResolve(c)}
                      className="w-full md:w-auto px-6 py-3.5 bg-zinc-900 hover:bg-black text-white rounded-2xl font-sans font-bold text-xs uppercase tracking-widest rtl:tracking-normal transition-all shadow-lg shadow-zinc-900/20"
                    >
                      {t("Résoudre le litige")}
                    </button>
                  </div>
                </div>
              );
            })}
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
