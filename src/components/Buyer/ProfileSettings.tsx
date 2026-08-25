import React, { useState } from "react";
import { User, Phone, Check, RefreshCw, Sparkles } from "lucide-react";
import { User as FirebaseUser, updateProfile } from "firebase/auth";
import { toast } from "react-hot-toast";
import { RETRO_AVATARS, getRetroAvatar } from "../../utils/avatar";
import { useTranslation } from "react-i18next";
import { apiPost } from "../../lib/api";
import { OptimizedImage } from "../ui/OptimizedImage";
import { UserProfile } from "../../domains/user/user.types";

interface ProfileSettingsProps {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentUser, userProfile }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(userProfile?.displayName || currentUser?.displayName || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const defaultAvatar = getRetroAvatar(currentUser?.email || currentUser?.uid);
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || currentUser?.photoURL || defaultAvatar);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Le nom d'utilisateur est obligatoire.");
    if (!currentUser) return toast.error("Utilisateur non connecté.");

    setSaving(true);
    try {
      // 1. Update main Firebase auth Profile
      await updateProfile(currentUser, {
        displayName: name,
        photoURL: photoURL,
      });

      // 2. Synchronize in Firestore Users database
      await apiPost("/api/v1/auth/profile", {
        name: name,
        phone: phone,
        photoURL: photoURL,
      });

      toast.success("Profil mis à jour avec succès !");
    } catch (err: unknown) {
      console.error("Profile updates failed:", err);
      const msg = err instanceof Error ? err.message : "Impossible de mettre à jour votre profil.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8" id="profile-settings-module">
      <div>
        <h3 className="font-bold text-xl text-slate-900 tracking-tight rtl:tracking-normal">
          {t("Paramètres du Compte")}
        </h3>
        <p className="text-slate-500 text-xs rtl:text-sm">
          {t("Ajustez vos informations d'identité et de communication.")}
        </p>
      </div>

      <form
        onSubmit={handleSaveProfile}
        className="bg-white border border-slate-100 rounded-3xl p-8 space-y-8 shadow-sm"
      >
        {/* Avatar Selectors */}
        <div className="space-y-4">
          <label className="text-[10px] rtl:text-[12px] font-bold text-slate-500 uppercase tracking-wider rtl:tracking-normal block leading-none">
            {t("Photo de profil / Avatar")}
          </label>
          <div className="flex flex-wrap items-center gap-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-slate-50 shadow-inner relative group shrink-0">
              <OptimizedImage
                src={photoURL || defaultAvatar}
                alt={t("current avatar") || "current avatar"}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-3 min-w-[200px]">
              <p className="text-xs rtl:text-sm text-slate-500 font-medium">
                {t("Sélectionnez l'un de nos avatars vintage Premium des années 60/70 faits main :")}
              </p>
              <div className="flex gap-3 flex-wrap">
                {RETRO_AVATARS.map((src, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoURL(src)}
                    className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all relative ${
                      photoURL === src
                        ? "border-slate-900 ring-4 ring-slate-100 scale-95"
                        : "border-transparent hover:scale-105"
                    }`}
                  >
                    <OptimizedImage
                      src={src}
                      alt="Avatar option"
                      className="w-full h-full object-cover"
                    />
                    {photoURL === src && (
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white font-heavy" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] rtl:text-[12px] font-bold text-slate-500 uppercase tracking-wider rtl:tracking-normal block leading-none">
              {t("Nom complet")}
            </label>
            <div className="relative">
              <User className="absolute start-5 top-1/2 -translate-y-1/2 w-4 py-1.5 h-auto text-slate-300 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full ps-12 pe-6 py-4 bg-transparent border border-slate-100 rounded-2xl outline-none font-bold text-xs rtl:text-sm focus:ring-4 focus:ring-slate-100 focus:bg-white transition-all text-slate-800"
                placeholder={t("Ex: Selma Laifa") || "Ex: Selma Laifa"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] rtl:text-[12px] font-bold text-slate-500 uppercase tracking-wider rtl:tracking-normal block leading-none font-sans">
              {t("Numéro de téléphone")}
            </label>
            <div className="relative">
              <Phone className="absolute start-5 top-1/2 -translate-y-1/2 w-4 py-1.5 h-auto text-slate-300 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full ps-12 pe-6 py-4 bg-transparent border border-slate-100 rounded-2xl outline-none font-bold text-xs rtl:text-sm focus:ring-4 focus:ring-slate-100 focus:bg-white transition-all text-slate-800"
                placeholder={t("Ex: 0550 12 34 56") || "Ex: 0550 12 34 56"}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-slate-50">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rtl:text-sm uppercase tracking-wider rtl:tracking-normal rounded-xl transition-all shadow-md shadow-slate-100 active:scale-95 disabled:opacity-50 min-h-[44px]"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-white" />
            )}
            {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
};
