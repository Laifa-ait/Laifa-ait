import React from 'react';
import { ArtisanAdminAuditLog } from '../../../types/artisan';

interface AdminAuditLogsListProps {
  auditLogs: ArtisanAdminAuditLog[];
}

export const AdminAuditLogsList: React.FC<AdminAuditLogsListProps> = ({ auditLogs }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-slate-900">Historique des Actions de Modération</h2>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {auditLogs.length > 0 ? (
          auditLogs.map((log) => (
            <div key={log.id} className="p-4 flex items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">
                  <span className="text-amber-600 font-black">{log.action}</span> sur l'artisan{' '}
                  <span className="font-mono text-slate-700">{log.artisanId}</span>
                </p>
                <p className="text-slate-500">{log.details}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-slate-700">{log.adminEmail}</p>
                <p className="text-[10px] text-slate-400">
                  {new Date(log.timestamp).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-400 italic text-xs">
            Aucun log d'audit pour le moment
          </div>
        )}
      </div>
    </div>
  );
};
