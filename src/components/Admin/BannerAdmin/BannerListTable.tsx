import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp, ArrowDown, Tag, AlertCircle, Eye, Edit, Trash2, ArrowLeftRight } from "lucide-react";
import { DbBanner, TagType } from "../../../hooks/useBannerAdmin";

interface BannerListTableProps {
  banners: DbBanner[];
  tags: TagType[];
  draggedIndex: number | null;
  shiftIndex: (index: number, direction: "up" | "down") => Promise<void>;
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, index: number) => Promise<void>;
  setPreviewBannerData: (banner: DbBanner | null) => void;
  setPreviewDeviceMode: (mode: "desktop" | "tablet" | "mobile") => void;
  setIsPreviewModalOpen: (open: boolean) => void;
  handleOpenBannerModal: (banner: DbBanner | null) => void;
  handleDeleteBanner: (id: string) => Promise<void>;
}

export const BannerListTable: React.FC<BannerListTableProps> = ({
  banners,
  tags,
  draggedIndex,
  shiftIndex,
  handleDragStart,
  handleDragOver,
  handleDrop,
  setPreviewBannerData,
  setPreviewDeviceMode,
  setIsPreviewModalOpen,
  handleOpenBannerModal,
  handleDeleteBanner,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-wider">
          {t("Bannières de l'affichage (")}{banners.length})
        </h2>
        <button
          onClick={() => handleOpenBannerModal(null)}
          className="flex items-center gap-2 bg-orange-600 text-white px-5 py-3 rounded-2xl font-sans font-bold text-xs uppercase tracking-widest hover:bg-orange-500 transition-colors shadow-lg active:scale-95 cursor-pointer"
        >
          {t("Nouvelle Bannière")}
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border-2 border-dashed border-zinc-200">
          <AlertCircle className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-base font-bold text-zinc-700 uppercase">{t("Aucune bannière configurée")}</h3>
          <p className="text-zinc-500 text-xs mt-1">
            {t("La page d'accueil affiche les bannières actives en ordre de tri. Créez-en une maintenant !")}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-zinc-50/50 border-b border-zinc-100 text-xs uppercase font-sans font-bold tracking-widest text-zinc-400 grid grid-cols-1 md:grid-cols-12 gap-4 hidden md:grid">
            <div className="col-span-1 text-center">{t("Tri")}</div>
            <div className="col-span-3">{t("Visuels (bureau / mobile)")}</div>
            <div className="col-span-3">{t("Détails Marketing")}</div>
            <div className="col-span-2 text-center">{t("CTR & Performance")}</div>
            <div className="col-span-1.5 text-center">{t("Statut / Plannif")}</div>
            <div className="col-span-1.5 text-center">{t("Actions")}</div>
          </div>

          <div className="divide-y divide-zinc-100">
            {banners.map((banner, index) => {
              const associatedTag = tags.find((tg) => tg.id === banner.tag_id);
              const views = banner.views || 0;
              const clicks = banner.clicks || 0;
              const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0";

              let schedStatus = "illimite";
              const now = new Date();
              if (banner.start_date || banner.end_date) {
                const start = banner.start_date ? new Date(banner.start_date) : null;
                const end = banner.end_date ? new Date(banner.end_date) : null;
                if (start && now < start) {
                  schedStatus = "attente";
                } else if (end && now > end) {
                  schedStatus = "expire";
                } else {
                  schedStatus = "actif";
                }
              }

              const zoneNames: Record<string, string> = {
                carousel_main: t("Carrousel Principal"),
                grid_top: t("Grille Haute"),
                grid_bottom: t("Grille Basse"),
                sidebar: t("Bannière Latérale"),
              };
              const displayZone = zoneNames[banner.zone || "carousel_main"] || t("Carrousel Principal");

              return (
                <div
                  key={banner.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-6 hover:bg-zinc-50/50 transition-colors cursor-move relative ${
                    draggedIndex === index ? "opacity-40" : ""
                  }`}
                >
                  <div className="col-span-full md:col-span-1 flex flex-row md:flex-col items-center justify-center gap-1">
                    <button
                      disabled={index === 0}
                      onClick={() => shiftIndex(index, "up")}
                      className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 disabled:opacity-20 cursor-pointer"
                      title={t("Reculer")}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-sans font-bold text-zinc-800 bg-zinc-100 px-2.5 py-1 rounded-lg min-w-[24px] text-center shrink-0">
                      {banner.sort_order || index + 1}
                    </span>
                    <button
                      disabled={index === banners.length - 1}
                      onClick={() => shiftIndex(index, "down")}
                      className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 disabled:opacity-20 cursor-pointer"
                      title={t("Avancer")}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="col-span-full md:col-span-3 space-y-2">
                    <div className="flex gap-2.5 justify-center md:justify-start">
                      <div className="relative aspect-[21/9] w-28 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                        <img
                          loading="lazy"
                          src={banner.desktop_image}
                          alt=""
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1 start-1 px-1 bg-black/60 rounded text-xs text-white uppercase font-sans font-bold">
                          {t("Desktop")}
                        </div>
                      </div>
                      {banner.mobile_image ? (
                        <div className="relative aspect-[4/5] w-10 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                          <img
                            loading="lazy"
                            src={banner.mobile_image}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-1 start-1 px-1 bg-black/60 rounded text-xs text-white uppercase font-sans font-bold">
                            {t("Mobile")}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="w-10 aspect-[4/5] rounded-lg border border-dashed border-zinc-200 flex flex-col items-center justify-center text-xs text-zinc-400 font-bold text-center uppercase p-1 leading-none shrink-0"
                          title={t("Pas de visuel mobile, fallback desktop activé")}
                        >
                          <span>{t("Mobi")}</span>
                          <span>{t("Fallback")}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-full md:col-span-3 space-y-1.5 text-center md:text-start">
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-start">
                        <h4 className="text-sm font-extrabold truncate max-w-[180px]" style={{ color: banner.title_color }}>
                          {banner.title}
                        </h4>
                        <span className="text-xs font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-150 text-zinc-800">
                          {displayZone}
                        </span>
                      </div>
                      {banner.subtitle && (
                        <p className="text-xs text-zinc-400 font-semibold truncate max-w-[200px]">{banner.subtitle}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 text-xs font-bold text-zinc-500 uppercase">
                      <span>{t("Redirection :")}</span>
                      {associatedTag ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-bold">
                          <Tag className="w-2.5 h-2.5 shrink-0" />
                          {associatedTag.name}
                        </span>
                      ) : (
                        <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-bold">
                          <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                          {t("Tag orphelin")}
                        </span>
                      )}

                      {banner.ab_group && banner.ab_group !== "all" && (
                        <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full text-xs font-extrabold border border-purple-100">
                          {t("Test A/B : Variant ")}{banner.ab_group}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-full md:col-span-2 text-center">
                    <div className="inline-block bg-zinc-50 border border-zinc-150 rounded-2xl p-2.5 space-y-1 text-center min-w-[120px]">
                      <div className="flex justify-between gap-4 text-xs font-bold text-zinc-400 uppercase">
                        <span>{t("Vues")}</span>
                        <span>{t("Clics")}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-xs font-black text-zinc-800 font-mono">
                        <span>{views}</span>
                        <span>{clicks}</span>
                      </div>
                      <div className="pt-1 border-t border-zinc-200/60 flex justify-between items-center text-xs font-extrabold text-zinc-900 uppercase">
                        <span>{t("Taux CTR")}</span>
                        <span className="text-orange-600 font-mono">{ctr}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-full md:col-span-1.5 text-center space-y-1.5">
                    <div className="flex flex-col items-center gap-1 justify-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-widest ${
                          banner.is_active ? "bg-emerald-50 text-emerald-600 border border-emerald-150" : "bg-zinc-100 text-zinc-400 border border-zinc-200"
                        }`}
                      >
                        {banner.is_active ? t("Publié") : t("Brouillon")}
                      </span>

                      {schedStatus === "illimite" ? (
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t("Permanent (Illimité)")}</span>
                      ) : schedStatus === "attente" ? (
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-extrabold uppercase border border-blue-100 animate-pulse">
                          {t("Planifié")}
                        </span>
                      ) : schedStatus === "expire" ? (
                        <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-xs font-extrabold uppercase border border-red-100">
                          {t("Expiré")}
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-xs font-extrabold uppercase border border-emerald-100">
                          {t("En cours")}
                        </span>
                      )}
                    </div>

                    {(banner.start_date || banner.end_date) && (
                      <div className="text-xs text-zinc-400 font-bold font-mono space-y-0.5 leading-none">
                        {banner.start_date && (
                          <div className="truncate" title={banner.start_date}>
                            s: {new Date(banner.start_date).toLocaleDateString()}
                          </div>
                        )}
                        {banner.end_date && (
                          <div className="truncate" title={banner.end_date}>
                            e: {new Date(banner.end_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="col-span-full md:col-span-1.5 flex items-center justify-center gap-1 text-zinc-400">
                    <button
                      onClick={() => {
                        setPreviewBannerData(banner);
                        setPreviewDeviceMode("desktop");
                        setIsPreviewModalOpen(true);
                      }}
                      className="p-2 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 hover:text-zinc-950 rounded-2xl transition-all cursor-pointer flex items-center gap-1"
                      title={t("Prévisualiser")}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={() => handleOpenBannerModal(banner)}
                      className="p-2 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 hover:text-zinc-950 rounded-2xl transition-all cursor-pointer flex items-center gap-1"
                      title={t("Modifier")}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-2xl transition-all cursor-pointer flex items-center gap-1"
                      title={t("Supprimer")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2.5 p-4 bg-orange-50 border border-orange-100/50 rounded-2xl text-xs font-bold uppercase tracking-wider text-orange-700">
        <ArrowLeftRight className="w-4 h-4 shrink-0 text-orange-600 animate-pulse" />
        <span>
          {t(
            "Astuce : Vous pouvez également glisser-déposer les listes de bannières pour réordonner l'ordre de défilement de l'accueil."
          )}
        </span>
      </div>
    </div>
  );
};
