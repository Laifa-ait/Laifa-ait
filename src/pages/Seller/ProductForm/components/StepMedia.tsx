import React from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Upload, X, Video } from "lucide-react";
import { motion } from "motion/react";
import { ProductFormData } from "../../../../types/seller";

interface StepMediaProps {
  formData: ProductFormData;
  uploading: Record<string, boolean>;
  uploadProgress: Record<string, number>;
  dragOverImageIdx: number | null;
  draggedImageIdx: number | null;
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video", index?: number) => Promise<void>;
  updateImage: (index: number, val: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
}

export const StepMedia: React.FC<StepMediaProps> = ({
  formData,
  uploading,
  uploadProgress,
  dragOverImageIdx,
  draggedImageIdx,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  handleFileUpload,
  updateImage,
  setFormData,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div className="space-y-1">
        <h4 className="text-xl font-bold text-slate-900">{t("Médias du Produit")}</h4>
        <p className="text-sm text-slate-500">{t("Ajoutez des photos de haute qualité (Max 8 images, 1 vidéo).")}</p>
      </div>

      {Object.values(uploading).some(Boolean) && (
        <div className="flex items-center gap-3 p-4 bg-[#C75C1A]/5 border border-[#C75C1A]/20 text-[#C75C1A] rounded-2xl animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider rtl:tracking-normal">{t("Transfert de médias en cours... Veuillez patienter")}</span>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-semibold text-slate-900">{t("Galerie Photos")}</label>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{t("PNG/JPG • Max 5Mo")}</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {formData.images.map((img: string, i: number) => {
              return (
                <label
                  key={i}
                  draggable={!!img}
                  onDragStart={(e) => (img ? handleDragStart(e, i) : undefined)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDrop={(e) => handleDrop(e, i)}
                  onDragEnd={handleDragEnd}
                  className={`relative cursor-pointer group bg-[#FFFBF5] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${
                    i === 0 ? "aspect-square md:col-span-2 md:row-span-2" : "aspect-square"
                  } ${img ? "border-[#E5DED4] shadow-sm" : "border-[#E5DED4] hover:border-[#C75C1A] hover:bg-[#C75C1A]/5"} ${
                    dragOverImageIdx === i ? "border-[#C75C1A] bg-[#C75C1A]/10 scale-[1.02]" : ""
                  } ${draggedImageIdx === i ? "opacity-50" : ""}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "image", i)}
                    disabled={uploading[`image-${i}`]}
                  />
                  {uploading[`image-${i}`] ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-6 h-6 text-[#C75C1A] animate-spin mb-2" />
                      <span className="text-[10px] font-bold text-[#C75C1A]">{uploadProgress[`image-${i}`] || 0}%</span>
                    </div>
                  ) : img ? (
                    <>
                      <img loading="lazy" alt="" src={img} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded">
                          {t("Vignette Principale")}
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-[#C75C1A] p-4 text-center">
                      <Upload className={i === 0 ? "w-8 h-8" : "w-5 h-5"} />
                      {i === 0 ? (
                        <div>
                          <p className="font-bold text-sm">{t("Image Principale")}</p>
                          <p className="text-xs opacity-70">{t("Sera utilisée comme miniature")}</p>
                        </div>
                      ) : (
                        <p className="font-bold text-xs">
                          {t("Image")}
                          {i + 1}
                        </p>
                      )}
                    </div>
                  )}
                  {img && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        updateImage(i, "");
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur border border-[#E5DED4] rounded-full flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-white shadow-sm transition-all z-10 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-semibold text-slate-900">{t("Vidéo de Présentation")}</label>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{t("MP4 • Max 10Mo")}</span>
          </div>
          <label className="relative block w-full py-8 cursor-pointer overflow-hidden border-2 border-[#E5DED4] bg-[#FFFBF5] rounded-2xl group border-dashed hover:border-[#C75C1A] hover:bg-[#C75C1A]/5 transition-all text-center">
            <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, "video")} disabled={uploading.video} />
            {uploading.video ? (
              <div className="flex flex-col items-center text-[#C75C1A]">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-xs font-bold font-medium mb-1">{t("Envoi en cours...")}</span>
                <div className="w-48 h-2 bg-[#C75C1A]/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#C75C1A] transition-all duration-300" style={{ width: `${uploadProgress.video || 0}%` }} />
                </div>
                <span className="text-[10px] font-bold mt-1 text-[#C75C1A]">{uploadProgress.video || 0}%</span>
              </div>
            ) : formData.video ? (
              <div className="flex flex-col items-center text-emerald-600">
                <Video className="w-8 h-8 mb-2" />
                <span className="text-sm font-bold">{t("Vidéo importée avec succès")}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setFormData((prev) => ({ ...prev, video: "" }));
                  }}
                  className="mt-3 px-4 py-1.5 bg-white border border-[#E5DED4] text-slate-600 rounded-lg text-xs font-bold hover:text-red-500 cursor-pointer"
                >
                  {t("Supprimer")}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-500 group-hover:text-[#C75C1A]">
                <Video className="w-8 h-8 mb-2" />
                <span className="text-sm font-bold">{t("Glissez ou cliquez pour importer")}</span>
              </div>
            )}
          </label>
        </div>
      </div>
    </motion.div>
  );
};

