import React from "react";
import { History, Clock, Undo2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppTimestamp, normalizeTimestamp } from "../../../utils/date";

export interface CategoryHistoryLog {
  id?: string;
  createdAt?: AppTimestamp | string | number | Date;
  action?: string;
  updatedBy?: {
    email?: string;
    uid?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface CategoryHistorySectionProps {
  historyLoading: boolean;
  historyLogs: CategoryHistoryLog[];
  handleRollback: (log: CategoryHistoryLog) => void;
}

export const CategoryHistorySection: React.FC<CategoryHistorySectionProps> = ({
  historyLoading,
  historyLogs,
  handleRollback,
}) => {
  const { t } = useTranslation();

  return (
    <div className="border-t border-zinc-100 pt-10 mt-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h5 className="text-lg font-sans font-bold flex items-center gap-3 text-zinc-950">
            <History className="w-5 h-5 text-zinc-500" />
            {t("Historique & Versioning de l'Arbre")}
          </h5>
          <p className="text-xs text-zinc-500 font-sans">
            {t(
              "Visualisez l'historique des modifications concurrentes et effectuez des restaurations instantanées (Rollback) en cas d'erreur."
            )}
          </p>
        </div>
      </div>

      {historyLoading ? (
        <div className="py-10 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs space-y-2">
          <Clock className="w-6 h-6 mx-auto animate-spin text-zinc-300" />
          <span>{t("Chargement de l'historique...")}</span>
        </div>
      ) : historyLogs.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-zinc-100/80 rounded-3xl text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">
          {t("Aucun historique disponible.")}
        </div>
      ) : (
        <div className="relative border-s border-zinc-100 ms-4 space-y-6">
          {historyLogs.map((log, index) => {
            const dateStr = log.createdAt ? normalizeTimestamp(log.createdAt).toDate().toLocaleString("fr-FR") : "";
            return (
              <div key={log.id || index} className="relative ps-6 group">
                <div className="absolute -start-[6.5px] top-1.5 w-3 h-3 rounded-full bg-zinc-200 border border-white group-hover:bg-orange-500 transition-colors" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100/50 hover:bg-zinc-50 hover:border-zinc-200/60 transition-all">
                  <div className="space-y-1.5 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-zinc-400">
                      {dateStr}
                    </span>
                    <p className="text-xs font-semibold text-zinc-800 uppercase tracking-wide">
                      {log.action}
                    </p>
                    <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                      {t("Par :")}{" "}
                      <span className="font-bold text-zinc-500">
                        {log.updatedBy?.email || "Admin"}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleRollback(log)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-950 text-zinc-700 hover:text-white border border-zinc-200/80 hover:border-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all self-start sm:self-center shadow-sm cursor-pointer"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    {t("Restaurer")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
