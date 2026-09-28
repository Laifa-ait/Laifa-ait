import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { AuthUser as User, UserProfile } from "../../domains/user/user.types";
import { apiPost } from "../../lib/api";
import { PasswordChangeModal } from "./security/PasswordChangeModal";
import { SecurityCards } from "./security/SecurityCards";
import { ProfileEditDialog, ProfileEditField } from "./ProfileEditDialog";

interface SecuritySettingsProps {
  currentUser: User | null;
  userProfile?: UserProfile | null;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ currentUser, userProfile = null }) => {
  const { t } = useTranslation();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [activeProfileField, setActiveProfileField] = useState<ProfileEditField | null>(null);

  const handleSaveContactField = async (data: Record<string, string>) => {
    try {
      await apiPost("/api/v1/auth/profile", data);
      toast.success(t("Informations de sécurité mises à jour avec succès."));
    } catch (err: unknown) {
      console.error("Failed to update contact:", err);
      toast.error(t("Erreur lors de la mise à jour des coordonnées."));
      throw err;
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto" id="security-settings-module">
      {/* Google Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-normal text-[#202124] tracking-tight">
          {t("Confidentialité et sécurité")}
        </h2>
        <p className="text-[#5f6368] text-sm mt-1">
          {t("Paramètres et recommandations pour renforcer la protection de votre compte Olmart.")}
        </p>
      </div>

      {/* Security Cards (Google Account Style) */}
      <SecurityCards
        currentUser={currentUser}
        userProfile={userProfile}
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
        onOpenEmailModal={() => toast(t("L'adresse email est votre identifiant principal Firebase vérifié."))}
        onOpenPhoneModal={() => setActiveProfileField("phone")}
      />

      {/* Real Firebase Password Change Dialog */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        userEmail={currentUser?.email || null}
      />

      {/* Phone / Contact Edit Dialog */}
      <ProfileEditDialog
        field={activeProfileField}
        onClose={() => setActiveProfileField(null)}
        onSave={handleSaveContactField}
        initialData={{
          name: userProfile?.displayName || currentUser?.displayName || "",
          nickname: (userProfile?.nickname as string) || "",
          birthDate: (userProfile?.birthDate as string) || "",
          gender: (userProfile?.gender as string) || "unspecified",
          phone: userProfile?.phone || (currentUser?.phoneNumber as string) || "",
          photoURL: userProfile?.photoURL || currentUser?.photoURL || "",
          bio: (userProfile?.bio as string) || "",
        }}
      />
    </div>
  );
};
