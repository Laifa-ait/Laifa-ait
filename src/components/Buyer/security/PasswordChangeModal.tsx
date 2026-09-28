import React, { useState } from "react";
import { X, Key, Eye, EyeOff, Check, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  getCurrentAuthUser,
  reauthenticateUser,
  updateUserPassword,
  sendPasswordReset,
} from "../../../services/auth.service";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
  userEmail,
}) => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSending, setResetSending] = useState(false);

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      return toast.error(t("Veuillez saisir votre mot de passe actuel."));
    }
    if (newPassword.length < 6) {
      return toast.error(t("Le nouveau mot de passe doit comporter au moins 6 caractères."));
    }
    if (newPassword !== confirmPassword) {
      return toast.error(t("Les deux mots de passe ne correspondent pas."));
    }

    const fbUser = getCurrentAuthUser();
    if (!fbUser) return toast.error(t("Utilisateur non connecté."));

    setLoading(true);
    try {
      // 1. Reauthenticate against Firebase Auth storage
      await reauthenticateUser(fbUser, currentPassword);

      // 2. Real password update in Firebase Authentication
      await updateUserPassword(fbUser, newPassword);

      toast.success(t("Votre mot de passe a été modifié avec succès dans Firebase !"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err: unknown) {
      console.error("Password update error:", err);
      const authErr = err as { code?: string; message?: string };
      if (
        authErr.code === "auth/wrong-password" ||
        authErr.code === "auth/invalid-credential"
      ) {
        toast.error(t("Mot de passe actuel incorrect."));
      } else if (authErr.code === "auth/weak-password") {
        toast.error(t("Le mot de passe choisi est trop faible."));
      } else {
        toast.error(authErr.message || t("Impossible de modifier le mot de passe."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!userEmail) return toast.error(t("Adresse email non disponible."));
    setResetSending(true);
    try {
      await sendPasswordReset(userEmail);
      toast.success(
        t("Un email de réinitialisation sécurisé a été envoyé à votre adresse : ") + userEmail
      );
    } catch (err) {
      console.error("Password reset error:", err);
      toast.error(t("Impossible d'envoyer l'email de réinitialisation."));
    } finally {
      setResetSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[28px] max-w-md w-full border border-[#dadce0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f3f4]">
          <h3 className="text-base sm:text-lg font-semibold text-[#202124]">
            {t("Modifier le mot de passe")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4] transition-colors cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handlePasswordSubmit} className="p-6 overflow-y-auto space-y-4 text-left">
          <p className="text-xs text-[#5f6368] leading-relaxed">
            {t(
              "Choisissez un mot de passe robuste d'au moins 6 caractères contenant lettres, chiffres et symboles pour sécuriser votre compte."
            )}
          </p>

          {/* Current Password */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#5f6368] block">
              {t("Mot de passe actuel")}
            </label>
            <div className="relative">
              <Key className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f6368]" />
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full ps-9 pe-10 py-2.5 bg-white border border-[#dadce0] rounded-xl text-sm outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 text-[#202124]"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[#5f6368] hover:text-[#202124] border-none bg-transparent cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#5f6368] block">
              {t("Nouveau mot de passe")}
            </label>
            <div className="relative">
              <Key className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f6368]" />
              <input
                type={showNew ? "text" : "password"}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full ps-9 pe-10 py-2.5 bg-white border border-[#dadce0] rounded-xl text-sm outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 text-[#202124]"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[#5f6368] hover:text-[#202124] border-none bg-transparent cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#5f6368] block">
              {t("Confirmer le nouveau mot de passe")}
            </label>
            <div className="relative">
              <Key className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f6368]" />
              <input
                type={showNew ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full ps-9 pe-3 py-2.5 bg-white border border-[#dadce0] rounded-xl text-sm outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 text-[#202124]"
              />
            </div>
          </div>

          {/* Forgot password reset link */}
          <div className="pt-1">
            <button
              type="button"
              disabled={resetSending}
              onClick={handleForgotPassword}
              className="text-xs font-medium text-[#1a73e8] hover:underline cursor-pointer border-none bg-transparent p-0 disabled:opacity-50"
            >
              {resetSending
                ? t("Envoi en cours...")
                : t("Mot de passe actuel oublié ? Envoyer un email de réinitialisation")}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f3f4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#1a73e8] hover:bg-[#1a73e8]/10 rounded-full transition-colors cursor-pointer border-none bg-transparent"
            >
              {t("Annuler")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium rounded-full shadow-xs transition-colors cursor-pointer disabled:opacity-50 border-none"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{loading ? t("Mise à jour...") : t("Modifier le mot de passe")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
