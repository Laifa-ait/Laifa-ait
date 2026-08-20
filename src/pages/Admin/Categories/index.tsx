import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Network } from 'lucide-react';
import { CategoryVisuals } from './components/CategoryVisuals';
import { CategoryHierarchy } from './components/CategoryHierarchy';

export const CategoriesAdmin = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"visuals" | "hierarchy">("visuals");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('Gestion des Catégories')}</h1>
          <p className="text-sm text-gray-500">{t('Gérez la structure et les visuels de votre catalogue')}</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl w-max">
        <button
          onClick={() => setActiveTab('visuals')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'visuals'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          {t('Visuels & Produits')}
        </button>
        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'hierarchy'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
        >
          <Network className="w-4 h-4" />
          {t('Hiérarchie (Arbre)')}
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'visuals' ? <CategoryVisuals /> : <CategoryHierarchy />}
      </div>
    </div>
  );
};
