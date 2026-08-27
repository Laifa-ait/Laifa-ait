import React from "react";
import { ShoppingBag, FolderOpen, Link2 } from "lucide-react";
import { NewsletterBlock } from "../../types/newsletter.types";
import { formatPrice } from "../../utils/format";

interface NewsletterProductBlockEditorProps {
  block: NewsletterBlock;
  updateBlockProperty: (id: string, property: keyof NewsletterBlock, value: string | number) => void;
  onOpenMediaModal: (blockId: string) => void;
  t: (key: string) => string;
}

export const NewsletterProductBlockEditor: React.FC<NewsletterProductBlockEditorProps> = ({
  block: b,
  updateBlockProperty,
  onOpenMediaModal,
  t,
}) => {
  return (
    <div className="space-y-6 text-center">
      {b.productImage ? (
        <div className="bg-white border border-zinc-100 rounded-3xl p-4 transition-all hover:shadow-md max-w-sm mx-auto">
          <div className="aspect-square bg-zinc-50 rounded-2xl overflow-hidden relative border border-zinc-100 mb-4 group/img">
            <div className="absolute end-3 top-3 z-10 opacity-0 group-hover/img:opacity-100 transition-opacity bg-white/95 px-3 py-1.5 rounded-lg shadow-sm border border-zinc-200">
              <button
                type="button"
                onClick={() => onOpenMediaModal(b.id)}
                className="text-[9px] font-sans font-bold text-orange-600 uppercase tracking-widest rtl:tracking-normal flex items-center gap-1 hover:text-orange-700"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> {t("Changer")}
              </button>
            </div>
            <img
              loading="lazy"
              src={b.productImage}
              alt={b.productName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {b.productCategory && (
              <span className="absolute top-3 start-3 bg-zinc-950 text-white text-[8px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal px-2 py-1 rounded">
                {b.productCategory}
              </span>
            )}
          </div>
          <h4 className="text-zinc-950 text-sm font-sans font-bold tracking-tight rtl:tracking-normal line-clamp-2 text-start">
            {b.productName}
          </h4>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-mono font-sans font-bold text-orange-600">
              {formatPrice(b.productPrice || 0)}
            </span>
            <span className="text-[9px] font-sans font-bold uppercase text-zinc-400">{t("Olma.dz")}</span>
          </div>

          {/* Click Redirect Link indicator */}
          {b.linkUrl && (
            <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center gap-2 text-[9px] font-mono text-zinc-400">
              <Link2 className="w-3.5 h-3.5 text-zinc-300 pointer-events-none" />
              <span className="truncate max-w-xs">{b.linkUrl}</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => onOpenMediaModal(b.id)}
          className="aspect-square max-w-xs mx-auto bg-zinc-50 rounded-[2.5rem] flex flex-col items-center justify-center p-8 border-2 border-zinc-200 border-dashed hover:border-orange-500 hover:bg-orange-50/40 transition-all cursor-pointer group/placeholder animate-pulse"
        >
          <div className="w-16 h-16 rounded-2xl bg-white text-zinc-350 group-hover/placeholder:text-orange-500 group-hover/placeholder:scale-110 flex items-center justify-center border border-zinc-250 shadow-sm transition-all duration-300">
            <ShoppingBag className="w-8 h-8 font-sans font-bold" />
          </div>
          <p className="text-zinc-700 font-sans font-bold text-xs uppercase tracking-widest rtl:tracking-normal mt-4">
            {t("Aucun produit configuré")}
          </p>
          <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mt-1">
            {t("Sélectionner depuis le catalogue d'Olma →")}
          </p>
        </div>
      )}

      {/* HUD for Product Customization */}
      <div className="bg-zinc-50/80 border border-zinc-200 p-5 rounded-[2rem] space-y-4 text-start transition-all">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal block font-mono">
              {t("Largeur du Produit (Dim.)")}
            </label>
            <div className="flex bg-white rounded-xl p-1 border border-zinc-200">
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
          <div className="space-y-2 flex flex-col justify-end">
            <button
              type="button"
              onClick={() => onOpenMediaModal(b.id)}
              className="w-full py-3 bg-white border border-zinc-200 hover:border-orange-500 hover:bg-orange-50 rounded-xl flex items-center justify-center gap-1.5 transition-all text-[9.5px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-650 hover:text-orange-700"
            >
              <FolderOpen className="w-4 h-4 text-orange-500 shrink-0" /> {t("Changer de Produit")}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal block font-mono">
            {t("Lien hypertexte personnalisé (optionnel)")}
          </label>
          <div className="bg-white border border-zinc-200 rounded-xl px-4 py-2 flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder={t("Ex: /products/ID_PRODUIT") || "Ex: /products/ID_PRODUIT"}
              className="w-full bg-transparent outline-none text-xs font-semibold text-zinc-800"
              value={b.linkUrl || ""}
              onChange={(e) => updateBlockProperty(b.id, "linkUrl", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
