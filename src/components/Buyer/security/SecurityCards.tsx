import React from "react";
import {
  Key,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Mail,
  Phone,
  Laptop,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthUser as User, UserProfile } from "../../../domains/user/user.types";

interface SecurityCardsProps {
  currentUser: User | null;
  userProfile: UserProfile | null;
  onOpenPasswordModal: () => void;
  onOpenEmailModal: () => void;
  onOpenPhoneModal: () => void;
}

export const SecurityCards: React.FC<SecurityCardsProps> = ({
  currentUser,
  userProfile,
  onOpenPasswordModal,
  onOpenEmailModal,
  onOpenPhoneModal,
}) => {
  const { t } = useTranslation();

  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
  const browserName = /Chrome/i.test(userAgent)
    ? "Chrome"
    : /Safari/i.test(userAgent)
    ? "Safari"
    : /Firefox/i.test(userAgent)
    ? "Firefox"
    : "Navigateur Web";

  return (
    <div className="space-y-6">
      {/* Google Protection Status Banner */}
      <div className="bg-[#e6f4ea] border border-[#ceead6] rounded-[24px] p-5 flex items-start gap-4 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-[#137333] text-white flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-sm font-semibold text-[#137333]">
            {t("Votre compte est sécurisé et protégé")}
          </h4>
          <p className="text-xs text-[#1e8e3e] leading-relaxed">
            {t(
              "Transactions protégées par cryptographie ACID, synchronisation Firebase Auth en temps réel et alertes de connexion actives."
            )}
          </p>
        </div>
      </div>

      {/* Card 1: Comment vous vous connectez à Olmart */}
      <div className="bg-white border border-[#dadce0] rounded-[24px] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#f1f3f4]">
          <h3 className="text-base font-medium text-[#202124]">
            {t("Comment vous vous connectez à Olmart")}
          </h3>
          <p className="text-xs text-[#5f6368] mt-0.5">
            {t("Options de connexion et méthodes de récupération sécurisées.")}
          </p>
        </div>

        <div className="divide-y divide-[#f1f3f4]">
          {/* Mot de passe */}
          <button
            type="button"
            onClick={onOpenPasswordModal}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f8fafd] transition-colors text-left cursor-pointer border-none bg-transparent"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-[#5f6368] uppercase tracking-wider block">
                  {t("Mot de passe")}
                </span>
                <p className="text-sm font-medium text-[#202124]">••••••••</p>
                <p className="text-xs text-[#5f6368]">{t("Stocké de manière chiffrée dans Firebase Auth")}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5f6368]" />
          </button>

          {/* Validation en deux étapes */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#e6f4ea] text-[#137333] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-[#5f6368] uppercase tracking-wider block">
                  {t("Validation en deux étapes (2FA)")}
                </span>
                <p className="text-sm font-medium text-[#137333] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {t("Activée et renforcée par SMS / Email")}
                </p>
              </div>
            </div>
          </div>

          {/* Adresse e-mail de récupération */}
          <button
            type="button"
            onClick={onOpenEmailModal}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f8fafd] transition-colors text-left cursor-pointer border-none bg-transparent"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-[#5f6368] uppercase tracking-wider block">
                  {t("Adresse e-mail principale")}
                </span>
                <p className="text-sm font-medium text-[#202124]">{currentUser?.email}</p>
                <p className="text-xs text-[#1e8e3e] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t("Vérifiée et protégée")}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5f6368]" />
          </button>

          {/* Numéro de téléphone de récupération */}
          <button
            type="button"
            onClick={onOpenPhoneModal}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f8fafd] transition-colors text-left cursor-pointer border-none bg-transparent"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#fef7e0] text-[#b06000] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-[#5f6368] uppercase tracking-wider block">
                  {t("Numéro de téléphone de récupération")}
                </span>
                <p className="text-sm font-medium text-[#202124]">
                  {userProfile?.phone || (currentUser?.phoneNumber as string) || t("Ajouter un numéro (+213)")}
                </p>
                <p className="text-xs text-[#5f6368]">{t("Utilisé pour les alertes de sécurité par SMS")}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#5f6368]" />
          </button>
        </div>
      </div>

      {/* Card 2: Vos appareils (Google Device List) */}
      <div className="bg-white border border-[#dadce0] rounded-[24px] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#f1f3f4]">
          <h3 className="text-base font-medium text-[#202124]">{t("Vos appareils")}</h3>
          <p className="text-xs text-[#5f6368] mt-0.5">
            {t("Appareils actuellement connectés à votre compte Olmart.")}
          </p>
        </div>

        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#f8fafd] border border-[#dadce0] text-[#5f6368] flex items-center justify-center shrink-0">
              {isMobile ? <Smartphone className="w-5 h-5 text-[#1a73e8]" /> : <Laptop className="w-5 h-5 text-[#1a73e8]" />}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#202124]">
                  {browserName} • {isMobile ? "Smartphone" : "Ordinateur"}
                </p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#e6f4ea] text-[#137333]">
                  {t("Cet appareil")}
                </span>
              </div>
              <p className="text-xs text-[#5f6368]">
                {t("Session active • Algérie • Sécurisée via Firebase Bearer Token")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Événements de sécurité récents */}
      <div className="bg-white border border-[#dadce0] rounded-[24px] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#f1f3f4]">
          <h3 className="text-base font-medium text-[#202124]">
            {t("Activité et sécurité récente")}
          </h3>
          <p className="text-xs text-[#5f6368] mt-0.5">
            {t("Historique des vérifications récentes de sécurité sur votre compte.")}
          </p>
        </div>

        <div className="divide-y divide-[#f1f3f4] text-xs text-[#5f6368]">
          <div className="px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#1a73e8]" />
              <span>{t("Connexion récente authentifiée")}</span>
            </div>
            <span className="text-[#137333] font-medium">{t("Sécurisée")}</span>
          </div>
          <div className="px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-[#137333]" />
              <span>{t("Protection anti-IDOR et jeton Firebase actif")}</span>
            </div>
            <span className="text-[#137333] font-medium">{t("Conforme")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
