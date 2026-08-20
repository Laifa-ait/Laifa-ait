import React from 'react';
import { AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Globe, Languages, Search, ShieldCheck, Wand2, Clock } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Subcomponents and Custom Hook
import { useTranslationAdmin } from './TranslationAdmin/hooks/useTranslationAdmin';
import { TranslationAuditTab } from './TranslationAdmin/components/TranslationAuditTab';
import { TranslationMonthlyTab } from './TranslationAdmin/components/TranslationMonthlyTab';
import { TranslationDictionaryTab } from './TranslationAdmin/components/TranslationDictionaryTab';
import { TranslationAgentTab } from './TranslationAdmin/components/TranslationAgentTab';
import { NewKeyModal } from './TranslationAdmin/components/NewKeyModal';

export const TranslationAdmin: React.FC = () => {
  const { t } = useTranslation();
  const state = useTranslationAdmin();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 pb-32 font-sans" id="translation-admin-container">
      <Toaster position="bottom-right" />

      {/* Header section with Olma Branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-zinc-950 rounded-3xl flex items-center justify-center text-orange-500 shadow-2xl rotate-3">
              <Languages className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-sans font-bold text-zinc-950 tracking-tighter rtl:tracking-normal uppercase italic">
                {t("Audit Translation")}
              </h1>
              <p className="text-zinc-500 font-bold text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                {t("Control Layer v2.0 • Multilingue")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap bg-zinc-100/80 p-1.5 rounded-[2.5rem] border border-zinc-200/50 shadow-inner">
          <button
            onClick={() => state.setActiveTab('audit')}
            className={`px-5 py-3 rounded-[2rem] text-[10px] uppercase font-black tracking-[0.2em] transition-all flex items-center gap-2 cursor-pointer border-none ${
              state.activeTab === 'audit' ? 'bg-zinc-950 text-white shadow-xl translate-y-[-2px]' : 'text-zinc-400 hover:text-zinc-600 bg-transparent'
            }`}
          >
            <Search className="w-3.5 h-3.5" /> {t("Global Audit")}
          </button>
          <button
            onClick={() => state.setActiveTab('monthly')}
            className={`px-5 py-3 rounded-[2rem] text-[10px] uppercase font-black tracking-[0.2em] transition-all flex items-center gap-2 cursor-pointer border-none ${
              state.activeTab === 'monthly' ? 'bg-zinc-950 text-white shadow-xl translate-y-[-2px]' : 'text-zinc-400 hover:text-zinc-600 bg-transparent'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> {t("Monthly Updates")}
          </button>
          <button
            onClick={() => state.setActiveTab('dictionary')}
            className={`px-5 py-3 rounded-[2rem] text-[10px] uppercase font-black tracking-[0.2em] transition-all flex items-center gap-2 cursor-pointer border-none ${
              state.activeTab === 'dictionary' ? 'bg-zinc-950 text-white shadow-xl translate-y-[-2px]' : 'text-zinc-400 hover:text-zinc-600 bg-transparent'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-zinc-600" /> {t("Dictionnaire")}
          </button>
          <button
            onClick={() => state.setActiveTab('agent')}
            className={`px-5 py-3 rounded-[2rem] text-[10px] uppercase font-black tracking-[0.2em] transition-all flex items-center gap-2 cursor-pointer border-none ${
              state.activeTab === 'agent' ? 'bg-zinc-950 text-white shadow-xl translate-y-[-2px]' : 'text-orange-500 font-extrabold hover:text-orange-600 bg-transparent'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 animate-pulse" /> {t("Agent IA Mabrouk")}
          </button>
        </div>
      </div>

      {state.isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-zinc-500">{t("Chargement des traductions...")}</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {state.activeTab === 'audit' && (
            <TranslationAuditTab
              auditState={state.auditState}
              completenessAr={state.completenessAr}
              completenessEn={state.completenessEn}
              isTranslating={state.isTranslating}
              handleAutoTranslateProducts={state.handleAutoTranslateProducts}
              handleTranslateUI={state.handleTranslateUI}
            />
          )}

          {state.activeTab === 'monthly' && (
            <TranslationMonthlyTab
              monthlyContent={state.monthlyContent}
              newMonthlyText={state.newMonthlyText}
              setNewMonthlyText={state.setNewMonthlyText}
              registerMonthlyContent={state.registerMonthlyContent}
            />
          )}

          {state.activeTab === 'dictionary' && (
            <>
              <TranslationDictionaryTab
                dictFr={state.dictFr}
                dictAr={state.dictAr}
                dictEn={state.dictEn}
                searchQuery={state.searchQuery}
                setSearchQuery={state.setSearchQuery}
                statusFilter={state.statusFilter}
                setStatusFilter={state.setStatusFilter}
                isCleaningFictive={state.isCleaningFictive}
                handleCleanFictive={state.handleCleanFictive}
                setShowNewKeyModal={state.setShowNewKeyModal}
                editingKey={state.editingKey}
                setEditingKey={state.setEditingKey}
                editForm={state.editForm}
                setEditForm={state.setEditForm}
                isTranslatingSingle={state.isTranslatingSingle}
                handleTranslateSingleKey={state.handleTranslateSingleKey}
                isSavingKey={state.isSavingKey}
                handleSaveTranslation={state.handleSaveTranslation}
              />
              <NewKeyModal
                showNewKeyModal={state.showNewKeyModal}
                setShowNewKeyModal={state.setShowNewKeyModal}
                newKeyData={state.newKeyData}
                setNewKeyData={state.setNewKeyData}
                handleAddNewKey={state.handleAddNewKey}
              />
            </>
          )}

          {state.activeTab === 'agent' && (
            <TranslationAgentTab
              agentMessages={state.agentMessages}
              agentInput={state.agentInput}
              setAgentInput={state.setAgentInput}
              agentTargetLang={state.agentTargetLang}
              setAgentTargetLang={state.setAgentTargetLang}
              isAgentTyping={state.isAgentTyping}
              handleSendAgentMessage={state.handleSendAgentMessage}
            />
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
