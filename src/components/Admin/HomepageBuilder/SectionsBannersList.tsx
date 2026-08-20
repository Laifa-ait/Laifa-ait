import React from "react";
import { LayoutTemplate, Plus, GripVertical, Sparkles, Check, X, Edit2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HomepageSection } from "../../../domains/home/homepage.types";

interface SectionsBannersListProps {
  sections: HomepageSection[];
  isLoading: boolean;
  handleAddItem: () => void;
  handleEditItem: (item: HomepageSection) => void;
  handleDelete: (id: string) => void;
}

export const SectionsBannersList: React.FC<SectionsBannersListProps> = ({
  sections,
  isLoading,
  handleAddItem,
  handleEditItem,
  handleDelete,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden" id="sections-banners-list">
      <div className="p-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
        <h3 className="font-bold flex items-center gap-2 text-zinc-950">
          <LayoutTemplate className="w-5 h-5 text-orange-600" />
          {t("Sections Actives")}
        </h3>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal hover:bg-orange-700 transition-colors shadow-md cursor-pointer border-none"
        >
          <Plus className="w-4 h-4" /> {t("Ajouter")}
        </button>
      </div>

      <div className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-950/50 font-bold animate-pulse">{t("Chargement...")}</div>
        ) : sections.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-zinc-200 m-6 rounded-2xl">
            <p className="text-zinc-950/50 font-bold mb-2">{t("Aucune section trouvée.")}</p>
            <p className="text-xs text-zinc-950/40">{t("Cliquez sur Ajouter pour commencer.")}</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">
            {sections.map((item: HomepageSection) => {
              const themeName = item.themeName;
              const themeImage = item.themeImage;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 hover:bg-zinc-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <button className="text-zinc-950/20 cursor-grab hover:text-zinc-950/50 bg-transparent border-none">
                      <GripVertical className="w-5 h-5" />
                    </button>
                    <div>
                      <h4 className="font-bold text-zinc-950">{item.name || "Sans nom"}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-orange-600/10 text-orange-600 rounded text-[9px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal">
                          {item.type || "N/A"}
                        </span>
                        {(themeName || themeImage) && (
                          <span className="px-2 py-0.5 bg-zinc-950/10 text-zinc-950 rounded text-[9px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            {themeName || t("Saison active")}
                          </span>
                        )}
                        {item.isActive ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                            <Check className="w-3 h-3" /> {t("Actif")}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                            <X className="w-3 h-3" /> {t("Inactif")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleEditItem(item)}
                      className="p-2 text-zinc-950/60 hover:bg-zinc-950/5 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
