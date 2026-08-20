import React from "react";
import { motion } from "motion/react";
import { Store, MessageSquare, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export const TechTrustBanner: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full py-3 sm:py-4 border-y border-white/40 bg-white/40 backdrop-blur-sm mb-4 sm:mb-6">
      <div className="max-w-[90rem] mx-auto px-4 flex items-center justify-between sm:justify-center sm:gap-16 gap-6 overflow-x-auto desktop-scrollbar">
        <motion.div whileHover={{ y: -1 }} className="flex items-center gap-2.5 shrink-0">
          <Store className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" strokeWidth={1.5} />
          <span className="font-sans font-medium text-[11px] sm:text-[13px] uppercase tracking-wider text-slate-700">
            {t("home.trust.seller_delivery", "LIVRAISON ASSURÉE PAR LE VENDEUR")}
          </span>
        </motion.div>
        <div className="h-4 sm:h-5 w-px bg-slate-200 shrink-0" />
        <motion.div whileHover={{ y: -1 }} className="flex items-center gap-2.5 shrink-0">
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" strokeWidth={1.5} />
          <span className="font-sans font-medium text-[11px] sm:text-[13px] uppercase tracking-wider text-slate-700">
            {t("home.trust.direct_contact", "CONTACT & TRANSACTION DIRECTE")}
          </span>
        </motion.div>
        <div className="h-4 sm:h-5 w-px bg-slate-200 shrink-0 hidden md:block" />
        <motion.div whileHover={{ y: -1 }} className="items-center gap-2.5 shrink-0 hidden md:flex">
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" strokeWidth={1.5} />
          <span className="font-sans font-medium text-[11px] sm:text-[13px] uppercase tracking-wider text-slate-700">
            {t("home.trust.certified_sellers", "BOUTIQUES & VENDEURS VÉRIFIÉS")}
          </span>
        </motion.div>
      </div>
    </div>
  );
};

