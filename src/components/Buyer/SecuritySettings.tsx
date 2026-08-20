import React, { useState } from "react";
import { ShieldCheck, Mail, Key, Eye, EyeOff } from "lucide-react";
import {
  User,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword as firebaseUpdatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { apiPost } from "../../lib/api";
import { ReauthSecurityModal } from "./security/ReauthSecurityModal";

interface SecuritySettingsProps {
  currentUser: User | null;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ currentUser }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState(currentUser?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassToggle, setShowPassToggle] = useState(false);
  const [loading, setLoading] = useState(false);

  // Re-auth Modal control state
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [reauthAction, setReauthAction] = useState<"email" | "password" | null>(null);

  const triggerEmailUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || email === currentUser?.email) {
      return toast.error("Veuillez entrer une nouvelle adresse e-mail différente.");
    }
    setReauthAction("email");
    setCurrentPassword("");
    setShowReauthModal(true);
  };

  const triggerPasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return toast.error("Le mot de passe doit mesurer au moins 6 caractères.");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Les mots de passe ne correspondent pas.");
    }
    setReauthAction("password");
    setCurrentPassword("");
    setShowReauthModal(true);
  };

  const executeReauthenticatedAction = async () => {
    if (!currentUser || !currentUser.email) {
      return toast.error("Utilisateur non connecté.");
    }
    if (!currentPassword.trim()) {
      return toast.error("Veuillez saisir votre mot de passe actuel.");
    }

    setLoading(true);
    try {
      // 1. Establish Credentials
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);

      // 2. Perform Re-authentication
      await reauthenticateWithCredential(currentUser, credential);

      // 3. Execute main mutation based on selected flow
      if (reauthAction === "email") {
        // Safe update with state-of-the-art verification flow
        await verifyBeforeUpdateEmail(currentUser, email);

        // Update user Firestore document too
        await apiPost("/api/v1/auth/profile", {
          email: email,
        });

        toast.success("E-mail de vérification envoyé à la nouvelle adresse ! Veuillez vérifier votre boîte mail.");
        setShowReauthModal(false);
      } else if (reauthAction === "password") {
        await firebaseUpdatePassword(currentUser, newPassword);
        toast.success("Mot de passe mis à jour avec succès !");
        setNewPassword("");
        setConfirmPassword("");
        setShowReauthModal(false);
      }
    } catch (err: unknown) {
      console.error("Re-authentication fail:", err);
      const authError = err as { code?: string; message?: string };
      if (authError.code === "auth/wrong-password" || authError.code === "auth/invalid-credential") {
        toast.error("Mot de passe actuel incorrect.");
      } else {
        toast.error(authError.message || "Erreur lors de la sécurisation.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8" id="security-settings-module">
      <div>
        <h3 className="font-sans font-bold text-xl text-slate-900 tracking-tight rtl:tracking-normal">
          {t("Configuration de Sécurité")}
        </h3>
        <p className="text-slate-500 text-xs rtl:text-sm font-medium">
          {t("Gérez vos accès et sécurisez votre connexion d'e-commerce.")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Email Form */}
        <form
          onSubmit={triggerEmailUpdate}
          className="bg-white border border-slate-100 p-8 rounded-3xl space-y-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Mail className="w-4 h-4" />
            </div>
            <h4 className="font-sans font-bold text-xs rtl:text-sm uppercase tracking-wider rtl:tracking-normal text-slate-900">
              {t("Adresse de Connexion")}
            </h4>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] rtl:text-[12px] font-bold text-slate-400 uppercase tracking-wider rtl:tracking-normal">
              {t("Adresse E-mail actuelle et valide")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 bg-transparent border border-slate-100 rounded-2xl font-bold text-xs rtl:text-sm outline-none focus:bg-white focus:border-slate-500 transition-all text-slate-700"
              placeholder={t("Ex: abc@gmail.com") || "Ex: abc@gmail.com"}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-sans font-bold text-[10px] rtl:text-[12px] uppercase tracking-widest rtl:tracking-normal transition-all focus:scale-95 text-center min-h-[44px]"
            >
              {t("Mettre à jour l'e-mail")}
            </button>
          </div>
        </form>

        {/* Password Form */}
        <form
          onSubmit={triggerPasswordUpdate}
          className="bg-white border border-slate-100 p-8 rounded-3xl space-y-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-transparent flex items-center justify-center text-slate-600">
              <Key className="w-4 h-4" />
            </div>
            <h4 className="font-sans font-bold text-xs rtl:text-sm uppercase tracking-wider rtl:tracking-normal text-slate-900">
              {t("Changer de Mot de passe")}
            </h4>
          </div>

          <div className="space-y-4">
            <div className="space-y-2 relative">
              <label className="text-[10px] rtl:text-[12px] font-bold text-slate-400 uppercase tracking-wider rtl:tracking-normal">
                {t("Nouveau Mot de passe")}
              </label>
              <input
                type={showPassToggle ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-5 py-3.5 bg-transparent border border-slate-100 rounded-2xl font-bold text-xs rtl:text-sm outline-none focus:bg-white focus:border-slate-500 transition-all text-slate-700"
                placeholder={t("Minimum 6 caractères") || "Minimum 6 caractères"}
              />
              <button
                type="button"
                onClick={() => setShowPassToggle(!showPassToggle)}
                className="absolute end-4 top-[38px] text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassToggle ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] rtl:text-[12px] font-bold text-slate-400 uppercase tracking-wider rtl:tracking-normal font-sans">
                {t("Confirmer le Mot de passe")}
              </label>
              <input
                type={showPassToggle ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-5 py-3.5 bg-transparent border border-slate-100 rounded-2xl font-bold text-xs rtl:text-sm outline-none focus:bg-white focus:border-slate-500 transition-all text-slate-700"
                placeholder={t("Répétez le nouveau mot de passe") || "Répétez le nouveau mot de passe"}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-sans font-bold text-[10px] rtl:text-[12px] uppercase tracking-widest rtl:tracking-normal transition-all focus:scale-95 text-center min-h-[44px]"
            >
              {t("Changer mon mot de passe")}
            </button>
          </div>
        </form>
      </div>

      {/* Re-Authentication Verification Modal (CRITICAL ARCHITECTURE REQUIREMENT) */}
      <ReauthSecurityModal
        isOpen={showReauthModal}
        onClose={() => {
          setShowReauthModal(false);
          setReauthAction(null);
        }}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        onConfirm={executeReauthenticatedAction}
        loading={loading}
      />
    </div>
  );
};
