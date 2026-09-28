import React, { useState } from "react";
import { X, Check, RefreshCw, User, Phone, Calendar, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProfilePhotoModal } from "./ProfilePhotoModal";

export type ProfileEditField = "photo" | "name" | "nickname" | "birthday" | "gender" | "phone" | "about";

interface ProfileEditDialogProps {
  field: ProfileEditField | null;
  onClose: () => void;
  onSave: (data: Record<string, string>) => Promise<void>;
  initialData: {
    name: string;
    nickname: string;
    birthDate: string;
    gender: string;
    phone: string;
    photoURL: string;
    bio: string;
  };
}

export const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({
  field,
  onClose,
  onSave,
  initialData,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(initialData.name);
  const [nickname, setNickname] = useState(initialData.nickname);
  const [birthDate, setBirthDate] = useState(initialData.birthDate);
  const [gender, setGender] = useState(initialData.gender || "unspecified");
  const [phone, setPhone] = useState(initialData.phone);
  const [photoURL, setPhotoURL] = useState(initialData.photoURL);
  const [bio, setBio] = useState(initialData.bio);
  const [saving, setSaving] = useState(false);

  if (!field) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (field === "photo") await onSave({ photoURL });
      else if (field === "name") await onSave({ displayName: name, name });
      else if (field === "nickname") await onSave({ nickname });
      else if (field === "birthday") await onSave({ birthDate });
      else if (field === "gender") await onSave({ gender });
      else if (field === "phone") await onSave({ phone });
      else if (field === "about") await onSave({ bio });
      onClose();
    } catch {
      // Handled in parent
    } finally {
      setSaving(false);
    }
  };

  const getTitle = () => {
    switch (field) {
      case "photo": return t("Photo de profil");
      case "name": return t("Nom");
      case "nickname": return t("Surnom / Pseudonyme");
      case "birthday": return t("Date de naissance");
      case "gender": return t("Genre");
      case "phone": return t("Numéro de téléphone");
      case "about": return t("À propos de vous");
      default: return t("Modifier le profil");
    }
  };

  const getHelpText = () => {
    switch (field) {
      case "photo": return t("Une photo permet de personnaliser votre profil sur Olmart.");
      case "name": return t("Ce nom sera visible par les vendeurs et sur vos commandes.");
      case "nickname": return t("Votre surnom ou pseudonyme peut être affiché sur vos avis de produits.");
      case "birthday": return t("Votre date de naissance permet de recevoir des offres d'anniversaire.");
      case "gender": return t("Cette information nous aide à personnaliser vos recommandations.");
      case "phone": return t("Utilisé pour la confirmation par SMS et le suivi de vos colis par le livreur.");
      case "about": return t("Décrivez vos préférences ou centres d'intérêt d'achat.");
      default: return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[28px] max-w-lg w-full border border-[#dadce0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f3f4]">
          <h3 className="text-base sm:text-lg font-semibold text-[#202124]">{getTitle()}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4] transition-colors cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed">{getHelpText()}</p>

          {field === "photo" && (
            <ProfilePhotoModal currentPhoto={photoURL} onSelect={(url) => setPhotoURL(url)} />
          )}

          {field === "name" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#5f6368] block">{t("Nom complet")}</label>
              <div className="relative">
                <User className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#5f6368]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("Ex: Selma Laifa")}
                  className="w-full ps-10 pe-4 py-2.5 bg-white border border-[#dadce0] rounded-xl text-sm font-medium outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 text-[#202124]"
                />
              </div>
            </div>
          )}

          {field === "nickname" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#5f6368] block">{t("Surnom / Pseudonyme")}</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t("Ex: Selma")}
                className="w-full px-4 py-2.5 bg-white border border-[#dadce0] rounded-xl text-sm font-medium outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 text-[#202124]"
              />
            </div>
          )}

          {field === "birthday" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#5f6368] block">{t("Date de naissance")}</label>
              <div className="relative">
                <Calendar className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#5f6368]" />
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full ps-10 pe-4 py-2.5 bg-white border border-[#dadce0] rounded-xl text-sm font-medium outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 text-[#202124]"
                />
              </div>
            </div>
          )}

          {field === "gender" && (
            <div className="space-y-2.5">
              {[
                { id: "female", label: t("Femme") },
                { id: "male", label: t("Homme") },
                { id: "custom", label: t("Personnalisé") },
                { id: "unspecified", label: t("Je ne souhaite pas l'indiquer") },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#dadce0] hover:bg-[#f8fafd] cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="gender-option"
                    checked={gender === opt.id}
                    onChange={() => setGender(opt.id)}
                    className="w-4 h-4 text-[#1a73e8] accent-[#1a73e8]"
                  />
                  <span className="text-sm font-medium text-[#202124]">{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {field === "phone" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#5f6368] block">{t("Numéro de téléphone")}</label>
              <div className="relative">
                <Phone className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#5f6368]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0550 12 34 56"
                  className="w-full ps-10 pe-4 py-2.5 bg-white border border-[#dadce0] rounded-xl text-sm font-medium outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 text-[#202124]"
                />
              </div>
            </div>
          )}

          {field === "about" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#5f6368] block">{t("Biographie & Intérêts")}</label>
              <div className="relative">
                <FileText className="absolute start-3.5 top-3 w-4.5 h-4.5 text-[#5f6368]" />
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t("Partagez vos préférences, marques favorites ou détails utiles...")}
                  className="w-full ps-10 pe-4 py-2.5 bg-white border border-[#dadce0] rounded-xl text-sm font-medium outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 text-[#202124] resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f3f4]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-[#1a73e8] hover:bg-[#1a73e8]/10 rounded-full transition-colors cursor-pointer border-none bg-transparent"
            >
              {t("Annuler")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium rounded-full shadow-xs transition-colors cursor-pointer disabled:opacity-50 border-none"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{saving ? t("Enregistrement...") : t("Enregistrer")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
