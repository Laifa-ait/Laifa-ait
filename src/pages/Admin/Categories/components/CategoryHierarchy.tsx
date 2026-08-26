import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories } from '../../../../hooks/admin/useCategories';
import { Network, GripVertical } from 'lucide-react';
import { apiPut } from '../../../../lib/api';
import toast from 'react-hot-toast';

interface CategoryItem {
  id: string;
  name?: string;
  order?: number;
  translations?: {
    fr?: { name?: string };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export const CategoryHierarchy = () => {
  const { t } = useTranslation();
  const { categories, isLoading, mutate } = useCategories();
  const [localCategories, setLocalCategories] = useState<CategoryItem[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    if (categories) {
      // Tri initial par ordre existant ou par défaut
      const sorted = [...(categories as CategoryItem[])].sort(
        (a: CategoryItem, b: CategoryItem) => (a.order || 0) - (b.order || 0)
      );
      setLocalCategories(sorted);
    }
  }, [categories]);
  
  if (isLoading) return <div>{t("Chargement...")}</div>;

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      const el = document.getElementById(`cat-${id}`);
      if (el) el.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, id: string) => {
    setDraggedId(null);
    const el = document.getElementById(`cat-${id}`);
    if (el) el.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIdx = localCategories.findIndex(c => c.id === draggedId);
    const targetIdx = localCategories.findIndex(c => c.id === targetId);
    
    if (draggedIdx === -1 || targetIdx === -1) return;

    const newCats = [...localCategories];
    const [draggedItem] = newCats.splice(draggedIdx, 1);
    newCats.splice(targetIdx, 0, draggedItem);
    
    setLocalCategories(newCats);
  };

  const handleUpdateHierarchy = async () => {
    const toastId = toast.loading(t("Sauvegarde..."));
    try {
      const hierarchy = localCategories.map((c, idx) => ({ id: c.id, order: idx }));
      await apiPut('/api/v1/admin/categories/hierarchy', { hierarchy });
      toast.success(t("Hiérarchie mise à jour"), { id: toastId });
      mutate();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "";
      toast.error(message || t("Erreur de sauvegarde"), { id: toastId });
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <Network className="w-5 h-5 text-gray-400" />
        <h2 className="text-xl font-bold">{t("Hiérarchie des Catégories")}</h2>
      </div>
      
      <p className="text-sm text-gray-500">
        {t("Glissez et déposez les catégories pour modifier leur ordre d'affichage sur la boutique.")}
      </p>

      <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        {localCategories.map((c) => (
          <div 
            key={c.id} 
            id={`cat-${c.id}`}
            draggable
            onDragStart={(e) => handleDragStart(e, c.id)}
            onDragEnd={(e) => handleDragEnd(e, c.id)}
            onDragOver={(e) => handleDragOver(e, c.id)}
            className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-between cursor-move hover:border-orange-500 transition-colors"
          >
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-gray-300" />
              <span className="font-medium text-sm">{c.name || c.translations?.fr?.name || c.id}</span>
            </div>
          </div>
        ))}
        {localCategories.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-sm">
            {t("Aucune catégorie trouvée")}
          </div>
        )}
      </div>

      <button
        onClick={handleUpdateHierarchy}
        className="px-6 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
      >
        {t("Sauvegarder l'ordre")}
      </button>
    </div>
  );
};
