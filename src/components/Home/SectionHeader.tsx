import React from "react";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HomepageSection } from "../../domains/home/homepage.types";
import { useAuth } from "../../context/AuthContext";

interface SectionHeaderProps {
  section: HomepageSection;
  isDarkBg?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ section, isDarkBg = false }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userProfile } = useAuth();

  const titleText = section.title || section.name || t("home.sections.default");
  const seeMoreLabel = t("home.sections.see_more", "Voir tout");

  const targetLink = section.category
    ? `/shop?category=${encodeURIComponent(section.category)}`
    : section.tag
    ? `/shop?tag=${encodeURIComponent(section.tag)}`
    : `/collection/${encodeURIComponent(section.id || titleText)}`;

  const styleVariant = section.style || "clean";

  const renderStyleBadge = () => {
    if (section.themeName) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Sparkles className="w-2.5 h-2.5 text-emerald-600 fill-emerald-600" />
          {section.themeName}
        </span>
      );
    }
    if (styleVariant === "premium") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white shadow-xs">
          <Sparkles className="w-2.5 h-2.5 fill-white text-white" />
          {t("Prestige")}
        </span>
      );
    }
    if (styleVariant === "immersive") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-xs">
          <Zap className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
          {t("Flash Deal")}
        </span>
      );
    }
    if (styleVariant === "glass") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/40 backdrop-blur-md text-slate-900 border border-white/60">
          {t("Édition Spéciale")}
        </span>
      );
    }
    return null;
  };

  const getButtonStyles = () => {
    if (isDarkBg) {
      return "bg-white/10 hover:bg-white/20 text-white border border-white/20";
    }
    return "bg-white hover:bg-slate-50 text-slate-800 hover:text-emerald-700 border border-slate-200 shadow-2xs font-semibold";
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-6 pb-3 border-b border-slate-200/80 gap-3 group/header">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkBg ? "text-white" : "text-slate-900"}`}>
            {titleText}
          </h3>
          {renderStyleBadge()}
        </div>

        {section.subtitle && (
          <p className={`text-xs sm:text-sm font-medium ${isDarkBg ? "text-emerald-200" : "text-slate-500"}`}>
            {section.subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => navigate(targetLink)}
          className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${getButtonStyles()}`}
        >
          <span>{seeMoreLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {userProfile?.role === "admin" && (
          <button
            type="button"
            onClick={() => navigate("/dashboard/admin/homepage")}
            className={`text-[11px] font-semibold px-2 py-1 transition-colors cursor-pointer ${
              isDarkBg ? "text-white/60 hover:text-white" : "text-slate-400 hover:text-emerald-700"
            }`}
          >
            {t("common.edit")}
          </button>
        )}
      </div>
    </div>
  );
};
