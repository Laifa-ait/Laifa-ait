import React from "react";
import { Monitor, Smartphone, Plus } from "lucide-react";
import { NewsletterBlock } from "../../types/newsletter.types";
import { NewsletterBlockEditor } from "./NewsletterBlockEditor";

interface NewsletterCanvasProps {
  subject: string;
  setSubject: (subject: string) => void;
  view: "desktop" | "mobile";
  setView: (view: "desktop" | "mobile") => void;
  blocks: NewsletterBlock[];
  removeBlock: (id: string) => void;
  updateBlock: (id: string, content: string) => void;
  updateBlockProperty: (id: string, property: keyof NewsletterBlock, value: string | number) => void;
  onOpenMediaModalForImage: (id: string) => void;
  onOpenMediaModalForProduct: (id: string) => void;
  t: (key: string) => string;
}

export const NewsletterCanvas: React.FC<NewsletterCanvasProps> = ({
  subject,
  setSubject,
  view,
  setView,
  blocks,
  removeBlock,
  updateBlock,
  updateBlockProperty,
  onOpenMediaModalForImage,
  onOpenMediaModalForProduct,
  t,
}) => {
  return (
    <div className="bg-white border border-zinc-100 rounded-[3.5rem] shadow-sm overflow-hidden flex flex-col min-h-[800px]">
      {/* Editor Header */}
      <div className="p-8 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex-1 max-w-lg">
          <p className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-1.5 ms-1">
            {t("Objet de l'e-mail")}
          </p>
          <input
            type="text"
            placeholder={t("Ex: Prêts pour l'été ?") || "Ex: Prêts pour l'été ?"}
            className="w-full bg-white border border-zinc-200 rounded-xl px-5 py-3 font-sans font-bold text-zinc-950 outline-none focus:border-orange-500 transition-colors"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-zinc-100">
          <button
            onClick={() => setView("desktop")}
            className={`px-4 py-2.5 rounded flex items-center gap-2 text-[10px] font-black uppercase transition-all ${view === "desktop" ? "bg-zinc-950 text-white shadow-md" : "text-zinc-400 hover:text-zinc-700"}`}
          >
            <Monitor className="w-3.5 h-3.5" /> {t("Desktop")}
          </button>
          <button
            onClick={() => setView("mobile")}
            className={`px-4 py-2.5 rounded flex items-center gap-2 text-[10px] font-black uppercase transition-all ${view === "mobile" ? "bg-zinc-950 text-white shadow-md" : "text-zinc-400 hover:text-zinc-700"}`}
          >
            <Smartphone className="w-3.5 h-3.5" /> {t("Mobile")}
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 bg-zinc-100/50 p-6 md:p-12 overflow-y-auto">
        <div
          className={`mx-auto bg-white shadow-2xl transition-all duration-500 ${view === "desktop" ? "w-full max-w-2xl" : "w-80"} min-h-full rounded-2xl overflow-hidden`}
        >
          {/* Template Brand Header */}
          <div className="p-10 border-b border-zinc-50 flex flex-col items-center">
            <h1 className="text-2xl font-sans font-bold tracking-tighter rtl:tracking-normal text-zinc-950">
              {t("OLMA MARKETPLACE")}
            </h1>
          </div>

          {/* Content Blocks List */}
          <div className="p-8 flex flex-wrap gap-6 items-start justify-start min-h-[400px]">
            {blocks.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-zinc-200 rounded-3xl w-full">
                <Plus className="w-10 h-10 text-zinc-300 mx-auto mb-4 animate-bounce" />
                <p className="text-zinc-500 font-sans font-bold uppercase text-[10px] tracking-widest rtl:tracking-normal">
                  {t("Ajoutez des blocs pour commencer")}
                </p>
                <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-widest rtl:tracking-normal mt-1">
                  {t("Utilisez le panneau de gauche")}
                </p>
              </div>
            )}
            {blocks.map((b) => (
              <NewsletterBlockEditor
                key={b.id}
                block={b}
                removeBlock={removeBlock}
                updateBlock={updateBlock}
                updateBlockProperty={updateBlockProperty}
                onOpenMediaModalForImage={onOpenMediaModalForImage}
                onOpenMediaModalForProduct={onOpenMediaModalForProduct}
                t={t}
              />
            ))}
          </div>

          {/* Template Footer */}
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
    </div>
  );
};
