import React, { useState } from "react";
import {
  Globe,
  Bell,
  Check,
  Shield,
  CreditCard,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

export const GeneralSettings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(true);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    toast.success(t("Langue mise à jour"));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#1f1f1f] tracking-tight">
          {t("Paramètres généraux")}
        </h2>
        <p className="text-[#444746] text-xs sm:text-sm mt-0.5">
          {t("Personnalisez la langue, l'affichage et vos préférences de notification.")}
        </p>
      </div>

      {/* Language Section */}
      <div className="bg-white rounded-[24px] border border-[#dadce0] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-[#1f1f1f]">
              {t("Langue de l'application")}
            </h3>
            <p className="text-xs text-[#444746]">
              {t("Choisissez votre langue d'affichage pour Olmart.")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => changeLanguage("fr")}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
              i18n.language?.startsWith("fr")
                ? "border-[#1a73e8] bg-[#e8f0fe]/40 text-[#1a73e8] ring-2 ring-[#1a73e8]/20"
                : "border-[#dadce0] bg-white text-[#1f1f1f] hover:bg-[#f8fafd]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🇫🇷</span>
              <div className="text-left">
                <p className="text-sm font-semibold">Français</p>
                <p className="text-xs text-[#444746]">Langue par défaut</p>
              </div>
            </div>
            {i18n.language?.startsWith("fr") && (
              <Check className="w-4 h-4 text-[#1a73e8]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => changeLanguage("ar")}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
              i18n.language?.startsWith("ar")
                ? "border-[#1a73e8] bg-[#e8f0fe]/40 text-[#1a73e8] ring-2 ring-[#1a73e8]/20"
                : "border-[#dadce0] bg-white text-[#1f1f1f] hover:bg-[#f8fafd]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🇩🇿</span>
              <div className="text-right">
                <p className="text-sm font-semibold">العربية</p>
                <p className="text-xs text-[#444746]">اللغة العربية</p>
              </div>
            </div>
            {i18n.language?.startsWith("ar") && (
              <Check className="w-4 h-4 text-[#1a73e8]" />
            )}
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-[24px] border border-[#dadce0] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#fef7e0] text-[#b06000] flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-[#1f1f1f]">
              {t("Notifications et alertes")}
            </h3>
            <p className="text-xs text-[#444746]">
              {t("Gérez les notifications que vous souhaitez recevoir.")}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2 divide-y divide-[#f1f3f4]">
          {/* Order Updates */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-[#1f1f1f]">
                {t("Suivi des commandes en direct")}
              </p>
              <p className="text-[11px] text-[#444746]">
                {t("Alertes par e-mail lors du changement de statut de votre colis.")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={orderAlerts}
              onChange={(e) => {
                setOrderAlerts(e.target.checked);
                toast.success(t("Préférence enregistrée"));
              }}
              className="w-5 h-5 text-[#1a73e8] rounded border-[#dadce0] focus:ring-[#1a73e8] cursor-pointer"
            />
          </div>

          {/* SMS Updates */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-[#1f1f1f]">
                {t("Alertes SMS livreur")}
              </p>
              <p className="text-[11px] text-[#444746]">
                {t("Notification SMS quand le livreur approche de votre adresse.")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => {
                setSmsAlerts(e.target.checked);
                toast.success(t("Préférence enregistrée"));
              }}
              className="w-5 h-5 text-[#1a73e8] rounded border-[#dadce0] focus:ring-[#1a73e8] cursor-pointer"
            />
          </div>

          {/* Promo Updates */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-[#1f1f1f]">
                {t("Offres et bons de réduction")}
              </p>
              <p className="text-[11px] text-[#444746]">
                {t("Recevez les promotions exclusives et ventes flash.")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={promoAlerts}
              onChange={(e) => {
                setPromoAlerts(e.target.checked);
                toast.success(t("Préférence enregistrée"));
              }}
              className="w-5 h-5 text-[#1a73e8] rounded border-[#dadce0] focus:ring-[#1a73e8] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Devise & Région */}
      <div className="bg-white rounded-[24px] border border-[#dadce0] p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e6f4ea] text-[#137333] flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-[#1f1f1f]">
              {t("Devise & Zone de facturation")}
            </h3>
            <p className="text-xs text-[#444746]">
              {t("Dinar Algérien (DZD) avec couverture nationale des 58 wilayas.")}
            </p>
          </div>
        </div>
        <div className="p-3 bg-[#f8fafd] rounded-xl text-xs text-[#444746] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#137333] shrink-0" />
          <span>Tous les prix et paiements sont traités en Dinar Algérien (DZD) conformément à la réglementation.</span>
        </div>
      </div>
    </div>
  );
};
