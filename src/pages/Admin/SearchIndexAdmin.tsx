import React, { useState } from 'react';
import { Database, Download, RefreshCw, CheckCircle, Server, BarChart2, BookOpen } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { SearchSynonyms } from './SearchSynonyms';
import { SearchAnalytics } from './SearchAnalytics';
import { useSearchIndexState } from '../../components/Admin/SearchIndex/hooks/useSearchIndexState';
import { SearchCredentialsCard } from '../../components/Admin/SearchIndex/SearchCredentialsCard';
import { SearchTuningSliders } from '../../components/Admin/SearchIndex/SearchTuningSliders';
import { SearchPreviewTable } from '../../components/Admin/SearchIndex/SearchPreviewTable';

export const SearchIndexAdmin: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'index' | 'synonyms' | 'analytics'>('index');

  const {
    products,
    isFetchingProducts,
    usingDemoData,
    selectedFormat,
    setSelectedFormat,
    algoliaAppId,
    setAlgoliaAppId,
    algoliaAdminKey,
    setAlgoliaAdminKey,
    algoliaIndexName,
    setAlgoliaIndexName,
    typesenseHost,
    setTypesenseHost,
    typesenseApiKey,
    setTypesenseApiKey,
    typesenseCollection,
    setTypesenseCollection,
    weightTitle,
    setWeightTitle,
    weightDesc,
    setWeightDesc,
    weightRatings,
    setWeightRatings,
    weightPromo,
    setWeightPromo,
    weightStock,
    setWeightStock,
    selectedCategory,
    setSelectedCategory,
    selectedWilaya,
    setSelectedWilaya,
    simulatedSearch,
    setSimulatedSearch,
    exportedStatus,
    isIndexing,
    categories,
    wilayas,
    filteredRecords,
    simulatedResults,
    configSchemaSnippet,
    saveCredentials,
    handleDownloadExport,
    handleIndexPush,
  } = useSearchIndexState();

  return (
    <div className="space-y-10 max-w-[1850px] mx-auto p-4 md:p-8" id="search-index-admin-dashboard">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-orange-600" />
            <span className="text-xs font-sans font-bold text-orange-600 uppercase tracking-widest">
              {t("Moteurs de Recherche Intel-Search")}
            </span>
          </div>
          <h1 className="text-3xl font-sans font-bold tracking-tight text-zinc-900 uppercase">
            {t("Configuration & Modélisation de Recherche")}
          </h1>
          <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
            {t("Connectez Algolia, configurez vos synonymes, réglez les poids de tri et suivez l'analytics de recherche.")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {usingDemoData && (
            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-full uppercase font-bold tracking-wider">
              ⚠️ {t("Mode Démo (Firestore Vide)")}
            </span>
          )}
          <button
            onClick={handleDownloadExport}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all border-none shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#ea580c]" />
            {t("Exporter")} ({filteredRecords.length})
          </button>
        </div>
      </div>

      {exportedStatus && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">{exportedStatus}</p>
        </div>
      )}

      {/* Internal Navigation Tabs */}
      <div className="flex border-b border-zinc-200 gap-2">
        <button
          onClick={() => setActiveTab("index")}
          className={`py-4 px-6 font-sans font-bold text-sm uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "index" ? "border-[#ea580c] text-[#ea580c]" : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <Server className="w-4 h-4" />
          {t("1. Indexation & Connecteurs")}
        </button>
        <button
          onClick={() => setActiveTab("synonyms")}
          className={`py-4 px-6 font-sans font-bold text-sm uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "synonyms" ? "border-[#ea580c] text-[#ea580c]" : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          {t("2. Synonymes")}
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`py-4 px-6 font-sans font-bold text-sm uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "analytics" ? "border-[#ea580c] text-[#ea580c]" : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          {t("3. Analytics de Recherche")}
        </button>
      </div>

      {isFetchingProducts ? (
        <div className="bg-white p-12 border rounded-3xl text-center shadow-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-zinc-400 mx-auto mb-3" />
          <p className="text-zinc-500 font-medium">{t("Synchronisation avec votre catalogue Firestore...")}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {activeTab === "index" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left configurations (8 cols) */}
              <div className="lg:col-span-8 space-y-8">
                <SearchCredentialsCard
                  selectedFormat={selectedFormat}
                  onSelectFormat={setSelectedFormat}
                  algoliaAppId={algoliaAppId}
                  onAlgoliaAppIdChange={setAlgoliaAppId}
                  algoliaAdminKey={algoliaAdminKey}
                  onAlgoliaAdminKeyChange={setAlgoliaAdminKey}
                  algoliaIndexName={algoliaIndexName}
                  onAlgoliaIndexNameChange={setAlgoliaIndexName}
                  typesenseHost={typesenseHost}
                  onTypesenseHostChange={setTypesenseHost}
                  typesenseApiKey={typesenseApiKey}
                  onTypesenseApiKeyChange={setTypesenseApiKey}
                  typesenseCollection={typesenseCollection}
                  onTypesenseCollectionChange={setTypesenseCollection}
                  onSaveCredentials={saveCredentials}
                  onIndexPush={handleIndexPush}
                  isIndexing={isIndexing}
                />

                <SearchPreviewTable
                  selectedCategory={selectedCategory}
                  onSelectedCategoryChange={setSelectedCategory}
                  selectedWilaya={selectedWilaya}
                  onSelectedWilayaChange={setSelectedWilaya}
                  categories={categories}
                  wilayas={wilayas}
                  selectedFormat={selectedFormat}
                  configSchemaSnippet={configSchemaSnippet}
                  filteredRecords={filteredRecords}
                />
              </div>

              {/* Right panel with Tri Weights sliders & Simulator (4 cols) */}
              <div className="lg:col-span-4 space-y-8">
                <SearchTuningSliders
                  weightTitle={weightTitle}
                  onWeightTitleChange={setWeightTitle}
                  weightDesc={weightDesc}
                  onWeightDescChange={setWeightDesc}
                  weightRatings={weightRatings}
                  onWeightRatingsChange={setWeightRatings}
                  weightPromo={weightPromo}
                  onWeightPromoChange={setWeightPromo}
                  weightStock={weightStock}
                  onWeightStockChange={setWeightStock}
                  simulatedSearch={simulatedSearch}
                  onSimulatedSearchChange={setSimulatedSearch}
                  simulatedResults={simulatedResults}
                  products={products}
                />
              </div>
            </div>
          )}

          {activeTab === "synonyms" && (
            <SearchSynonyms algoliaCredentials={{ appId: algoliaAppId, apiKey: algoliaAdminKey, indexName: algoliaIndexName }} />
          )}

          {activeTab === "analytics" && (
            <SearchAnalytics />
          )}
        </div>
      )}
    </div>
  );
};
