import React from "react";
import {
  Check,
  X,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Tag,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { HomepageSection } from "../../../domains/home/homepage.types";

interface SectionListItemProps {
  item: HomepageSection;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMove: (index: number, direction: "up" | "down") => void;
  onToggleActive: (section: HomepageSection) => void;
  onEdit: (section: HomepageSection) => void;
  onDelete: (id: string) => void;
}

export const SectionListItem: React.FC<SectionListItemProps> = ({
  item,
  index,
  isFirst,
  isLast,
  onMove,
  onToggleActive,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const hasManual = item.manualProducts && item.manualProducts.length > 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-zinc-50/70 transition-all gap-4 group">
      {/* Left: Reorder controls + details */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
        <div className="flex flex-col items-center justify-center gap-1 bg-zinc-100 rounded-lg p-1 shrink-0">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onMove(index, "up")}
            aria-label="Monter"
            className="p-1 rounded text-zinc-600 hover:text-zinc-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-extrabold text-zinc-700 px-1">
            #{index + 1}
          </span>
          <button
            type="button"
            disabled={isLast}
            onClick={() => onMove(index, "down")}
            aria-label="Descendre"
            className="p-1 rounded text-zinc-600 hover:text-zinc-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-zinc-900 text-sm truncate">
              {item.title || item.name || t("Section sans titre")}
            </h4>
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200">
              {item.type}
            </span>
            {item.style && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
                {item.style}
              </span>
            )}
            {(item.themeName || item.themeImage) && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {item.themeName || t("Thème actif")}
              </span>
            )}
          </div>

          {item.subtitle && (
            <p className="text-xs text-zinc-500 line-clamp-1">{item.subtitle}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-zinc-600">
            {item.category && (
              <span className="flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded-lg">
                <Tag className="w-3 h-3 text-zinc-400" />
                Catégorie: <strong className="text-zinc-800">{item.category}</strong>
              </span>
            )}
            {hasManual ? (
              <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg">
                <strong>{item.manualProducts?.length}</strong> {t("produits manuels")}
              </span>
            ) : (
              <span className="text-zinc-400">
                {t("Limite")} : {item.limit || 8} {t("produits")}
              </span>
            )}
            {item.targetRegions && item.targetRegions.length > 0 && (
              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-lg">
                <MapPin className="w-3 h-3" />
                {item.targetRegions.length} {t("wilayas ciblées")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
        <button
          type="button"
          onClick={() => onToggleActive(item)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
            item.isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200"
          }`}
        >
          {item.isActive ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>{t("En ligne")}</span>
            </>
          ) : (
            <>
              <X className="w-3.5 h-3.5" />
              <span>{t("Désactivée")}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => onEdit(item)}
          className="p-2 rounded-2xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer border border-zinc-200"
          title={t("Modifier")}
        >
          <Edit2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="p-2 rounded-2xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer border border-rose-200"
          title={t("Supprimer")}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
