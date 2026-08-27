import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, Monitor, Smartphone, X } from "lucide-react";
import { NewsletterBlock } from "../../types/newsletter.types";
import { formatPrice } from "../../utils/format";
import { getJustifyClass, getWidthClass } from "./Newsletter/newsletterUtils";

interface NewsletterDevicePreviewProps {
  previewOpen: boolean;
  setPreviewOpen: (open: boolean) => void;
  view: "desktop" | "mobile";
  setView: (view: "desktop" | "mobile") => void;
  subject: string;
  blocks: NewsletterBlock[];
  t: (key: string) => string;
}

export const NewsletterDevicePreview: React.FC<NewsletterDevicePreviewProps> = ({
  previewOpen,
  setPreviewOpen,
  view,
  setView,
  subject,
  blocks,
  t,
}) => {
  return (
    <AnimatePresence>
      {previewOpen && (
        <div className="fixed inset-0 bg-zinc-950/70 flex items-center justify-center p-4 md:p-8 z-[10000]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-zinc-100 rounded-[3rem] border border-zinc-200/50 shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Preview Header */}
            <div className="p-6 bg-white border-b border-zinc-200/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Eye className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <h3 className="text-base font-sans font-bold text-zinc-950">
                    {t("Aperçu Réaliste de la Newsletter")}
                  </h3>
                  <p className="text-[11px] font-semibold text-zinc-500 mt-0.5">
                    {t("Rendu final de l'e-mail.")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* View device toggle */}
                <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setView("desktop")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[9px] font-black uppercase transition-all ${view === "desktop" ? "bg-zinc-950 text-white shadow-md" : "text-zinc-400 hover:text-zinc-700"}`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> {t("Desktop")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("mobile")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[9px] font-black uppercase transition-all ${view === "mobile" ? "bg-zinc-950 text-white shadow-md" : "text-zinc-400 hover:text-zinc-700"}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> {t("Mobile")}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="p-2.5 bg-zinc-100 text-zinc-500 hover:text-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preview Body Canvas */}
            <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-zinc-200/50">
              <div
                className={`bg-white shadow-xl transition-all duration-500 ${view === "desktop" ? "w-full max-w-2xl" : "w-80"} rounded-2xl overflow-hidden self-start text-center`}
              >
                {/* Email envelope headers mockup */}
                <div className="bg-zinc-50/80 px-8 py-5 border-b border-zinc-100 text-start">
                  <div className="grid grid-cols-[80px_1fr] gap-2 text-xs font-semibold text-zinc-500">
                    <span>{t("De :")}</span>
                    <span className="text-zinc-800 font-bold">
                      {t("Olma Marketplace <newsletter@olma.dz>")}
                    </span>
                    <span>{t("Objet :")}</span>
                    <span className="text-zinc-950 font-sans font-bold">
                      {subject || "(Aucun objet configuré)"}
                    </span>
                  </div>
                </div>

                <div className="p-10 border-b border-zinc-50 flex flex-col items-center">
                  <h1 className="text-2xl font-sans font-bold tracking-tighter rtl:tracking-normal text-zinc-950">
                    {t("OLMA MARKETPLACE")}
                  </h1>
                </div>

                {/* Newsletter content blocks compiled accurately with exact flex wrapping */}
                <div className="p-8 flex flex-wrap gap-6 items-start justify-start min-h-[200px]">
                  {blocks.length === 0 ? (
                    <p className="text-zinc-400 text-xs italic font-semibold text-center py-12 w-full">
                      {t("Aucun contenu à afficher.")}
                    </p>
                  ) : (
                    blocks.map((b) => (
                      <div key={b.id} className={`shrink-0 ${getWidthClass(b.width || "100")}`}>
                        {b.type === "title" && (
                          <h2 className="text-3xl font-sans font-bold text-center tracking-tighter rtl:tracking-normal text-zinc-900 my-4">
                            {b.content}
                          </h2>
                        )}
                        {b.type === "text" && (
                          <p className="text-zinc-650 text-center leading-relaxed font-semibold whitespace-pre-wrap">
                            {b.content}
                          </p>
                        )}
                        {b.type === "image" && b.content && (
                          <div className={`w-full flex ${getJustifyClass(b.align || "center")}`}>
                            {b.linkUrl ? (
                              <a
                                href={b.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block hover:opacity-95 transition-opacity"
                                style={{ width: `${b.width || 100}%` }}
                              >
                                <img
                                  loading="lazy"
                                  src={b.content}
                                  alt={t("Newsletter Design Asset") || "Newsletter Design Asset"}
                                  referrerPolicy="no-referrer"
                                  className={`${b.rounded || "rounded-2xl"} border border-zinc-100 shadow-md w-full object-cover`}
                                  style={{ aspectRatio: b.aspectRatio === "auto" ? "auto" : b.aspectRatio }}
                                />
                              </a>
                            ) : (
                              <div style={{ width: `${b.width || 100}%` }}>
                                <img
                                  loading="lazy"
                                  src={b.content}
                                  alt={t("Newsletter Design Asset") || "Newsletter Design Asset"}
                                  referrerPolicy="no-referrer"
                                  className={`${b.rounded || "rounded-2xl"} border border-zinc-100 shadow-md w-full object-cover`}
                                  style={{ aspectRatio: b.aspectRatio === "auto" ? "auto" : b.aspectRatio }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                        {b.type === "product" && b.productImage && (
                          <div className="bg-white border border-zinc-100 rounded-3xl p-4 shadow-sm hover:shadow-md max-w-sm mx-auto text-start">
                            <div className="aspect-square bg-zinc-50 rounded-2xl overflow-hidden relative border border-zinc-100 mb-4 animate-opacity">
                              <img
                                loading="lazy"
                                src={b.productImage}
                                alt={b.productName}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              {b.productCategory && (
                                <span className="absolute top-2.5 start-2.5 bg-zinc-950 text-white text-[8px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal px-2 py-1 rounded">
                                  {b.productCategory}
                                </span>
                              )}
                            </div>
                            <h4 className="text-zinc-950 text-xs font-sans font-bold tracking-tight rtl:tracking-normal line-clamp-2">
                              {b.productName}
                            </h4>
                            <div className="mt-2.5 flex items-center justify-between">
                              <span className="text-xs font-mono font-sans font-bold text-orange-600">
                                {formatPrice(b.productPrice || 0)}
                              </span>
                              <span className="text-[9px] font-sans font-bold text-white bg-orange-600 px-3.5 py-1.5 rounded-xl uppercase tracking-wider rtl:tracking-normal transition-all hover:bg-orange-700 shadow-md shadow-orange-500/10 cursor-pointer">
                                {t("Acheter")}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="p-10 bg-zinc-50 border-t border-zinc-100 text-center">
                  <p className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal leading-relaxed">
                    {t("© 2026 Olma Marketplace Algérie.")}
                    <br />
                    {t("Vous recevez ce mail car vous êtes inscrit sur Olma.")}
                  </p>
                  <button className="mt-6 text-[8px] font-extrabold text-zinc-300 uppercase tracking-widest rtl:tracking-normal underline underline-offset-4">
                    {t("Se désabonner")}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
