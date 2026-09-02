import React, { useState } from "react";
import { Monitor, Tablet, Smartphone, Sparkles, Zap, MapPin, ArrowRight, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HomepageSection } from "../../../domains/home/homepage.types";
import { Product } from "../../../domains/product/product.types";
import { formatPrice } from "../../../utils/format";

interface HomepageLivePreviewProps {
  sections: HomepageSection[];
  allProducts: Product[];
  onClose?: () => void;
}

export const HomepageLivePreview: React.FC<HomepageLivePreviewProps> = ({
  sections,
  allProducts,
  onClose,
}) => {
  const { t } = useTranslation();
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [selectedWilaya, setSelectedWilaya] = useState("Toutes");

  const activeSections = sections
    .filter((s) => s.isActive)
    .sort((a, b) => (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0));

  const getDeviceWidthClass = () => {
    switch (device) {
      case "mobile":
        return "w-[375px] min-h-[667px]";
      case "tablet":
        return "w-[768px] min-h-[800px]";
      default:
        return "w-full max-w-[1100px] min-h-[800px]";
    }
  };

  const getSectionProducts = (section: HomepageSection) => {
    if (section.manualProducts && section.manualProducts.length > 0) {
      return allProducts.filter((p) => section.manualProducts?.includes(p.id));
    }
    if (section.category) {
      return allProducts.filter((p) => p.category === section.category).slice(0, section.limit || 8);
    }
    return allProducts.slice(0, section.limit || 8);
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-6" id="homepage-live-preview">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              {t("Simulateur Storefront 2026 en Direct")}
              <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {t("Visualisez le rendu exact tel que vos clients le voient en Algérie")}
            </p>
          </div>
        </div>

        {/* Device Switcher & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                device === "desktop" ? "bg-amber-500 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Bureau"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDevice("tablet")}
              className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                device === "tablet" ? "bg-amber-500 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Tablette"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                device === "mobile" ? "bg-amber-500 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="Toutes" className="bg-slate-800">Toutes les wilayas</option>
              <option value="16 - Alger" className="bg-slate-800">16 - Alger</option>
              <option value="31 - Oran" className="bg-slate-800">31 - Oran</option>
              <option value="25 - Constantine" className="bg-slate-800">25 - Constantine</option>
              <option value="19 - Sétif" className="bg-slate-800">19 - Sétif</option>
            </select>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              {t("Fermer")}
            </button>
          )}
        </div>
      </div>

      {/* Simulator Device Frame */}
      <div className="flex justify-center p-4 bg-slate-950/60 rounded-2xl overflow-x-auto">
        <div className={`${getDeviceWidthClass()} bg-[#FAF8F5] text-slate-900 rounded-2xl shadow-2xl transition-all duration-300 border-4 border-slate-800 overflow-hidden flex flex-col`}>
          {/* Header */}
          <div className="bg-slate-200 px-4 py-2 flex items-center justify-between border-b border-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="text-[10px] font-mono text-slate-600 bg-white/70 px-4 py-0.5 rounded-md border border-slate-300/60 truncate max-w-[200px] sm:max-w-xs">
              https://olmart.dz/{selectedWilaya !== "Toutes" ? `?wilaya=${selectedWilaya}` : ""}
            </div>
            <div className="w-6" />
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 space-y-6 max-h-[700px] overflow-y-auto">
            <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-amber-950 text-white p-6 shadow-md relative overflow-hidden">
              <div className="relative z-10 max-w-md space-y-2">
                <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-amber-400 text-slate-950 inline-block">
                  Édition 2026
                </span>
                <h2 className="text-xl sm:text-2xl font-bold">Le Meilleur du Commerce Algérien</h2>
                <p className="text-xs text-slate-300">Livraison 58 wilayas garantie & paiement à la livraison</p>
              </div>
            </div>

            {activeSections.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Sparkles className="w-8 h-8 mx-auto text-amber-500 mb-2 opacity-50" />
                <p className="text-xs font-semibold">{t("Aucune section active configurée.")}</p>
              </div>
            ) : (
              activeSections.map((section, idx) => {
                const prods = getSectionProducts(section);
                return (
                  <div key={section.id || idx} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          {section.type === "flash_sale" && <Zap className="w-4 h-4 text-rose-500 fill-rose-500" />}
                          <h4 className="font-bold text-slate-900 text-sm">{section.title || section.name}</h4>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{section.type}</span>
                        </div>
                        {section.subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{section.subtitle}</p>}
                      </div>
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                        Voir tout <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {prods.length === 0 ? (
                        <div className="col-span-full py-4 text-center text-xs text-slate-400">
                          {t("En attente de produits correspondant aux critères...")}
                        </div>
                      ) : (
                        prods.slice(0, 4).map((p) => (
                          <div key={p.id} className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/60 flex flex-col justify-between space-y-2">
                            <div className="aspect-square bg-slate-200 rounded-lg overflow-hidden relative">
                              {p.images && p.images[0] ? (
                                <img loading="lazy" decoding="async" src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Img</div>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</p>
                              <p className="text-[11px] font-extrabold text-amber-600 mt-0.5">{formatPrice(p.price)} DZD</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
