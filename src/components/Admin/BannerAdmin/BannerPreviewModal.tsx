import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "lucide-react";
import { DbBanner, TagType } from "../../../hooks/useBannerAdmin";

interface BannerPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewBannerData: DbBanner | null;
  tags: TagType[];
  previewDeviceMode: "desktop" | "tablet" | "mobile";
  setPreviewDeviceMode: (mode: "desktop" | "tablet" | "mobile") => void;
}

export const BannerPreviewModal: React.FC<BannerPreviewModalProps> = ({
  isOpen,
  onClose,
  previewBannerData,
  tags,
  previewDeviceMode,
  setPreviewDeviceMode,
}) => {
  const { t } = useTranslation();

  if (!isOpen || !previewBannerData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl border border-zinc-150 shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden text-start">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-150 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider">
              {t("🖥️ Simulateur de Rendu Responsive OLMART")}
            </h3>
            <p className="text-[10px] font-bold text-zinc-500 uppercase">
              {t("Visualisation exacte du visuel sur Desktop, Tablette et Téléphone")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer border-none font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Main content grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
          {/* Left simulator viewport */}
          <div className="lg:col-span-3 p-6 bg-zinc-100 flex flex-col items-center justify-center overflow-y-auto space-y-6">
            {/* Selector segment */}
            <div className="flex bg-white p-1 rounded-xl border border-zinc-200 shadow-sm gap-1 select-none">
              <button
                onClick={() => setPreviewDeviceMode("desktop")}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  previewDeviceMode === "desktop" ? "bg-zinc-950 text-white" : "text-zinc-500 hover:text-zinc-950"
                }`}
              >
                {t("💻 Ordinateur (21:9)")}
              </button>
              <button
                onClick={() => setPreviewDeviceMode("tablet")}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  previewDeviceMode === "tablet" ? "bg-zinc-950 text-white" : "text-zinc-500 hover:text-zinc-950"
                }`}
              >
                {t("📟 Tablette (16:10)")}
              </button>
              <button
                onClick={() => setPreviewDeviceMode("mobile")}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  previewDeviceMode === "mobile" ? "bg-zinc-950 text-white" : "text-zinc-500 hover:text-zinc-950"
                }`}
              >
                {t("📱 Téléphone (4:5)")}
              </button>
            </div>

            {/* Viewport Frame simulator */}
            <div className="w-full flex justify-center items-center flex-1">
              {previewDeviceMode === "desktop" && (
                <div className="w-full max-w-3xl aspect-[2.4/1] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-300 relative shadow-lg">
                  <img
                    loading="lazy"
                    src={previewBannerData.desktop_image}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <div className="absolute inset-y-0 start-0 w-2/3 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white text-start">
                    {tags.find((tg) => tg.id === previewBannerData.tag_id) && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/15 tracking-widest uppercase font-sans font-bold text-[8px] w-fit mb-1.5">
                        {tags.find((tg) => tg.id === previewBannerData.tag_id)?.name}
                      </span>
                    )}
                    <h3 className="text-lg font-sans font-bold uppercase leading-tight tracking-tight mb-1" style={{ color: previewBannerData.title_color }}>
                      {previewBannerData.title}
                    </h3>
                    {previewBannerData.subtitle && (
                      <p className="text-xs font-semibold leading-normal mb-2 max-w-lg tracking-wide opacity-90" style={{ color: previewBannerData.subtitle_color }}>
                        {previewBannerData.subtitle}
                      </p>
                    )}
                    <button
                      style={{ backgroundColor: previewBannerData.btn_bg_color || "#FFFFFF", color: previewBannerData.btn_text_color || "#18181B" }}
                      className="rounded-xl py-1.5 px-4 text-[9px] uppercase tracking-widest font-sans font-bold shrink-0 w-fit pointer-events-none mt-1 shadow-md"
                    >
                      {previewBannerData.button_text}
                    </button>
                  </div>
                </div>
              )}

              {previewDeviceMode === "tablet" && (
                <div className="w-[500px] aspect-[1.6/1] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-300 relative shadow-lg">
                  <img
                    loading="lazy"
                    src={previewBannerData.desktop_image}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <div className="absolute inset-y-0 start-0 w-2/3 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5 text-white text-start">
                    {tags.find((tg) => tg.id === previewBannerData.tag_id) && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/15 tracking-widest uppercase font-sans font-bold text-[7px] w-fit mb-1">
                        {tags.find((tg) => tg.id === previewBannerData.tag_id)?.name}
                      </span>
                    )}
                    <h3 className="text-base font-sans font-bold uppercase leading-tight mb-1" style={{ color: previewBannerData.title_color }}>
                      {previewBannerData.title}
                    </h3>
                    {previewBannerData.subtitle && (
                      <p className="text-[10px] font-semibold leading-normal mb-2 opacity-90" style={{ color: previewBannerData.subtitle_color }}>
                        {previewBannerData.subtitle}
                      </p>
                    )}
                    <button
                      style={{ backgroundColor: previewBannerData.btn_bg_color || "#FFFFFF", color: previewBannerData.btn_text_color || "#18181B" }}
                      className="rounded-lg py-1 px-3 text-[8px] uppercase tracking-widest font-sans font-bold shrink-0 w-fit pointer-events-none mt-1 shadow-sm"
                    >
                      {previewBannerData.button_text}
                    </button>
                  </div>
                </div>
              )}

              {previewDeviceMode === "mobile" && (
                <div className="w-64 aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-300 relative shadow-lg">
                  {previewBannerData.mobile_image ? (
                    <img
                      loading="lazy"
                      src={previewBannerData.mobile_image}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full relative">
                      <img
                        loading="lazy"
                        src={previewBannerData.desktop_image}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 start-2 px-1.5 py-0.5 bg-orange-600/95 rounded text-[7px] font-sans font-bold text-white uppercase tracking-wider leading-none select-none">
                        {t("Desktop Fallback")}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-4 text-white text-start">
                    {tags.find((tg) => tg.id === previewBannerData.tag_id) && (
                      <span className="inline-block tracking-widest uppercase font-sans font-bold text-[6px] text-zinc-300 mb-0.5">
                        {tags.find((tg) => tg.id === previewBannerData.tag_id)?.name}
                      </span>
                    )}
                    <h4 className="text-xs font-sans font-bold uppercase leading-tight mb-0.5 truncate" style={{ color: previewBannerData.title_color }}>
                      {previewBannerData.title}
                    </h4>
                    {previewBannerData.subtitle && (
                      <p className="text-[8px] font-semibold leading-tight mb-1 opacity-90 truncate" style={{ color: previewBannerData.subtitle_color }}>
                        {previewBannerData.subtitle}
                      </p>
                    )}
                    <button
                      style={{ backgroundColor: previewBannerData.btn_bg_color || "#FFFFFF", color: previewBannerData.btn_text_color || "#18181B" }}
                      className="rounded py-1 px-2.5 text-[7px] uppercase tracking-widest font-sans font-bold shrink-0 w-fit pointer-events-none block shadow-sm mt-1"
                    >
                      {previewBannerData.button_text}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right panel metadata stats */}
          <div className="p-6 border-t lg:border-t-0 lg:border-l border-zinc-150 space-y-5 overflow-y-auto shrink-0">
            <div>
              <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-400">{t("Analyse de la Fiche")}</h4>
              <p className="text-xs font-extrabold text-zinc-900 mt-0.5 truncate">{previewBannerData.title}</p>
            </div>

            <div className="pt-4 border-t border-zinc-150 space-y-3">
              <h5 className="text-[10px] font-black uppercase text-zinc-900 tracking-wider">{t("📊 Statistiques réelles")}</h5>
              
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 bg-zinc-50 border border-zinc-150 rounded-xl">
                  <span className="block text-[8px] font-bold text-zinc-400 uppercase">{t("Vues")}</span>
                  <span className="text-sm font-black text-zinc-800 font-mono">{previewBannerData.views || 0}</span>
                </div>
                <div className="p-2.5 bg-zinc-50 border border-zinc-150 rounded-xl">
                  <span className="block text-[8px] font-bold text-zinc-400 uppercase">{t("Clics")}</span>
                  <span className="text-sm font-black text-zinc-800 font-mono">{previewBannerData.clicks || 0}</span>
                </div>
              </div>

              <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-between text-orange-800 font-bold uppercase text-[10px]">
                <span>{t("Taux de Clics (CTR)")}</span>
                <span className="font-mono text-xs font-black">
                  {previewBannerData.views && previewBannerData.views > 0 
                    ? (((previewBannerData.clicks || 0) / previewBannerData.views) * 100).toFixed(1) 
                    : "0.0"}%
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-150 space-y-3.5 text-xs text-zinc-700">
              <h5 className="text-[10px] font-black uppercase text-zinc-900 tracking-wider">{t("🎯 Paramètres de Ciblage")}</h5>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400 uppercase text-[9px] font-bold">{t("Zone d'affichage")}</span>
                  <span className="font-extrabold text-zinc-900 text-[9px] uppercase">
                    {previewBannerData.zone === "grid_top" 
                      ? t("Grille Haute") 
                      : previewBannerData.zone === "grid_bottom" 
                      ? t("Grille Basse") 
                      : previewBannerData.zone === "sidebar" 
                      ? t("Latérale") 
                      : t("Carrousel Principal")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400 uppercase text-[9px] font-bold">{t("Groupe A/B Test")}</span>
                  <span className="font-extrabold text-zinc-900 text-[9px] uppercase">
                    {previewBannerData.ab_group && previewBannerData.ab_group !== "all" 
                      ? `${t("Groupe ")}${previewBannerData.ab_group}` 
                      : t("Tous (Pas d'A/B test)")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400 uppercase text-[9px] font-bold">{t("Cible Visiteur")}</span>
                  <span className="font-extrabold text-zinc-900 text-[9px] uppercase">
                    {previewBannerData.target_user_type === "new" 
                      ? t("Nouveaux") 
                      : previewBannerData.target_user_type === "logged_in" 
                      ? t("Connectés") 
                      : t("Tous")}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-400 uppercase text-[9px] font-bold block">{t("Wilayas Ciblées")}</span>
                  <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto">
                    {previewBannerData.target_regions && previewBannerData.target_regions.length > 0 ? (
                      previewBannerData.target_regions.map((w: string) => (
                        <span key={w} className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[8px] font-bold uppercase">
                          {w}
                        </span>
                      ))
                    ) : (
                      <span className="text-[8px] text-zinc-500 uppercase font-bold">{t("Toutes les Wilayas (58)")}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 pt-1.5 border-t border-dashed border-zinc-200">
                  <span className="text-zinc-400 uppercase text-[9px] font-bold block">{t("Planification horaire")}</span>
                  {previewBannerData.start_date || previewBannerData.end_date ? (
                    <div className="text-[9px] font-bold text-zinc-800 font-mono space-y-0.5 leading-tight">
                      {previewBannerData.start_date && (
                        <div>DEBUT: {new Date(previewBannerData.start_date).toLocaleString()}</div>
                      )}
                      {previewBannerData.end_date && (
                        <div>FIN: {new Date(previewBannerData.end_date).toLocaleString()}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[8px] text-emerald-600 uppercase font-black">{t("Permanent (Illimité)")}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-150 space-y-2">
              <h5 className="text-[10px] font-black uppercase text-zinc-900 tracking-wider">{t("🏷️ Tag de redirection")}</h5>
              {tags.find((tg) => tg.id === previewBannerData.tag_id) ? (
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-2">
                  <Tag className="w-4 h-4 text-orange-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-extrabold text-zinc-900 uppercase">
                      {tags.find((tg) => tg.id === previewBannerData.tag_id)?.name}
                    </p>
                    <p className="text-[8px] font-mono text-zinc-400 leading-none mt-0.5">
                      slug: /{tags.find((tg) => tg.id === previewBannerData.tag_id)?.slug}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 font-bold uppercase text-[8px]">
                  {t("Tag orphelin (aucune redirection)")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
