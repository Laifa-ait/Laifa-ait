import React from "react";
import { Video, Loader2, X, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SellerMetadata } from "../hooks/useWorkspaceActions";

interface WorkspaceInputMeetModalProps {
  meetEmail: string;
  setMeetEmail: (email: string) => void;
  meetSearchTerm: string;
  setMeetSearchTerm: (term: string) => void;
  selectedMeetEmails: string[];
  onToggleMeetEmail: (email: string) => void;
  filteredMeetSellers: SellerMetadata[];
  loadingMeet: boolean;
  onClose: () => void;
  onConfirmMeetSchedule: () => void;
}

export const WorkspaceInputMeetModal: React.FC<WorkspaceInputMeetModalProps> = ({
  meetEmail,
  setMeetEmail,
  meetSearchTerm,
  setMeetSearchTerm,
  selectedMeetEmails,
  onToggleMeetEmail,
  filteredMeetSellers,
  loadingMeet,
  onClose,
  onConfirmMeetSchedule,
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-zinc-100 shadow-2xl space-y-6 text-start relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-2 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Video className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-sans font-bold text-zinc-900 leading-tight">
              {t("Planifier une Session Google Meet")}
            </h3>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-zinc-400">
              {t("Visioconférence & Audits Artisans")}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide mb-1.5">
              {t("Saisir un e-mail individuel :")}
            </label>
            <input
              type="email"
              value={meetEmail}
              onChange={(e) => setMeetEmail(e.target.value)}
              placeholder="artisan@domain.dz"
              className="w-full text-xs px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-blue-500 font-bold"
            />
          </div>

          <div className="border-t border-zinc-100 pt-3 space-y-2">
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide">
              {t("Ou sélectionner parmi les vendeurs inscrits :")}
            </label>
            <input
              type="text"
              value={meetSearchTerm}
              onChange={(e) => setMeetSearchTerm(e.target.value)}
              placeholder={t("Rechercher un vendeur ou e-mail...")}
              className="w-full text-xs px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-blue-500 font-medium"
            />

            <div className="max-h-40 overflow-y-auto pr-1 divide-y divide-zinc-100 border border-zinc-100 rounded-2xl">
              {filteredMeetSellers.length === 0 ? (
                <div className="p-3 text-[11px] text-zinc-400 text-center font-bold">
                  {t("Aucun e-mail vendeur trouvé.")}
                </div>
              ) : (
                filteredMeetSellers.map((s) => {
                  const isSelected = selectedMeetEmails.includes(s.email!);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onToggleMeetEmail(s.email!)}
                      className={`w-full p-2.5 flex items-center justify-between text-start text-xs font-medium cursor-pointer ${
                        isSelected ? "bg-blue-50/60" : "hover:bg-zinc-50"
                      }`}
                    >
                      <div>
                        <span className="font-bold text-zinc-800 block">{s.shopName || s.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono block">{s.email}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
          >
            {t("Annuler")}
          </button>
          <button
            onClick={onConfirmMeetSchedule}
            disabled={loadingMeet}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loadingMeet ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Video className="w-4 h-4" />
            )}
            <span>{t("Créer l'invitation")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
