import React from "react";
import { ExternalLink, ShieldCheck, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const AboutSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#1f1f1f] tracking-tight">
          {t("À propos d'Olmart")}
        </h2>
        <p className="text-[#444746] text-xs sm:text-sm mt-0.5">
          {t("Informations sur l'application, versions et conformité légale.")}
        </p>
      </div>

      <div className="bg-white rounded-[24px] border border-[#dadce0] p-6 sm:p-8 shadow-xs space-y-6">
        {/* App Info Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1a73e8] text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            O
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#1f1f1f]">
              Olmart Super-App
            </h3>
            <p className="text-xs text-[#444746]">
              Version 4.6.16 (Build R4.6.16 Production)
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#137333]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Système sécurisé et conforme aux normes e-commerce</span>
            </div>
          </div>
        </div>

        {/* Links List */}
        <div className="space-y-2 pt-2 divide-y divide-[#f1f3f4]">
          <Link
            to="/privacy-policy"
            className="flex items-center justify-between py-3 text-xs sm:text-sm text-[#1f1f1f] hover:text-[#1a73e8] transition-colors group"
          >
            <span>{t("Règles de confidentialité")}</span>
            <ExternalLink className="w-4 h-4 text-[#747775] group-hover:text-[#1a73e8]" />
          </Link>

          <Link
            to="/refund-policy"
            className="flex items-center justify-between py-3 text-xs sm:text-sm text-[#1f1f1f] hover:text-[#1a73e8] transition-colors group"
          >
            <span>{t("Conditions générales d'utilisation & Retours")}</span>
            <ExternalLink className="w-4 h-4 text-[#747775] group-hover:text-[#1a73e8]" />
          </Link>

          <Link
            to="/support"
            className="flex items-center justify-between py-3 text-xs sm:text-sm text-[#1f1f1f] hover:text-[#1a73e8] transition-colors group"
          >
            <span>{t("Centre d'aide et contact")}</span>
            <ExternalLink className="w-4 h-4 text-[#747775] group-hover:text-[#1a73e8]" />
          </Link>
        </div>

        {/* Made in Algeria footer */}
        <div className="p-4 bg-[#f8fafd] rounded-2xl text-center text-xs text-[#444746] flex items-center justify-center gap-1.5">
          <span>Conçu et développé avec</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>pour l'Algérie</span>
        </div>
      </div>
    </div>
  );
};
