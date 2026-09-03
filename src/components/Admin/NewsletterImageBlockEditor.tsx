import React from "react";
import { Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Link2, FolderOpen } from "lucide-react";
import { NewsletterBlock } from "../../types/newsletter.types";
import { getJustifyClass } from "./Newsletter/newsletterUtils";

interface NewsletterImageBlockEditorProps {
  block: NewsletterBlock;
  updateBlockProperty: (id: string, property: keyof NewsletterBlock, value: string | number) => void;
  onOpenMediaModal: (blockId: string) => void;
  t: (key: string) => string;
}

export const NewsletterImageBlockEditor: React.FC<NewsletterImageBlockEditorProps> = ({
  block: b,
  updateBlockProperty,
  onOpenMediaModal,
  t,
}) => {
  return (
    <div className="space-y-6 text-center">
      {/* Image Preview Window */}
      {b.content ? (
        <div
          className={`flex ${getJustifyClass(b.align || "center")} w-full border border-dashed border-transparent hover:border-orange-500/30 p-2 rounded-2xl transition-all relative group/img`}
        >
          <div className="absolute end-4 top-4 z-10 flex items-center gap-2 opacity-0 group-hover/img:opacity-100 transition-opacity bg-white/95 px-3 py-2 rounded-2xl shadow-lg border border-zinc-200">
            <button
              type="button"
              onClick={() => onOpenMediaModal(b.id)}
              className="text-[9px] font-sans font-bold text-orange-600 uppercase tracking-widest rtl:tracking-normal flex items-center gap-1.5 hover:text-orange-700"
            >
              <ImageIcon className="w-3.5 h-3.5" /> {t("Changer d'image")}
            </button>
          </div>

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
                  className={`${b.rounded || "rounded-2xl"} border border-zinc-100 shadow-md transition-all duration-300 w-full object-cover`}
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
                  className={`${b.rounded || "rounded-2xl"} border border-zinc-100 shadow-md transition-all duration-300 w-full object-cover`}
                  style={{ aspectRatio: b.aspectRatio === "auto" ? "auto" : b.aspectRatio }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => onOpenMediaModal(b.id)}
          className="aspect-video bg-zinc-50 rounded-[2.5rem] flex flex-col items-center justify-center p-8 border-2 border-zinc-200 border-dashed hover:border-orange-500 hover:bg-orange-50/40 transition-all cursor-pointer group/placeholder"
        >
          <div className="w-16 h-16 rounded-2xl bg-white text-zinc-350 group-hover/placeholder:text-orange-500 group-hover/placeholder:scale-110 flex items-center justify-center border border-zinc-250 shadow-sm transition-all duration-300 animate-pulse">
            <ImageIcon className="w-8 h-8 font-sans font-bold" />
          </div>
          <p className="text-zinc-700 font-sans font-bold text-xs uppercase tracking-widest rtl:tracking-normal mt-4">
            {t("Aucune image configurée")}
          </p>
          <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mt-1">
            {t("Sélectionner depuis la médiathèque →")}
          </p>
        </div>
      )}

      {/* Customization Control HUD */}
      <div className="bg-zinc-50/80 border border-zinc-200 p-5 rounded-[2rem] space-y-4 text-start transition-all">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Width Controls */}
          <div className="space-y-2">
            <label className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal block font-mono">
              {t("Largeur dans le Mail (Dim.)")}
            </label>
            <div className="flex bg-white rounded-2xl p-1 border border-zinc-200">
              {[30, 50, 75, 100].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => updateBlockProperty(b.id, "width", w.toString())}
                  className={`flex-1 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider rtl:tracking-normal transition-all ${(b.width || "100") == w.toString() ? "bg-zinc-950 text-white" : "text-zinc-500 hover:text-zinc-900"}`}
                >
                  {w}%
                </button>
              ))}
            </div>
          </div>

          {/* Alignment Controls */}
          <div className="space-y-2">
            <label className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal block font-mono">
              {t("Alignement de l'Image")}
            </label>
            <div className="flex bg-white rounded-2xl p-1 border border-zinc-200">
              {[
                { align: "left", icon: AlignLeft, label: "Gauche" },
                { align: "center", icon: AlignCenter, label: "Centré" },
                { align: "right", icon: AlignRight, label: "Droite" },
              ].map((item) => (
                <button
                  key={item.align}
                  type="button"
                  onClick={() => updateBlockProperty(b.id, "align", item.align)}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center transition-all ${b.align === item.align ? "bg-zinc-950 text-white" : "text-zinc-400 hover:text-zinc-700"}`}
                  title={item.label}
                >
                  <item.icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Aspect Ratio Sizer */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal block font-mono">
              {t("Format & Proportion (Ratios)")}
            </label>
            <select
              value={b.aspectRatio || "auto"}
              onChange={(e) => updateBlockProperty(b.id, "aspectRatio", e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 text-zinc-800 rounded-2xl outline-none font-sans font-bold text-[9px] uppercase tracking-widest rtl:tracking-normal cursor-pointer"
            >
              <option value="auto">{t("Proportion d'Origine")}</option>
              <option value="1/1">{t("Carré (1:1)")}</option>
              <option value="16/9">{t("Paysage (16:9)")}</option>
              <option value="3/1">{t("Bannière Fine (3:1)")}</option>
            </select>
          </div>

          {/* Borders Rounding */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal block font-mono">
              {t("Arrondi d'angles")}
            </label>
            <select
              value={b.rounded || "rounded-2xl"}
              onChange={(e) => updateBlockProperty(b.id, "rounded", e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 text-zinc-800 rounded-2xl outline-none font-sans font-bold text-[9px] uppercase tracking-widest rtl:tracking-normal cursor-pointer"
            >
              <option value="rounded-none">{t("Carré (0px)")}</option>
              <option value="rounded-lg">{t("Léger (rounded-lg)")}</option>
              <option value="rounded-2xl">{t("Moyen (rounded-2xl)")}</option>
              <option value="rounded-[2rem]">{t("Prononcé (32px)")}</option>
            </select>
          </div>
        </div>

        {/* Hyperlink Destination URL */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal block font-mono">
              {t("Url de redirection au clic (Lien)")}
            </label>
            <span className="text-[8px] font-sans font-bold text-zinc-300 uppercase tracking-wider rtl:tracking-normal font-mono">
              {t("Rend l'image liquide")}
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-white border border-zinc-200 rounded-2xl px-4 py-2 flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Lien click-through, ex: /products/ID_PRODUIT ou https://olma.dz/solde"
                className="w-full bg-transparent outline-none text-xs font-semibold text-zinc-800"
                value={b.linkUrl || ""}
                onChange={(e) => updateBlockProperty(b.id, "linkUrl", e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => onOpenMediaModal(b.id)}
              className="px-4 bg-white border border-zinc-200 hover:border-orange-500 hover:bg-orange-50/50 rounded-2xl flex items-center justify-center gap-1.5 transition-all text-[9.5px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-650 hover:text-orange-700"
            >
              <FolderOpen className="w-4 h-4 text-orange-500 shrink-0" /> {t("Médias")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
