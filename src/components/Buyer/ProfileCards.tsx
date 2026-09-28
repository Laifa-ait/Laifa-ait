import React from "react";
import { ChevronRight, ShieldCheck, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { OptimizedImage } from "../ui/OptimizedImage";
import { ProfileEditField } from "./ProfileEditDialog";

interface ProfileCardsProps {
  photoURL: string;
  name: string;
  nickname: string;
  birthDate: string;
  gender: string;
  email: string | null;
  phone: string;
  bio: string;
  onOpenField: (field: ProfileEditField) => void;
}

export const ProfileCards: React.FC<ProfileCardsProps> = ({
  photoURL,
  name,
  nickname,
  birthDate,
  gender,
  email,
  phone,
  bio,
  onOpenField,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getGenderLabel = (g: string) => {
    switch (g) {
      case "female": return t("Femme");
      case "male": return t("Homme");
      case "custom": return t("Personnalisé");
      default: return t("Non précisé");
    }
  };

  return (
    <div className="space-y-6">
      {/* Informations Générales Card */}
      <div className="bg-white border border-[#dadce0] rounded-[24px] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#f1f3f4]">
          <h3 className="text-base font-medium text-[#202124]">{t("Informations générales")}</h3>
          <p className="text-xs text-[#5f6368] mt-0.5">
            {t("Certaines informations peuvent être visibles par les autres utilisateurs.")}
          </p>
        </div>

        <div className="divide-y divide-[#f1f3f4]">
          <button
            type="button"
            onClick={() => onOpenField("photo")}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f8fafd] transition-colors text-left cursor-pointer border-none bg-transparent"
          >
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-medium text-[#5f6368] uppercase tracking-wider block">
                {t("Photo de profil")}
              </span>
              <p className="text-sm text-[#202124]">{t("Une photo permet de personnaliser votre compte")}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#dadce0]">
                <OptimizedImage src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <ChevronRight className="w-5 h-5 text-[#5f6368]" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onOpenField("name")}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f8fafd] transition-colors text-left cursor-pointer border-none bg-transparent"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-[#5f6368] uppercase tracking-wider block">
                {t("Nom")}
              </span>
              <p className="text-sm font-medium text-[#202124]">{name || t("Non défini")}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5f6368]" />
          </button>

          <button
            type="button"
            onClick={() => onOpenField("nickname")}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f8fafd] transition-colors text-left cursor-pointer border-none bg-transparent"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-[#5f6368] uppercase tracking-wider block">
                {t("Surnom / Pseudonyme")}
              </span>
              <p className="text-sm text-[#202124]">{nickname || t("Non défini")}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5f6368]" />
          </button>

          <button
            type="button"
            onClick={() => onOpenField("birthday")}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f8fafd] transition-colors text-left cursor-pointer border-none bg-transparent"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-[#5f6368] uppercase tracking-wider block">
                {t("Date de naissance")}
              </span>
              <p className="text-sm text-[#202124]">{birthDate || t("Non renseignée")}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5f6368]" />
          </button>

          <button
            type="button"
            onClick={() => onOpenField("gender")}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f8fafd] transition-colors text-left cursor-pointer border-none bg-transparent"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-[#5f6368] uppercase tracking-wider block">
                {t("Genre")}
              </span>
              <p className="text-sm text-[#202124]">{getGenderLabel(gender)}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5f6368]" />
          </button>
        </div>
      </div>

      {/* Coordonnées Card */}
      <div className="bg-white border border-[#dadce0] rounded-[24px] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#f1f3f4]">
          <h3 className="text-base font-medium text-[#202124]">{t("Coordonnées")}</h3>
          <p className="text-xs text-[#5f6368] mt-0.5">
            {t("Moyens de contact utilisés pour vos commandes et la sécurité.")}
          </p>
        </div>

        <div className="divide-y divide-[#f1f3f4]">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-[#5f6368] uppercase tracking-wider block">
                {t("Adresse e-mail")}
              </span>
              <p className="text-sm font-medium text-[#202124]">{email}</p>
              <p className="text-xs text-[#1e8e3e] flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t("Adresse principale vérifiée")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenField("phone")}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f8fafd] transition-colors text-left cursor-pointer border-none bg-transparent"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-[#5f6368] uppercase tracking-wider block">
                {t("Numéro de téléphone")}
              </span>
              <p className="text-sm font-medium text-[#202124]">
                {phone || t("Ajouter un numéro de téléphone")}
              </p>
              <p className="text-xs text-[#5f6368]">
                {t("Utilisé pour la confirmation de livraison et les alertes SMS")}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5f6368]" />
          </button>
        </div>
      </div>

      {/* Adresses Card */}
      <div className="bg-white border border-[#dadce0] rounded-[24px] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#f1f3f4]">
          <h3 className="text-base font-medium text-[#202124]">{t("Adresses et livraisons")}</h3>
          <p className="text-xs text-[#5f6368] mt-0.5">
            {t("Vos adresses de livraison enregistrées en Algérie.")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/buyer?tab=addresses")}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f8fafd] transition-colors text-left cursor-pointer border-none bg-transparent"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#202124]">
                {t("Gérer vos adresses de livraison (69 Wilayas)")}
              </p>
              <p className="text-xs text-[#5f6368]">
                {t("Domicile, lieu de travail, adresses secondaires")}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#5f6368]" />
        </button>
      </div>

      {/* À Propos Card */}
      <div className="bg-white border border-[#dadce0] rounded-[24px] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#f1f3f4]">
          <h3 className="text-base font-medium text-[#202124]">{t("À propos de vous")}</h3>
          <p className="text-xs text-[#5f6368] mt-0.5">
            {t("Partagez vos préférences d'achat avec la communauté.")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenField("about")}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f8fafd] transition-colors text-left cursor-pointer border-none bg-transparent"
        >
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-[#5f6368] uppercase tracking-wider block">
              {t("Biographie & Intérêts")}
            </span>
            <p className="text-sm text-[#202124] line-clamp-2">
              {bio || t("Ajoutez une note ou vos catégories préférées")}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-[#5f6368]" />
        </button>
      </div>
    </div>
  );
};
