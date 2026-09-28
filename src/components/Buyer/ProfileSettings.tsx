import React, { useState } from "react";
import { Camera, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { updateUserProfile, getCurrentAuthUser } from "../../services/auth.service";
import { apiPost } from "../../lib/api";
import { OptimizedImage } from "../ui/OptimizedImage";
import { getRetroAvatar } from "../../utils/avatar";
import { UserProfile, AuthUser as FirebaseUser } from "../../domains/user/user.types";
import { ProfileEditDialog, ProfileEditField } from "./ProfileEditDialog";
import { ProfileCards } from "./ProfileCards";

interface ProfileSettingsProps {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentUser, userProfile }) => {
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState<ProfileEditField | null>(null);

  const defaultAvatar = getRetroAvatar(currentUser?.email || currentUser?.uid);
  const rawPhoto = userProfile?.photoURL || currentUser?.photoURL;
  const currentPhoto =
    rawPhoto && !rawPhoto.startsWith("data:") && rawPhoto.length <= 500 ? rawPhoto : defaultAvatar;

  const [name, setName] = useState(userProfile?.displayName || currentUser?.displayName || "");
  const [nickname, setNickname] = useState((userProfile?.nickname as string) || "");
  const [birthDate, setBirthDate] = useState((userProfile?.birthDate as string) || "");
  const [gender, setGender] = useState((userProfile?.gender as string) || "unspecified");
  const [phone, setPhone] = useState(userProfile?.phone || (currentUser?.phoneNumber as string) || "");
  const [photoURL, setPhotoURL] = useState(currentPhoto);
  const [bio, setBio] = useState((userProfile?.bio as string) || "");

  const handleSaveField = async (updatedData: Record<string, string>) => {
    const fbUser = getCurrentAuthUser();
    if (!fbUser) throw new Error(t("not_connected", "Utilisateur non connecté."));

    try {
      if (updatedData.displayName || updatedData.photoURL) {
        await updateUserProfile(fbUser, {
          displayName: updatedData.displayName || name,
          photoURL: updatedData.photoURL || photoURL,
        });
      }

      await apiPost("/api/v1/auth/profile", updatedData);

      if (updatedData.name || updatedData.displayName) setName(updatedData.name || updatedData.displayName);
      if (updatedData.nickname !== undefined) setNickname(updatedData.nickname);
      if (updatedData.birthDate !== undefined) setBirthDate(updatedData.birthDate);
      if (updatedData.gender !== undefined) setGender(updatedData.gender);
      if (updatedData.phone !== undefined) setPhone(updatedData.phone);
      if (updatedData.photoURL !== undefined) setPhotoURL(updatedData.photoURL);
      if (updatedData.bio !== undefined) setBio(updatedData.bio);

      toast.success(t("profile_updated", "Informations mises à jour avec succès."));
    } catch (err: unknown) {
      console.error("Profile updates failed:", err);
      const msg =
        err instanceof Error ? err.message : t("update_failed", "Impossible de mettre à jour votre profil.");
      toast.error(msg);
      throw err;
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto" id="profile-settings-module">
      <div>
        <h2 className="text-2xl sm:text-3xl font-normal text-[#202124] tracking-tight">
          {t("Informations personnelles")}
        </h2>
        <p className="text-[#5f6368] text-sm mt-1">
          {t("Informations relatives à votre profil et vos préférences dans les services Olmart.")}
        </p>
      </div>

      <div className="bg-white border border-[#dadce0] rounded-[24px] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xs">
        <div className="relative group cursor-pointer" onClick={() => setActiveModal("photo")}>
          <div className="w-24 h-24 rounded-full overflow-hidden border border-[#dadce0] p-0.5 bg-white shadow-xs">
            <OptimizedImage
              src={photoURL}
              alt="Photo de profil"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <Camera className="w-4 h-4" />
          </div>
        </div>

        <div className="text-center sm:text-left flex-1 space-y-1">
          <h3 className="text-lg font-medium text-[#202124]">{name || t("Utilisateur Olmart")}</h3>
          <p className="text-sm text-[#5f6368]">{currentUser?.email}</p>
          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#e8f0fe] text-[#1a73e8]">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("Compte Acheteur Vérifié")}
            </span>
          </div>
        </div>
      </div>

      <ProfileCards
        photoURL={photoURL}
        name={name}
        nickname={nickname}
        birthDate={birthDate}
        gender={gender}
        email={currentUser?.email || null}
        phone={phone}
        bio={bio}
        onOpenField={(field) => setActiveModal(field)}
      />

      <ProfileEditDialog
        field={activeModal}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveField}
        initialData={{
          name,
          nickname,
          birthDate,
          gender,
          phone,
          photoURL,
          bio,
        }}
      />
    </div>
  );
};
