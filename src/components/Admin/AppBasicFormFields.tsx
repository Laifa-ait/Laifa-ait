import React from 'react';
import { OlmaAppModule, OlmaAppStatus, OlmaAppCategory } from '../../types/olmaUnivers';

interface AppBasicFormFieldsProps {
  formData: OlmaAppModule;
  onChange: (updated: Partial<OlmaAppModule>) => void;
}

export const AppBasicFormFields: React.FC<AppBasicFormFieldsProps> = ({
  formData,
  onChange
}) => {
  return (
    <>
      {/* Titles in 3 Languages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            Titre (Français) *
          </label>
          <input
            type="text"
            required
            value={formData.title.fr}
            onChange={(e) =>
              onChange({ title: { ...formData.title, fr: e.target.value } })
            }
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            العنوان (العربية)
          </label>
          <input
            type="text"
            dir="rtl"
            value={formData.title.ar}
            onChange={(e) =>
              onChange({ title: { ...formData.title, ar: e.target.value } })
            }
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            Title (English)
          </label>
          <input
            type="text"
            value={formData.title.en}
            onChange={(e) =>
              onChange({ title: { ...formData.title, en: e.target.value } })
            }
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl"
          />
        </div>
      </div>

      {/* Action Type & Route */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            Type d'Action Raccourci
          </label>
          <select
            value={formData.actionType || 'route'}
            onChange={(e) =>
              onChange({
                actionType: e.target.value as 'route' | 'category' | 'filter' | 'external'
              })
            }
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl"
          >
            <option value="route">Route URL interne (ex: /shop?express=true)</option>
            <option value="category">Filtre Catégorie Principale (ex: Mode, Électronique)</option>
            <option value="external">Lien Externe</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            Cible / Route / Nom de Catégorie
          </label>
          <input
            type="text"
            value={formData.targetRoute || ''}
            onChange={(e) => onChange({ targetRoute: e.target.value })}
            placeholder="/shop?express=true ou Épicerie"
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl"
          />
        </div>
      </div>

      {/* Status, Category, Order */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            Statut
          </label>
          <select
            value={formData.status}
            onChange={(e) => onChange({ status: e.target.value as OlmaAppStatus })}
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl"
          >
            <option value="active">Actif (Disponible)</option>
            <option value="beta">Beta</option>
            <option value="coming_soon">Bientôt Disponible</option>
            <option value="maintenance">Maintenance</option>
            <option value="hidden">Masqué</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            Catégorie
          </label>
          <select
            value={formData.category}
            onChange={(e) => onChange({ category: e.target.value as OlmaAppCategory })}
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl"
          >
            <option value="ecommerce">E-Commerce</option>
            <option value="deals">Bons Plans & Flash</option>
            <option value="tech">High-Tech</option>
            <option value="fashion">Mode & Beauté</option>
            <option value="food">Supermarché & Food</option>
            <option value="artisanat">Artisanat DZ</option>
            <option value="services">Bricolage & Services</option>
            <option value="immo">Immobilier</option>
            <option value="auto">Auto & Véhicules</option>
            <option value="logistics">Logistique & Express</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            Ordre d'Affichage
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => onChange({ order: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl"
          />
        </div>
      </div>
    </>
  );
};
