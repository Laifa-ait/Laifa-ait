import React from 'react';
import { useTranslation } from "react-i18next";
import { Key, RefreshCw } from 'lucide-react';

export interface SearchCredentialsCardProps {
  selectedFormat: 'algolia' | 'typesense' | 'elasticsearch';
  onSelectFormat: (format: 'algolia' | 'typesense' | 'elasticsearch') => void;
  algoliaAppId: string;
  onAlgoliaAppIdChange: (v: string) => void;
  algoliaAdminKey: string;
  onAlgoliaAdminKeyChange: (v: string) => void;
  algoliaIndexName: string;
  onAlgoliaIndexNameChange: (v: string) => void;
  typesenseHost: string;
  onTypesenseHostChange: (v: string) => void;
  typesenseApiKey: string;
  onTypesenseApiKeyChange: (v: string) => void;
  typesenseCollection: string;
  onTypesenseCollectionChange: (v: string) => void;
  onSaveCredentials: () => void;
  onIndexPush: () => void;
  isIndexing: boolean;
}

export const SearchCredentialsCard: React.FC<SearchCredentialsCardProps> = ({
  selectedFormat,
  onSelectFormat,
  algoliaAppId,
  onAlgoliaAppIdChange,
  algoliaAdminKey,
  onAlgoliaAdminKeyChange,
  algoliaIndexName,
  onAlgoliaIndexNameChange,
  typesenseHost,
  onTypesenseHostChange,
  typesenseApiKey,
  onTypesenseApiKeyChange,
  typesenseCollection,
  onTypesenseCollectionChange,
  onSaveCredentials,
  onIndexPush,
  isIndexing,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      <h2 className="text-lg font-sans font-bold uppercase text-zinc-900 flex items-center gap-3">
        <Key className="w-5 h-5 text-orange-500" />
        {t("Connexion Réelle Algolia / Typesense")}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-100 p-1.5 rounded-2xl">
        {(['algolia', 'typesense', 'elasticsearch'] as const).map(format => (
          <button
            key={format}
            onClick={() => onSelectFormat(format)}
            className={`py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all border-none cursor-pointer ${
              selectedFormat === format ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-950 bg-transparent'
            }`}
          >
            {format}
          </button>
        ))}
      </div>

      {selectedFormat === 'algolia' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">{t("Algolia APP ID")}</label>
            <input
              type="text"
              value={algoliaAppId}
              onChange={(e) => onAlgoliaAppIdChange(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 outline-none px-4 py-3 rounded-xl text-xs font-semibold"
              placeholder="Ex: AB12CD34EF"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">{t("Algolia Admin API Key")}</label>
            <input
              type="password"
              value={algoliaAdminKey}
              onChange={(e) => onAlgoliaAdminKeyChange(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 outline-none px-4 py-3 rounded-xl text-xs font-semibold"
              placeholder="••••••••••••••••••••"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">{t("Algolia Index Name")}</label>
            <input
              type="text"
              value={algoliaIndexName}
              onChange={(e) => onAlgoliaIndexNameChange(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 outline-none px-4 py-3 rounded-xl text-xs font-semibold"
              placeholder="Ex: production_products"
            />
          </div>
        </div>
      )}

      {selectedFormat === 'typesense' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">{t("Host URL")}</label>
            <input
              type="text"
              value={typesenseHost}
              onChange={(e) => onTypesenseHostChange(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 outline-none px-4 py-3 rounded-xl text-xs font-semibold"
              placeholder="Ex: https://typesense.cloud"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">{t("API Key")}</label>
            <input
              type="password"
              value={typesenseApiKey}
              onChange={(e) => onTypesenseApiKeyChange(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 outline-none px-4 py-3 rounded-xl text-xs font-semibold"
              placeholder="••••••••••••••••••••"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">{t("Collection Name")}</label>
            <input
              type="text"
              value={typesenseCollection}
              onChange={(e) => onTypesenseCollectionChange(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 outline-none px-4 py-3 rounded-xl text-xs font-semibold"
              placeholder="Ex: products"
            />
          </div>
        </div>
      )}

      <div className="flex gap-4 border-t border-zinc-100 pt-4 justify-between">
        <button
          onClick={onSaveCredentials}
          className="px-5 py-3 bg-zinc-950 text-white rounded-xl text-xs font-bold uppercase hover:bg-zinc-800 cursor-pointer"
        >
          {t("Enregistrer les Clés")}
        </button>

        {selectedFormat === 'algolia' && (
          <button
            onClick={onIndexPush}
            disabled={isIndexing}
            className="px-5 py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl text-xs font-bold uppercase flex items-center gap-2 shadow-lg shadow-orange-500/20 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isIndexing ? 'animate-spin' : ''}`} />
            {t("Lancer l'indexation Algolia")}
          </button>
        )}
      </div>
    </div>
  );
};
