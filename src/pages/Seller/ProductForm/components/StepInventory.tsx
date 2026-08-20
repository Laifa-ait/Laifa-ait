import React from "react";
import { useTranslation } from "react-i18next";
import { ListTree } from "lucide-react";
import { motion } from "motion/react";
import { ProductFormData, ProductVariant } from "../../../../types/seller";

interface StepInventoryProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  activeStep: number;
  setActiveStep: (step: number) => void;
}

export const StepInventory: React.FC<StepInventoryProps> = ({
  formData,
  setFormData,
  setActiveStep,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div className="space-y-1 flex items-center justify-between">
        <div>
          <h4 className="text-xl font-bold text-slate-900">{t("Inventaire Détaillé")}</h4>
          <p className="text-sm text-slate-500">{t("Gérez le stock, les prix spéciaux et les SKU par déclinaison.")}</p>
        </div>
      </div>

      {formData.variants && formData.variants.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3 p-4 bg-[#FFFBF5] border border-[#E5DED4] rounded-2xl">
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase text-slate-500 mb-1">{t("Appliquer à toutes les variantes :")}</label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 bg-white border border-[#E5DED4] rounded-xl px-3 py-2 w-32 focus-within:border-[#C75C1A] transition-all">
                  <input type="number" id="bulk-stock" placeholder={t("Stock") || "Stock"} className="w-full text-xs font-bold outline-none bg-transparent" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const val = (document.getElementById("bulk-stock") as HTMLInputElement)?.value;
                    if (!val) return;
                    setFormData((prev) => ({
                      ...prev,
                      variants: prev.variants.map((v) => ({ ...v, stock: val })),
                    }));
                  }}
                  className="px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t("Appliquer")}
                </button>
              </div>
            </div>
            <div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 bg-white border border-[#E5DED4] rounded-xl px-3 py-2 w-32 focus-within:border-[#C75C1A] transition-all">
                  <input type="number" id="bulk-price" placeholder={t("Prix (DA)") || "Prix (DA)"} className="w-full text-xs font-bold outline-none bg-transparent" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const val = (document.getElementById("bulk-price") as HTMLInputElement)?.value;
                    if (!val) return;
                    setFormData((prev) => ({
                      ...prev,
                      variants: prev.variants.map((v) => ({ ...v, priceOverride: val })),
                    }));
                  }}
                  className="px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t("Appliquer")}
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E5DED4] shadow-sm">
            <table className="w-full text-start text-sm whitespace-nowrap">
              <thead className="bg-[#FFFBF5] border-b border-[#E5DED4] text-slate-500 uppercase tracking-widest rtl:tracking-normal text-[10px] font-sans font-bold">
                <tr>
                  <th className="px-5 py-4 w-12">{t("Actif")}</th>
                  <th className="px-5 py-4 w-16">{t("Image")}</th>
                  <th className="px-5 py-4">{t("Variante")}</th>
                  <th className="px-5 py-4 w-32">{t("SKU (Optionnel)")}</th>
                  <th className="px-5 py-4 w-32">{t("Stock")}</th>
                  <th className="px-5 py-4 w-40">{t("Prix Spécifique (DA)")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {formData.variants.map((v: ProductVariant, i: number) => {
                  return (
                    <tr key={i} className={`hover:bg-[#FFFBF5]/50 transition-colors ${v.isActive === false ? "opacity-50" : ""}`}>
                      <td className="px-5 py-3">
                        <input
                          type="checkbox"
                          checked={v.isActive !== false}
                          onChange={(e) => {
                            setFormData((prev) => {
                              const nw = [...prev.variants];
                              nw[i] = { ...nw[i], isActive: e.target.checked };
                              return { ...prev, variants: nw };
                            });
                          }}
                          className="w-4 h-4 rounded text-[#C75C1A] cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <select
                          className="w-14 h-14 bg-[#FFFBF5] border border-[#E5DED4] rounded-lg text-xs outline-none focus:border-[#C75C1A]"
                          value={v.imageIndex ?? ""}
                          onChange={(e) => {
                            const idx = e.target.value === "" ? null : parseInt(e.target.value, 10);
                            setFormData((prev) => {
                              const nw = [...prev.variants];
                              nw[i] = { ...nw[i], imageIndex: idx };
                              return { ...prev, variants: nw };
                            });
                          }}
                        >
                          <option value="">-</option>
                          {formData.images.map((img: string, idx: number) => (img ? <option key={idx} value={idx}>Img {idx + 1}</option> : null))}
                        </select>
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-900">
                        <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs border border-[#E5DED4]">{v.name}</span>
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-white border border-[#E5DED4] rounded-lg outline-none font-medium text-xs focus:border-[#C75C1A] disabled:bg-[#FFFBF5]"
                          placeholder={t("SKU-...") || "SKU-..."}
                          value={v.sku || ""}
                          disabled={v.isActive === false}
                          onChange={(e) => {
                            const str = e.target.value;
                            setFormData((prev) => {
                              const nw = [...prev.variants];
                              nw[i] = { ...nw[i], sku: str };
                              return { ...prev, variants: nw };
                            });
                          }}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div
                          className={`flex items-center gap-1.5 bg-white border border-[#E5DED4] rounded-lg px-2 py-1.5 focus-within:border-[#C75C1A] transition-all ${
                            v.isActive === false ? "bg-[#FFFBF5] opacity-50" : ""
                          }`}
                        >
                          <span className="text-[9px] font-sans font-bold text-emerald-600 uppercase tracking-widest rtl:tracking-normal">{t("Stock:")}</span>
                          <input
                            type="number"
                            className="flex-1 w-12 text-center text-xs font-bold text-slate-900 outline-none bg-transparent"
                            placeholder="0"
                            value={v.stock}
                            disabled={v.isActive === false}
                            onChange={(e) => {
                              const str = e.target.value;
                              setFormData((prev) => {
                                const nw = [...prev.variants];
                                nw[i] = { ...nw[i], stock: str };
                                return { ...prev, variants: nw };
                              });
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-3 pr-5">
                        <input
                          type="number"
                          className="w-full px-3 py-2 bg-white border border-[#E5DED4] rounded-lg outline-none font-medium text-xs focus:border-[#C75C1A] disabled:bg-[#FFFBF5] placeholder:text-slate-300"
                          placeholder={t("Prix différent...") || "Prix différent..."}
                          value={v.priceOverride || ""}
                          disabled={v.isActive === false}
                          onChange={(e) => {
                            const str = e.target.value;
                            setFormData((prev) => {
                              const nw = [...prev.variants];
                              nw[i] = { ...nw[i], priceOverride: str };
                              return { ...prev, variants: nw };
                            });
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-[#FFFBF5] border border-[#E5DED4] rounded-2xl flex flex-col items-center">
          <ListTree className="w-8 h-8 text-slate-300 mb-4" />
          <h5 className="font-bold text-slate-700 mb-1">{t("Aucune variante générée")}</h5>
          <p className="text-sm text-slate-500 mb-4">{t("Retournez à l'étape \"Variantes\" pour configurer les tailles et couleurs.")}</p>
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className="px-6 py-2 bg-white border border-[#E5DED4] text-slate-700 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-100 cursor-pointer"
          >
            {t("Aller aux Variantes")}
          </button>
        </div>
      )}

      {(!formData.variants || formData.variants.length === 0) && (
        <div className="pt-6 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-600 mb-2">{t("Stock Global (Produit sans variante)")}</label>
          <div className="flex items-center gap-1.5 bg-white border border-[#E5DED4] rounded-xl px-4 py-2 w-full md:w-1/3 focus-within:border-[#C75C1A] transition-all shadow-sm">
            <span className="text-[11px] font-sans font-bold text-emerald-600 uppercase tracking-widest rtl:tracking-normal">{t("Stock:")}</span>
            <input
              required
              type="number"
              className="flex-1 text-center text-sm font-bold text-slate-900 outline-none bg-transparent"
              value={formData.stock || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

