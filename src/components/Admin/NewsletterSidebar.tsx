import React from "react";
import { Sparkles, Layout, Type, Image as ImageIcon, ShoppingBag } from "lucide-react";

interface NewsletterSidebarProps {
  addBlock: (type: string) => void;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  generateWithAi: () => void;
  generating: boolean;
  t: (key: string) => string;
}

export const NewsletterSidebar: React.FC<NewsletterSidebarProps> = ({
  addBlock,
  aiPrompt,
  setAiPrompt,
  generateWithAi,
  generating,
  t,
}) => {
  return (
    <div className="space-y-8">
      {/* Available Blocks Palette */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8">
        <h4 className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-6">
          {t("Blocs Disponibles")}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { type: "title", icon: Type, label: "Titre" },
            { type: "text", icon: Layout, label: "Paragraphe" },
            { type: "image", icon: ImageIcon, label: "Image" },
            { type: "product", icon: ShoppingBag, label: "Produit" },
          ].map((b) => (
            <button
              key={b.type}
              onClick={() => addBlock(b.type)}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-orange-500 hover:bg-orange-50 transition-all group"
            >
              <b.icon className="w-6 h-6 text-zinc-400 group-hover:text-orange-500 transition-colors" />
              <span className="text-[9px] font-sans font-bold uppercase text-zinc-400 group-hover:text-orange-700">
                {b.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Gemini AI Assistant */}
      <div className="bg-zinc-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 end-0 w-32 h-32 bg-orange-500/20 rounded-full -me-10 -mt-10" />
        <h4 className="text-[10px] font-sans font-bold text-zinc-500 uppercase tracking-widest rtl:tracking-normal mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-500" /> {t("Assistant IA Gemini")}
        </h4>
        <textarea
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium outline-none focus:border-orange-500 mb-4 text-white"
          placeholder={
            t("Décrivez l'e-mail à rédiger (ex: Promo Aïd)...") || "Décrivez l'e-mail à rédiger (ex: Promo Aïd)..."
          }
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
        />
        <button
          onClick={generateWithAi}
          disabled={generating}
          className="w-full bg-white text-zinc-950 py-4 rounded-xl font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50"
        >
          {generating ? "IA en cours..." : "Rédiger la Newsletter"}
        </button>
      </div>
    </div>
  );
};
