import React from "react";
import { AnimatePresence } from "motion/react";
import { Send, Eye, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { NewsletterBlock, ALGERIA_STOCK_BANNERS } from "../../types/newsletter.types";
import { NewsletterMediaModal } from "../../components/Admin/NewsletterMediaModal";
import { NewsletterDevicePreview } from "../../components/Admin/NewsletterDevicePreview";
import { NewsletterSidebar } from "../../components/Admin/NewsletterSidebar";
import { NewsletterCanvas } from "../../components/Admin/NewsletterCanvas";
import { useNewsletterState } from "../../hooks/useNewsletterState";

export type { NewsletterBlock };

export const Newsletter: React.FC = () => {
  const { t } = useTranslation();
  const state = useNewsletterState();

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-sans font-bold tracking-tight rtl:tracking-normal text-zinc-950">
            {t("Newsletter 2.0")}
          </h2>
          <p className="text-zinc-500 font-medium">{t("Éditeur visuel intelligent alimenté par Gemini AI.")}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => state.setPreviewOpen(true)}
            className="px-8 py-5 bg-white border border-zinc-100 rounded-[2rem] flex items-center gap-4 font-sans font-bold text-[11px] uppercase tracking-widest rtl:tracking-normal text-zinc-500 hover:text-zinc-900 transition-all shadow-sm"
          >
            <Eye className="w-5 h-5" /> {t("Prévisualiser")}
          </button>
          <button
            onClick={state.handleSendCampaign}
            disabled={state.isSending}
            className="px-10 py-5 bg-[#ea580c] text-white rounded-[2rem] flex items-center gap-4 font-sans font-bold text-[11px] uppercase tracking-widest rtl:tracking-normal shadow-xl shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-50 active:scale-95 transition-all"
          >
            {state.isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}{" "}
            {t("Envoyer la campagne")}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3">
          <NewsletterSidebar
            addBlock={state.addBlock}
            aiPrompt={state.aiPrompt}
            setAiPrompt={state.setAiPrompt}
            generateWithAi={state.generateWithAi}
            generating={state.generating}
            t={t}
          />
        </div>

        <div className="lg:col-span-9 space-y-6">
          <NewsletterCanvas
            subject={state.subject}
            setSubject={state.setSubject}
            view={state.view}
            setView={state.setView}
            blocks={state.blocks}
            removeBlock={state.removeBlock}
            updateBlock={state.updateBlock}
            updateBlockProperty={state.updateBlockProperty}
            onOpenMediaModalForImage={(id) => {
              state.setSelectedBlockIdForImage(id);
              state.setMediaModalOpen(true);
            }}
            onOpenMediaModalForProduct={(id) => {
              state.setSelectedBlockIdForProduct(id);
              state.setMediaTab("product_catalog");
              state.setMediaModalOpen(true);
            }}
            t={t}
          />
        </div>
      </div>

      {/* Media Selector & Library Pop-up Dialog Modal */}
      <AnimatePresence>
        <NewsletterMediaModal
          mediaModalOpen={state.mediaModalOpen}
          setMediaModalOpen={state.setMediaModalOpen}
          mediaTab={state.mediaTab}
          setMediaTab={state.setMediaTab}
          searchQuery={state.searchQuery}
          setSearchQuery={state.setSearchQuery}
          productsLoading={state.productsLoading}
          productsList={state.productsList}
          handleSelectProduct={state.handleSelectProduct}
          stockBanners={ALGERIA_STOCK_BANNERS}
          handleSelectImage={state.handleSelectImage}
          customImageUrl={state.customImageUrl}
          setCustomImageUrl={state.setCustomImageUrl}
          isUploadingImage={state.isUploadingImage}
          handleFileUpload={state.handleFileUpload}
          t={t}
        />
      </AnimatePresence>

      {/* Realistic Compiled Preview Modal */}
      <NewsletterDevicePreview
        previewOpen={state.previewOpen}
        setPreviewOpen={state.setPreviewOpen}
        view={state.view}
        setView={state.setView}
        subject={state.subject}
        blocks={state.blocks}
        t={t}
      />
    </div>
  );
};
