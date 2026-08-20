import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories } from '../../../../hooks/admin/useCategories';
import { CategoryItem } from '../../../../services/api/admin.api';
import { apiPut } from '../../../../lib/api';
import toast from 'react-hot-toast';

export const CategoryVisuals = () => {
  const { t } = useTranslation();
  const { categories, isLoading, mutate } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [formData, setFormData] = useState<Partial<CategoryItem>>({});
  
  if (isLoading) return <div>{t("Chargement...")}</div>;
  if (!categories || categories.length === 0) return <div>{t("Aucune catégorie trouvée.")}</div>;

  const handleSelect = (id: string) => {
    setSelectedCategoryId(id);
    const cat = categories.find((c) => c.id === id);
    if (cat) {
      setFormData(cat);
    }
  };

  const handleSave = async () => {
    if (!selectedCategoryId) return;
    try {
      await apiPut(`/api/v1/admin/categories/${selectedCategoryId}`, formData);
      toast.success(t("Catégorie mise à jour"));
      mutate();
    } catch (e) {
      toast.error(t("Erreur lors de la mise à jour"));
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
      <h2 className="text-xl font-bold">{t("Visuels des Catégories")}</h2>
      <select
        className="w-full p-3 rounded-xl border border-gray-200"
        value={selectedCategoryId}
        onChange={(e) => handleSelect(e.target.value)}
      >
        <option value="">{t("Sélectionnez une catégorie...")}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name || c.id}</option>
        ))}
      </select>

      {selectedCategoryId && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t("Nom (FR)")}</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Image (URL)")}</label>
            <input
              type="text"
              value={formData.image || ''}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-lg"
            />
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700"
          >
            {t("Enregistrer")}
          </button>
        </div>
      )}
    </div>
  );
};
