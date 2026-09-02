import React from "react";
import {
  ShieldCheck,
  XCircle,
  CheckCircle2,
  MessageSquareX,
  Edit2,
  Sparkles,
  CheckSquare,
  AlertTriangle,
  Loader2,
  Layers,
  X,
  Check,
  Info,
} from "lucide-react";

import { useCuration } from "./hooks/useCuration";
import { CurationPendingList } from "../../components/Admin/Curation/CurationPendingList";
import { CurationMobilePreview } from "../../components/Admin/Curation/CurationMobilePreview";
import { CurationProductEditForm } from "../../components/Admin/Curation/CurationProductEditForm";

export const Curation: React.FC = () => {
  const {
    t,
    products,
    loading,
    searchTerm,
    setSearchTerm,
    selectedProduct,
    setSelectedProduct,
    relatedProducts,
    isEditMode,
    setIsEditMode,
    editForm,
    setEditForm,
    isSaving,
    isRejecting,
    setIsRejecting,
    rejectionReason,
    setRejectionReason,
    isActionInProgress,
    activeImageIndex,
    setActiveImageIndex,
    hierarchy,
    filteredProducts,
    checklist,
    calculatedScore,
    duplicates,
    handleToggleCompliance,
    handleApproveProduct,
    handleRejectProduct,
    handleStartEditing,
    handleSaveChanges
  } = useCuration();

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-140px)] animate-fade-in text-zinc-900 bg-transparent/30">
      <CurationPendingList
        products={products}
        filteredProducts={filteredProducts}
        selectedProduct={selectedProduct}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectProduct={setSelectedProduct}
      />

      <div className="flex-1 min-w-0 space-y-6">
        {!selectedProduct ? (
          <div className="bg-white rounded-3xl p-12 border border-zinc-100 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-sans font-bold text-zinc-800 uppercase tracking-wide">
              {t("Aucun produit sélectionné")}
            </h3>
            <p className="text-xs text-zinc-400 font-medium">
              {t("Sélectionnez un produit dans la liste pour démarrer l'audit de modération.")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-zinc-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                    {t("En attente de validation")}
                  </span>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-400">
                    ID: #{selectedProduct.id.slice(0, 8)}
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-sans font-bold text-zinc-900 uppercase tracking-tight">
                  {selectedProduct.name}
                </h2>
                <p className="text-xs text-zinc-500 font-medium">
                  {t("Proposé par")} <strong className="text-zinc-800">{selectedProduct.sellerName || t("Vendeur inconnu")}</strong> {t("dans la catégorie")} <strong className="text-zinc-800">{selectedProduct.category}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                {!isEditMode && (
                  <button
                    onClick={handleStartEditing}
                    className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-2xl text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 text-[#ea580c]" />
                    {t("Éditer")}
                  </button>
                )}

                <button
                  onClick={() => setIsRejecting(true)}
                  disabled={isActionInProgress}
                  className="px-5 py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-2xl text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 text-red-600" />
                  {t("Refuser")}
                </button>

                <button
                  onClick={handleApproveProduct}
                  disabled={isActionInProgress}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-sans font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isActionInProgress ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  {t("Approuver & Publier")}
                </button>
              </div>
            </div>

            {isRejecting && (
              <div className="bg-red-50/70 border border-red-200 rounded-[2.5rem] p-6 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-sans font-bold text-red-900 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquareX className="w-4 h-4 text-red-600" />
                    {t("Motif de Refus du Produit")}
                  </h4>
                  <button onClick={() => setIsRejecting(false)} className="text-red-400 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t("Ex: Les photos sont floues, le titre contient des termes abusifs...")}
                  className="w-full text-xs p-4 bg-white border border-red-200 rounded-2xl outline-none focus:border-red-500 font-medium resize-none"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsRejecting(false)}
                    className="px-4 py-2 text-xs font-bold text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 cursor-pointer"
                  >
                    {t("Annuler")}
                  </button>
                  <button
                    onClick={handleRejectProduct}
                    disabled={isActionInProgress}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                  >
                    {isActionInProgress ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                    {t("Confirmer le refus")}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              <div className="xl:col-span-7 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-zinc-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <h3 className="font-sans font-bold text-xs text-zinc-900 uppercase tracking-widest">
                        {t("Score de Qualité Olmart AI")}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-sans font-black ${calculatedScore >= 80 ? "text-emerald-600" : calculatedScore >= 50 ? "text-amber-600" : "text-red-600"}`}>
                        {calculatedScore}%
                      </span>
                      <span className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest">
                        {calculatedScore >= 80 ? t("Excellent") : calculatedScore >= 50 ? t("Moyen") : t("Insuffisant")}
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${calculatedScore >= 80 ? "bg-emerald-500" : calculatedScore >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${calculatedScore}%` }}
                    />
                  </div>

                  <div className="bg-zinc-50 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 uppercase tracking-wide">
                      <Info className="w-4 h-4 text-amber-500" />
                      {t("Suggestions d'optimisation")}
                    </div>
                    <ul className="text-xs font-medium text-zinc-600 space-y-1 pl-4 list-disc rtl:pr-4 rtl:list-disc">
                      {((isEditMode && editForm ? editForm : selectedProduct).name || "").length < 15 && (
                        <li>{t("Rallonger le titre pour un meilleur référencement (idéalement entre 15 et 85 caractères)")}</li>
                      )}
                      {((isEditMode && editForm ? editForm : selectedProduct).description || "").length < 150 && (
                        <li>{t("Enrichir la description pour atteindre 150 caractères et expliquer la touche créative")}</li>
                      )}
                      {((isEditMode && editForm ? editForm : selectedProduct).images?.length || 0) < 3 && (
                        <li>{t("Ajouter au moins 3 photos pour valoriser le rendu mobile (galerie carousel)")}</li>
                      )}
                      {!(isEditMode && editForm ? editForm : selectedProduct).subcategory && (
                        <li className="text-amber-600">{t("Indiquer une sous-catégorie pour faciliter le filtrage client")}</li>
                      )}
                    </ul>
                  </div>
                </div>

                {isEditMode && editForm ? (
                  <CurationProductEditForm
                    editForm={editForm}
                    setEditForm={setEditForm}
                    hierarchy={hierarchy}
                    isSaving={isSaving}
                    onCancel={() => setIsEditMode(false)}
                    onSave={handleSaveChanges}
                  />
                ) : (
                  <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-zinc-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                      <CheckSquare className="w-5 h-5 text-zinc-700" />
                      <h3 className="font-sans font-bold text-xs text-zinc-900 uppercase tracking-widest">
                        {t("Checklist de conformité")}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {checklist.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-start justify-between gap-4 p-3 hover:bg-zinc-50 rounded-2xl transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggleCompliance(item.key)}
                              className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                                item.status
                                  ? "bg-green-100 border-green-500 text-green-700"
                                  : "bg-red-100 border-red-500 text-red-700"
                              }`}
                            >
                              {item.status ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            </button>
                            <div>
                              <h4 className="text-xs font-sans font-bold text-zinc-800 uppercase tracking-wide">
                                {item.title}
                              </h4>
                              <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${item.status ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                            {item.status ? t("Conforme") : t("Alerte")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-zinc-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 justify-between border-b border-zinc-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-zinc-700" />
                      <h3 className="font-sans font-bold text-xs text-zinc-900 uppercase tracking-widest">
                        {t("Comparaison de doublons")}
                      </h3>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold">
                      {relatedProducts.length} {t("produits dans la catégorie")}
                    </span>
                  </div>

                  {duplicates.length === 0 ? (
                    <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-green-900">
                          {t("Aucune similarité suspecte détectée")}
                        </h4>
                        <p className="text-[10px] text-green-700 font-medium mt-0.5">
                          {t("Aucun autre produit actif dans cette catégorie ne possède un nom similaire. Moins de risque de pollution du catalogue.")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-red-900">
                            {t("Doublons potentiels détectés !")}
                          </h4>
                          <p className="text-[10px] text-red-700 font-medium mt-0.5">
                            {t("Attention, des produits très similaires existent déjà. Évitez les fiches en doublon d'un même vendeur.")}
                          </p>
                        </div>
                      </div>

                      <div className="divide-y divide-zinc-100 max-h-48 overflow-y-auto pr-1">
                        {duplicates.map((dup) => (
                          <div key={dup.id} className="py-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-100 overflow-hidden shrink-0">
                                <img loading="lazy" decoding="async" src={dup.image} alt={dup.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-zinc-800 truncate">{dup.name}</h5>
                                <p className="text-[9px] text-zinc-400 font-bold">{t("Boutique :")} {dup.sellerName || t("Inconnu")}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-zinc-900">{dup.price} DA</span>
                              <p className="text-[9px] text-[#ea580c] font-bold">
                                {dup.id === selectedProduct.id ? t("Même fiche") : t("Actif")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <CurationMobilePreview
                selectedProduct={selectedProduct}
                isEditMode={isEditMode}
                editForm={editForm}
                activeImageIndex={activeImageIndex}
                setActiveImageIndex={setActiveImageIndex}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
