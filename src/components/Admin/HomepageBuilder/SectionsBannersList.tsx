import React, { useState } from "react";
import { LayoutTemplate, Plus, Layers, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HomepageSection } from "../../../domains/home/homepage.types";
import { PresetsRibbon } from "./PresetsRibbon";
import { SectionListItem } from "./SectionListItem";

interface SectionsBannersListProps {
  sections: HomepageSection[];
  isLoading: boolean;
  handleAddItem: () => void;
  handleEditItem: (item: HomepageSection) => void;
  handleDelete: (id: string) => void;
  handleToggleActive: (section: HomepageSection) => void;
  handleMove: (index: number, direction: "up" | "down") => void;
  handleApplyPreset: (preset: Partial<HomepageSection>) => void;
  onOpenLivePreview?: () => void;
}

export const SectionsBannersList: React.FC<SectionsBannersListProps> = ({
  sections,
  isLoading,
  handleAddItem,
  handleEditItem,
  handleDelete,
  handleToggleActive,
  handleMove,
  handleApplyPreset,
  onOpenLivePreview,
}) => {
  const { t } = useTranslation();
  const [filterQuery, setFilterQuery] = useState("");

  const filteredSections = sections.filter((s) => {
    const q = filterQuery.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.title || "").toLowerCase().includes(q) ||
      (s.type || "").toLowerCase().includes(q) ||
      (s.category || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6" id="sections-banners-list">
      <PresetsRibbon onApplyPreset={handleApplyPreset} />

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        {/* Header toolbar */}
        <div className="p-5 border-b border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-2xl shadow-xs">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-base flex items-center gap-2">
                {t("Sections d'Accueil Actives")}
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-200 text-zinc-700">
                  {sections.length}
                </span>
              </h3>
              <p className="text-xs text-zinc-500">
                {t("Contrôlez l'ordre, la visibilité et le ciblage en direct sur le site")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder={t("Filtrer les sections...")}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="px-3 py-2 text-xs rounded-2xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 flex-1 sm:w-52"
            />
            {onOpenLivePreview && (
              <button
                type="button"
                onClick={onOpenLivePreview}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                {t("Aperçu Store")}
              </button>
            )}
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> {t("Nouvelle Section")}
            </button>
          </div>
        </div>

        {/* List Content */}
        <div>
          {isLoading ? (
            <div className="p-12 text-center text-zinc-500 font-medium space-y-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">{t("Chargement des sections d'accueil...")}</p>
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-zinc-200 m-6 rounded-2xl bg-zinc-50/50">
              <Layers className="w-10 h-10 text-zinc-300 mb-3" />
              <p className="text-zinc-700 font-bold text-sm mb-1">{t("Aucune section trouvée")}</p>
              <p className="text-xs text-zinc-500 mb-4 max-w-sm">
                {t("Configurez des sections dynamiques pour personnaliser la vitrine des acheteurs algériens.")}
              </p>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 bg-amber-500 text-white rounded-2xl text-xs font-bold hover:bg-amber-600 transition-colors cursor-pointer"
              >
                {t("Créer ma première section")}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredSections.map((item, index) => (
                <SectionListItem
                  key={item.id || index}
                  item={item}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === filteredSections.length - 1}
                  onMove={handleMove}
                  onToggleActive={handleToggleActive}
                  onEdit={handleEditItem}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
