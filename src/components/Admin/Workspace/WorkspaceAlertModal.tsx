import React from "react";
import { CheckCircle2, XCircle, X, ExternalLink } from "lucide-react";

interface WorkspaceAlertModalProps {
  alert: {
    type: "success" | "error" | "info";
    title: string;
    message: string;
    link?: string;
    linkText?: string;
  };
  onClose: () => void;
}

export const WorkspaceAlertModal: React.FC<WorkspaceAlertModalProps> = ({ alert, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-zinc-100 shadow-2xl space-y-5 text-start relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-2 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          {alert.type === "success" ? (
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          )}
          <div>
            <h3 className="text-base font-sans font-bold text-zinc-900 leading-tight">
              {alert.title}
            </h3>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-zinc-400">
              {alert.type === "success" ? "Notification Workspace" : "Alerte Système"}
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed font-medium">
          {alert.message}
        </p>

        {alert.link && (
          <a
            href={alert.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
          >
            <span>{alert.linkText || "Ouvrir le lien"}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
