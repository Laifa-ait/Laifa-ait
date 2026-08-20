import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories } from '../../../../hooks/admin/useCategories';
import { Network } from 'lucide-react';
import { apiPut } from '../../../../lib/api';
import toast from 'react-hot-toast';

export const CategoryHierarchy = () => {
  const { t } = useTranslation();
  const { categories, isLoading, mutate } = useCategories();
  
  if (isLoading) return <div>{t("Chargement...")}</div>;

  const handleUpdateHierarchy = async () => {
    // Dans une implémentation complète, cela enverrait l'arbre trié
    toast.success(t("Hiérarchie mise à jour"));
    mutate();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <Network className="w-5 h-5 text-gray-400" />
        <h2 className="text-xl font-bold">{t("Hiérarchie des Catégories")}</h2>
      </div>
      
      <p className="text-sm text-gray-500">
        {t("L'éditeur Drag & Drop sera affiché ici. (Mock)")}
      </p>

      <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        {categories?.map((c) => (
          <div key={c.id} className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-between cursor-move">
            <span className="font-medium text-sm">{c.name || c.id}</span>
          </div>
        ))}
      </div>

      <button
        onClick={handleUpdateHierarchy}
        className="px-6 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700"
      >
        {t("Sauvegarder l'ordre")}
      </button>
    </div>
  );
};
