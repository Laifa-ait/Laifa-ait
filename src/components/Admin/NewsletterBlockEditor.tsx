import React from "react";
import { Trash2 } from "lucide-react";
import { NewsletterBlock } from "../../types/newsletter.types";
import { getWidthClass } from "./Newsletter/newsletterUtils";
import { NewsletterImageBlockEditor } from "./NewsletterImageBlockEditor";
import { NewsletterProductBlockEditor } from "./NewsletterProductBlockEditor";

interface NewsletterBlockEditorProps {
  block: NewsletterBlock;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, content: string) => void;
  updateBlockProperty: (id: string, property: keyof NewsletterBlock, value: string | number) => void;
  onOpenMediaModalForImage: (id: string) => void;
  onOpenMediaModalForProduct: (id: string) => void;
  t: (key: string) => string;
}

export const NewsletterBlockEditor: React.FC<NewsletterBlockEditorProps> = ({
  block: b,
  removeBlock,
  updateBlock,
  updateBlockProperty,
  onOpenMediaModalForImage,
  onOpenMediaModalForProduct,
  t,
}) => {
  return (
    <div
      className={`relative group border border-transparent hover:border-zinc-100 rounded-[2rem] p-4 transition-all shrink-0 ${getWidthClass(b.width || "100")}`}
    >
      <div className="absolute -start-4 -top-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={() => removeBlock(b.id)}
          className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-md border border-red-100"
          title={t("Supprimer ce bloc") || "Supprimer ce bloc"}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {b.type === "title" && (
        <div className="space-y-4">
          <input
            className="w-full text-3xl font-sans font-bold text-center tracking-tighter rtl:tracking-normal outline-none mb-1 text-zinc-900 placeholder-zinc-300 bg-transparent"
            value={b.content}
            placeholder={t("Titre de section...") || "Titre de section..."}
            onChange={(e) => updateBlock(b.id, e.target.value)}
          />
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-50/50 border border-zinc-150 p-2.5 rounded-2xl flex items-center justify-between gap-4">
            <span className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-wider rtl:tracking-normal">
              {t("Largeur")}
            </span>
            <div className="flex bg-white rounded-lg p-0.5 border border-zinc-200 w-48 shrink-0">
              {[30, 50, 75, 100].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => updateBlockProperty(b.id, "width", w.toString())}
                  className={`flex-1 py-1 rounded-md font-black text-[9px] uppercase tracking-wider rtl:tracking-normal transition-all ${(b.width || "100") == w.toString() ? "bg-zinc-950 text-white" : "text-zinc-500 hover:text-zinc-900"}`}
                >
                  {w}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {b.type === "text" && (
        <div className="space-y-4">
          <textarea
            rows={3}
            className="w-full text-zinc-500 text-center leading-relaxed font-semibold outline-none resize-none bg-transparent"
            value={b.content}
            placeholder={
              t("Écrivez le message de votre campagne ici...") ||
              "Écrivez le message de votre campagne ici..."
            }
            onChange={(e) => updateBlock(b.id, e.target.value)}
          />
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-50/50 border border-zinc-150 p-2.5 rounded-2xl flex items-center justify-between gap-4">
            <span className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-wider rtl:tracking-normal">
              {t("Largeur")}
            </span>
            <div className="flex bg-white rounded-lg p-0.5 border border-zinc-200 w-48 shrink-0">
              {[30, 50, 75, 100].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => updateBlockProperty(b.id, "width", w.toString())}
                  className={`flex-1 py-1 rounded-md font-black text-[9px] uppercase tracking-wider rtl:tracking-normal transition-all ${(b.width || "100") == w.toString() ? "bg-zinc-950 text-white" : "text-zinc-500 hover:text-zinc-900"}`}
                >
                  {w}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {b.type === "image" && (
        <NewsletterImageBlockEditor
          block={b}
          updateBlockProperty={updateBlockProperty}
          onOpenMediaModal={onOpenMediaModalForImage}
          t={t}
        />
      )}

      {b.type === "product" && (
        <NewsletterProductBlockEditor
          block={b}
          updateBlockProperty={updateBlockProperty}
          onOpenMediaModal={onOpenMediaModalForProduct}
          t={t}
        />
      )}
    </div>
  );
};
