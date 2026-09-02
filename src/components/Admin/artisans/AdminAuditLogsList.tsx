import React from 'react';
import { History, Shield, User, Info } from 'lucide-react';
import { ArtisanAdminAuditLog } from '../../../types/artisan';

interface AdminAuditLogsListProps {
  auditLogs: ArtisanAdminAuditLog[];
}

export const AdminAuditLogsList: React.FC<AdminAuditLogsListProps> = ({ auditLogs }) => {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
        <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-500 font-medium text-sm">Aucun journal d'audit enregistré pour le moment.</p>
      </div>
    );
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve':
        return 'bg-emerald-100 text-emerald-800';
      case 'reject':
      case 'block':
        return 'bg-red-100 text-red-800';
      case 'suspend':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-600" />
          <span>Historique des actions Administrateurs</span>
        </h3>
        <span className="text-xs text-slate-500 font-mono font-bold">{auditLogs.length} entrées</span>
      </div>

      <div className="divide-y divide-slate-100">
        {auditLogs.map((log) => (
          <div key={log.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0 mt-0.5">
              <User className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-xs">{log.adminEmail || log.adminUid}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${getActionColor(log.action)}`}>
                  {log.action}
                </span>
                <span className="text-[11px] text-slate-400 font-mono ml-auto">
                  {new Date(log.timestamp).toLocaleString('fr-FR')}
                </span>
              </div>

              <p className="text-xs text-slate-700 font-medium mt-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{log.details}</span>
              </p>

              {log.targetName && (
                <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                  Cible : {log.targetName} ({log.targetType})
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
