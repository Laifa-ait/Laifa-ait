import React from "react";
import { LayoutTemplate, Plus } from "lucide-react";

export const ShopsAdmin: React.FC = () => {

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-indigo-600" />
            Boutiques Thématiques
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez vos pages de destination (Landing Pages) e-commerce spécialisées.
          </p>
        </div>
        <button
          onClick={() => {
            // Placeholder for creating a new shop
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Créer une Boutique
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 text-center border-b border-gray-100 bg-gray-50/50">
          <div className="mx-auto w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <LayoutTemplate className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Aucune boutique configurée
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Créez votre première boutique thématique (comme "Électroménager", "Cuisine", etc.) avec une mise en page et une barre latérale personnalisées pour augmenter vos conversions.
          </p>
        </div>
      </div>
    </div>
  );
};
