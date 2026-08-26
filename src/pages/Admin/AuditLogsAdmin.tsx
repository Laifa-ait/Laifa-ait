import React, { useState, useEffect } from "react";
import { apiGet } from "../../lib/api";
import { Clock, User, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdminPageHeader } from "../../components/ui/Admin/AdminPageHeader";
import { AdminDataTable } from "../../components/ui/Admin/AdminDataTable";
import { AuditLog, AuditLogTimestamp } from "../../domains/admin/types/auditLog.types";

const formatAuditTimestamp = (ts?: AuditLogTimestamp): string => {
  if (!ts) return "N/A";
  if (ts instanceof Date) {
    return isNaN(ts.getTime()) ? "N/A" : ts.toLocaleString();
  }
  if (typeof ts === "string" || typeof ts === "number") {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleString();
  }
  if (typeof ts === "object") {
    if ("toDate" in ts && typeof ts.toDate === "function") {
      return ts.toDate().toLocaleString();
    }
    if ("seconds" in ts && typeof ts.seconds === "number") {
      return new Date(ts.seconds * 1000).toLocaleString();
    }
    if ("_seconds" in ts && typeof ts._seconds === "number") {
      return new Date(ts._seconds * 1000).toLocaleString();
    }
  }
  return "N/A";
};

export const AuditLogsAdmin: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await apiGet<{ success?: boolean; logs?: AuditLog[] }>("/api/v1/admin/audit-logs?limit=100");
        if (res && res.success) {
          setLogs(res.logs || []);
        }
      } catch (err: unknown) {
        console.error("Error fetching audit logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const columns = [
    {
      header: t("Action"),
      accessor: (log: AuditLog) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal">
          {log.action || "N/A"}
        </span>
      ),
      className: "whitespace-nowrap"
    },
    {
      header: t("Détails"),
      accessor: (log: AuditLog) => {
        const detailsString = log.details ? (typeof log.details === "string" ? log.details : JSON.stringify(log.details)) : "-";
        return (
          <div className="max-w-md truncate text-sm text-zinc-600 font-medium" title={detailsString}>
            {detailsString}
          </div>
        );
      }
    },
    {
      header: t("Auteur (Admin)"),
      accessor: (log: AuditLog) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <User className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-bold text-zinc-700 text-sm">{log.adminEmail || log.adminId || "Inconnu"}</span>
        </div>
      ),
      className: "border-l border-zinc-50"
    },
    {
      header: t("Horodatage"),
      accessor: (log: AuditLog) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap text-zinc-500 text-xs font-medium">
          <Clock className="w-3.5 h-3.5" />
          {formatAuditTimestamp(log.timestamp || log.createdAt)}
        </div>
      ),
      className: "border-l border-zinc-50 text-end"
    }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title={t("Journaux d'Audit & Sécurité")}
        subtitle={t("Historique des modifications du système.")}
      />
      <AdminDataTable<AuditLog> 
        data={logs}
        columns={columns}
        keyExtractor={(item) => item.id || ""}
        isLoading={loading}
        emptyState={
          <div className="p-12 text-center text-zinc-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-zinc-300 opacity-50" />
            <p className="font-medium">{t("Aucun journal d'audit enregistré.")}</p>
          </div>
        }
      />
    </div>
  );
};
