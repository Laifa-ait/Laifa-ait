import React, { useState } from "react";
import { User, Phone, Check, RefreshCw, Sparkles } from "lucide-react";
import { updateUserProfile, getCurrentAuthUser } from "../../services/auth.service";
import { toast } from "react-hot-toast";
import { RETRO_AVATARS, getRetroAvatar } from "../../utils/avatar";
import { useTranslation } from "react-i18next";
import { apiPost } from "../../lib/api";
import { OptimizedImage } from "../ui/OptimizedImage";
import { UserProfile, AuthUser as FirebaseUser } from "../../domains/user/user.types";

interface ProfileSettingsProps {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentUser, userProfile }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(userProfile?.displayName || currentUser?.displayName || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const defaultAvatar = getRetroAvatar(currentUser?.email || currentUser?.uid);
  const rawPhoto = userProfile?.photoURL || currentUser?.photoURL;
  const safeInitialPhoto = (rawPhoto && !rawPhoto.startsWith("data:") && rawPhoto.length <= 500) ? rawPhoto : defaultAvatar;
  const [photoURL, setPhotoURL] = useState(safeInitialPhoto);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error(t("name_required", "Le nom d'utilisateur est obligatoire."));
    const fbUser = getCurrentAuthUser();
    if (!fbUser) return toast.error(t("not_connected", "Utilisateur non connecté."));

    setSaving(true);
    try {
      // 1. Update main Firebase auth Profile
      await updateUserProfile(fbUser, {
        displayName: name,
        photoURL: photoURL,
      });

      // 2. Synchronize in Firestore Users database
      await apiPost("/api/v1/auth/profile", {
        name: name,
        phone: phone,
        photoURL: photoURL,
      });

      toast.success(t("profile_updated", "Profil mis à jour avec succès !"));
    } catch (err: unknown) {
      console.error("Profile updates failed:", err);
      const msg = err instanceof Error ? err.message : t("update_failed", "Impossible de mettre à jour votre profil.");
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8" id="profile-settings-module">
      <div>
        <h3 className="font-bold text-xl sm:text-2xl text-zinc-900 tracking-tight rtl:tracking-normal">
          {t("account_settings", "Paramètres du Compte")}
        </h3>
        <p className="text-zinc-500 text-xs sm:text-sm mt-1">
          {t("account_settings_desc", "Ajustez vos informations d'identité et de communication.")}
        </p>
      </div>

      <form
        onSubmit={handleSaveProfile}
        className="bg-white border border-zinc-200/80 rounded-3xl p-5 sm:p-8 space-y-7 sm:space-y-8 shadow-xs"
      >
        {/* Avatar Selectors */}
        <div className="space-y-4">
          <label className="text-xs sm:text-sm font-bold text-zinc-800 tracking-tight block">
            {t("choose_your_avatar", "Choisissez votre avatar")}
          </label>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-zinc-50/70 p-5 rounded-2xl border border-zinc-100">
            {/* Main Selected Avatar Preview */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-3 border-orange-500 shadow-md p-1 bg-white">
                <OptimizedImage
                  src={photoURL || defaultAvatar}
                  alt={t("current avatar") || "current avatar"}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                <span className="px-2.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-xs uppercase tracking-wider">
                  {t("active", "Actif")}
                </span>
              </div>
            </div>

            {/* Avatar Gallery Options */}
            <div className="flex-1 w-full space-y-3 text-center sm:text-left rtl:sm:text-right">
              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-2.5 pt-1">
                {RETRO_AVATARS.map((src, idx) => {
                  const isSelected = photoURL === src;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoURL(src)}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all p-0.5 bg-white cursor-pointer ${
                        isSelected
                          ? "border-orange-500 ring-3 ring-orange-500/25 scale-95 shadow-sm"
                          : "border-zinc-200 hover:border-orange-300 hover:scale-105"
                      }`}
                    >
                      <OptimizedImage
                        src={src}
                        alt={`Avatar ${idx + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-orange-500/20 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                          <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
          <div className="space-y-2">
            <label className="text-[11px] sm:text-xs font-bold text-zinc-600 uppercase tracking-wider rtl:tracking-normal block">
              {t("full_name", "Nom complet")}
            </label>
            <div className="relative">
              <User className="absolute start-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full ps-11 pe-4 py-3.5 bg-zinc-50/50 border border-zinc-200 rounded-2xl outline-none font-semibold text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all text-zinc-800"
                placeholder={t("placeholder_name", "Ex: Selma Laifa")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] sm:text-xs font-bold text-zinc-600 uppercase tracking-wider rtl:tracking-normal block font-sans">
              {t("phone_number", "Numéro de téléphone")}
            </label>
            <div className="relative">
              <Phone className="absolute start-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full ps-11 pe-4 py-3.5 bg-zinc-50/50 border border-zinc-200 rounded-2xl outline-none font-semibold text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all text-zinc-800"
                placeholder={t("placeholder_phone", "Ex: 0550 12 34 56")}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-3 sm:pt-4 border-t border-zinc-100">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-zinc-950 to-zinc-900 hover:from-orange-600 hover:to-orange-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rtl:tracking-normal rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50 min-h-[46px] cursor-pointer border-none"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-orange-400" />
            )}
            <span>{saving ? t("saving", "Sauvegarde...") : t("save_changes", "Sauvegarder les modifications")}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
