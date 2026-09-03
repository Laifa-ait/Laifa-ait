import React from "react";
import { Edit2, Loader2, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "../../../domains/product/product.types";

interface CurationProductEditFormProps {
  editForm: Omit<Partial<Product>, "promoPrice"> & { promoPrice?: number | string };
  setEditForm: React.Dispatch<React.SetStateAction<(Omit<Partial<Product>, "promoPrice"> & { promoPrice?: number | string }) | null>>;
  hierarchy: Record<string, Record<string, unknown>>;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const CurationProductEditForm: React.FC<CurationProductEditFormProps> = ({
  editForm,
  setEditForm,
  hierarchy,
  isSaving,
  onCancel,
  onSave,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-amber-400 shadow-md space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2">
          <Edit2 className="w-5 h-5 text-[#ea580c]" />
          <h3 className="font-sans font-bold text-xs text-zinc-900 uppercase tracking-widest">
            {t("Éditeur de Fiche Produit")}
          </h3>
        </div>
        <span className="text-[10px] text-amber-600 font-sans font-bold uppercase bg-amber-50 px-2 py-0.5 rounded-lg">
          {t("Modifications en direct")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-wider">
            {t("Titre de l'annonce")}
          </label>
          <input
            type="text"
            value={editForm.name || ""}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            className="w-full text-xs px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-[#ea580c] font-bold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-wider">
            {t("Prix Standard (DA)")}
          </label>
          <input
            type="number"
            value={editForm.price ?? 0}
            onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
            className="w-full text-xs px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-[#ea580c] font-bold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-wider">
            {t("Prix Promotionnel (Optionnel)")}
          </label>
          <input
            type="number"
            value={editForm.promoPrice ?? ""}
            onChange={(e) => setEditForm({ ...editForm, promoPrice: e.target.value ? Number(e.target.value) : "" })}
            className="w-full text-xs px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-[#ea580c] font-bold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-wider">
            {t("Stock initial")}
          </label>
          <input
            type="number"
            value={editForm.stock ?? 0}
            onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
            className="w-full text-xs px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-[#ea580c] font-bold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-wider">
            {t("Région de livraison (Wilaya)")}
          </label>
          <input
            type="text"
            value={editForm.wilaya || ""}
            onChange={(e) => setEditForm({ ...editForm, wilaya: e.target.value })}
            className="w-full text-xs px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-[#ea580c] font-bold"
            placeholder="Alger, Oran..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-wider">
            {t("Catégorie")}
          </label>
          <select
            value={editForm.category || ""}
            onChange={(e) => {
              const newCat = e.target.value;
              const subcatList = Object.keys(hierarchy[newCat] || {});
              setEditForm({
                ...editForm,
                category: newCat,
                subcategory: subcatList[0] || "",
              });
            }}
            className="w-full text-xs px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-[#ea580c] font-bold"
          >
            {Object.keys(hierarchy).map((catName) => (
              <option key={catName} value={catName}>
                {catName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-wider">
            {t("Sous-catégorie")}
          </label>
          <select
            value={editForm.subcategory || ""}
            onChange={(e) => setEditForm({ ...editForm, subcategory: e.target.value })}
            className="w-full text-xs px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-[#ea580c] font-bold"
          >
            <option value="">-- {t("Aucune")} --</option>
            {Object.keys(editForm.category ? hierarchy[editForm.category] || {} : {}).map((subName) => (
              <option key={subName} value={subName}>
                {subName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-wider">
            {t("Description détaillée")}
          </label>
          <textarea
            rows={4}
            value={editForm.description || ""}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            className="w-full text-xs p-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-[#ea580c] font-medium resize-none"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-wider">
            {t("Image principale URL")}
          </label>
          <input
            type="text"
            value={editForm.image || ""}
            onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
            className="w-full text-xs px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-[#ea580c] font-bold"
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-wider">
            {t("Images additionnelles URL (séparées par des virgules)")}
          </label>
          <input
            type="text"
            value={editForm.images ? editForm.images.join(", ") : ""}
            onChange={(e) => {
              const urls = e.target.value
                .split(",")
                .map((u) => u.trim())
                .filter((u) => u !== "");
              setEditForm({ ...editForm, images: urls });
            }}
            className="w-full text-xs px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-[#ea580c] font-bold"
            placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="freeShipping"
            checked={!!editForm.freeShipping}
            onChange={(e) => setEditForm({ ...editForm, freeShipping: e.target.checked })}
            className="w-4 h-4 text-[#ea580c] focus:ring-[#ea580c] border-zinc-300 rounded cursor-pointer"
          />
          <label htmlFor="freeShipping" className="text-xs font-bold text-zinc-700 cursor-pointer">
            {t("Proposer la livraison gratuite pour ce produit")}
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-xs font-bold text-zinc-600 bg-zinc-100 rounded-2xl hover:bg-zinc-200 cursor-pointer"
        >
          {t("Annuler")}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-2xl text-xs font-sans font-bold uppercase tracking-widest cursor-pointer flex items-center gap-1.5"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {t("Enregistrer")}
        </button>
      </div>
    </div>
  );
};
