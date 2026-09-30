import React from 'react';
import { useTranslation } from "react-i18next";
import { Settings, FileCode, Flame } from 'lucide-react';
import { SearchIndexingModel } from './types';

export interface SearchPreviewTableProps {
  selectedCategory: string;
  onSelectedCategoryChange: (v: string) => void;
  selectedWilaya: string;
  onSelectedWilayaChange: (v: string) => void;
  categories: string[];
  wilayas: string[];
  selectedFormat: string;
  configSchemaSnippet: string;
  filteredRecords: SearchIndexingModel[];
}

export const SearchPreviewTable: React.FC<SearchPreviewTableProps> = ({
  selectedCategory,
  onSelectedCategoryChange,
  selectedWilaya,
  onSelectedWilayaChange,
  categories,
  wilayas,
  selectedFormat,
  configSchemaSnippet,
  filteredRecords,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Settings & Filters */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-sans font-bold uppercase text-zinc-900 flex items-center gap-3">
          <Settings className="w-5 h-5 text-zinc-400" />
          {t("Filtres de Scope d'exportation")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase mb-2">{t("Catégorie")}</label>
            <select
              value={selectedCategory}
              onChange={(e) => onSelectedCategoryChange(e.target.value)}
              className="w-full bg-zinc-100 border border-transparent rounded-2xl px-4 py-3 text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-zinc-300 transition-all cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-sans font-bold text-zinc-400 uppercase mb-2">{t("Wilaya")}</label>
            <select
              value={selectedWilaya}
              onChange={(e) => onSelectedWilayaChange(e.target.value)}
              className="w-full bg-zinc-100 border border-transparent rounded-2xl px-4 py-3 text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-zinc-300 transition-all cursor-pointer"
            >
              {wilayas.map(wil => (
                <option key={wil} value={wil}>{wil}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Config schema JSON code output */}
      <div className="bg-zinc-950 text-zinc-300 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <FileCode className="w-5 h-5 text-[#ea580c]" />
            <div>
              <h2 className="text-sm font-sans font-bold text-white uppercase">{t("Schéma d'Index")}</h2>
              <p className="text-[10px] text-zinc-500 font-mono">schema-{selectedFormat}.json</p>
            </div>
          </div>
        </div>
        <pre className="text-xs bg-zinc-900 p-6 rounded-2xl overflow-x-auto text-emerald-400 font-mono border border-zinc-800 max-h-72">
          <code>{configSchemaSnippet}</code>
        </pre>
      </div>

      {/* List of mapped real products to export */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="text-lg font-sans font-bold uppercase text-zinc-900 mb-6">
          {t("Documents Prêts à l'indexation ({{count}})", { count: filteredRecords.length })}
        </h3>
        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
          {filteredRecords.map((doc) => (
            <div key={doc.objectID} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-150 hover:border-zinc-300 transition-all">
              <div className="flex items-center gap-4">
                <img
                  loading="lazy"
                  src={doc.image}
                  alt={doc.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-sans font-bold text-zinc-900 leading-tight">{doc.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase">
                    ID: {doc.objectID} • {doc.category}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-semibold bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded-full uppercase">
                      {doc.wilaya}
                    </span>
                    {doc.hasPromo && (
                      <span className="text-[9px] font-extrabold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" /> {t("Promo")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex sm:flex-col items-end gap-2 shrink-0 sm:text-end">
                <span className="text-xs font-sans font-bold text-zinc-900">
                  {doc.price.toLocaleString("fr-DZ")} DA
                </span>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-mono">
                  {doc.rankingScore} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
