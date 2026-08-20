import React from "react";
import { X, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ReauthSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPassword: string;
  setCurrentPassword: (password: string) => void;
  onConfirm: () => void;
  loading: boolean;
}

export const ReauthSecurityModal: React.FC<ReauthSecurityModalProps> = ({
  isOpen,
  onClose,
  currentPassword,
  setCurrentPassword,
  onConfirm,
  loading,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-[2rem] border border-slate-150 p-8 max-w-md w-full relative shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute end-6 top-6 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-transparent transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 animate-bounce" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-900 tracking-tight rtl:tracking-normal">
            {t("Vérification de Sécurité")}
          </h3>
          <p className="text-slate-500 text-xs rtl:text-sm">
            {t(
              "Par mesure de sécurité hautement requise par Olma, veuillez confirmer votre mot de passe de connexion actuel avant de modifier vos informations d'identité sensibles."
            )}
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-[10px] rtl:text-[12px] font-sans font-bold text-slate-400 uppercase tracking-widest rtl:tracking-normal block leading-none">
              {t("Votre mot de passe actuel")}
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-5 py-4 bg-transparent border border-slate-200 rounded-xl font-bold text-xs rtl:text-sm outline-none focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all"
              placeholder={t("Saisissez votre mot de passe actuel") || "Saisissez votre mot de passe actuel"}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border border-slate-200 text-slate-700 font-extrabold text-[10px] rtl:text-[12px] uppercase tracking-widest rtl:tracking-normal rounded-xl hover:bg-transparent active:scale-95 transition-all text-center"
            >
              {t("Annuler")}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] rtl:text-[12px] uppercase tracking-widest rtl:tracking-normal rounded-xl disabled:opacity-50 active:scale-95 transition-all text-center"
            >
              {loading ? t("security.verifying", "Vérification...") : t("security.confirm", "Confirmer")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
