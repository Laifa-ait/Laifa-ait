import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Wand2 } from 'lucide-react';
import { TranslationDictionaryRow, EditForm } from './TranslationDictionaryRow';

interface TranslationDictionaryTabProps {
  dictFr: Record<string, string>;
  dictAr: Record<string, string>;
  dictEn: Record<string, string>;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: 'all' | 'mock_ar' | 'mock_en' | 'missing' | 'translated';
  setStatusFilter: (val: 'all' | 'mock_ar' | 'mock_en' | 'missing' | 'translated') => void;
  isCleaningFictive: boolean;
  handleCleanFictive: () => Promise<void>;
  setShowNewKeyModal: (show: boolean) => void;
  editingKey: string | null;
  setEditingKey: (key: string | null) => void;
  editForm: EditForm;
  setEditForm: React.Dispatch<React.SetStateAction<EditForm>>;
  isTranslatingSingle: boolean;
  handleTranslateSingleKey: (key: string, frText: string) => Promise<void>;
  isSavingKey: string | null;
  handleSaveTranslation: (key: string) => Promise<void>;
}

export const TranslationDictionaryTab: React.FC<TranslationDictionaryTabProps> = ({
  dictFr,
  dictAr,
  dictEn,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  isCleaningFictive,
  handleCleanFictive,
  setShowNewKeyModal,
  editingKey,
  setEditingKey,
  editForm,
  setEditForm,
  isTranslatingSingle,
  handleTranslateSingleKey,
  isSavingKey,
  handleSaveTranslation,
}) => {
  const { t } = useTranslation();

  const getFilteredKeys = () => {
    let keys = Object.keys(dictFr);

    // Apply statusFilter
    if (statusFilter === 'mock_ar') {
      keys = keys.filter(
        (k) => typeof dictAr[k] === 'string' && (dictAr[k].endsWith(' (AR)') || dictAr[k].endsWith('(AR)'))
      );
    } else if (statusFilter === 'mock_en') {
      keys = keys.filter(
        (k) => typeof dictEn[k] === 'string' && (dictEn[k].endsWith(' (EN)') || dictEn[k].endsWith('(EN)'))
      );
    } else if (statusFilter === 'missing') {
      keys = keys.filter((k) => !dictAr[k] || !dictEn[k] || dictAr[k] === dictFr[k]);
    } else if (statusFilter === 'translated') {
      keys = keys.filter((k) => {
        const ar = dictAr[k];
        const en = dictEn[k];
        return (
          typeof ar === 'string' &&
          typeof en === 'string' &&
          ar &&
          en &&
          !ar.endsWith(' (AR)') &&
          !ar.endsWith('(AR)') &&
          !en.endsWith(' (EN)') &&
          !en.endsWith('(EN)') &&
          ar !== dictFr[k]
        );
      });
    }

    // Apply searchQuery
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      keys = keys.filter(
        (k) =>
          k.toLowerCase().includes(s) ||
          (dictFr[k] || '').toLowerCase().includes(s) ||
          (dictAr[k] || '').toLowerCase().includes(s) ||
          (dictEn[k] || '').toLowerCase().includes(s)
      );
    }

    return keys;
  };

  const filteredKeys = getFilteredKeys();

  return (
    <motion.div
      key="dictionary-view"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="space-y-8"
      id="translation-dictionary-tab"
    >
      {/* Dictionary Search & Tools banner */}
      <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-sm p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute start-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Rechercher une clé ou une traduction (FR, AR, EN)...") || "Rechercher une clé ou une traduction (FR, AR, EN)..."}
              className="w-full bg-zinc-50 border border-zinc-200/60 rounded-2xl ps-14 pe-6 py-4 font-medium text-zinc-800 outline-none focus:border-orange-500 shadow-inner transition-all text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleCleanFictive}
              disabled={isCleaningFictive}
              className="px-6 py-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-2xl font-sans font-bold text-xs uppercase tracking-widest rtl:tracking-normal flex items-center gap-2 transition-all shadow-md shrink-0 disabled:opacity-50 cursor-pointer border-none"
              title={t("Traduit automatiquement tous les termes restant qui contiennent (AR) ou (EN) via l'IA Mabrouk.") || "Traduit automatiquement tous les termes restant qui contiennent (AR) ou (EN) via l'IA Mabrouk."}
            >
              <Wand2 className={`w-4 h-4 ${isCleaningFictive ? 'animate-spin' : 'animate-pulse text-white'}`} />
              {t("Traduire Fictifs (IA)")}
            </button>

            <button
              onClick={() => setShowNewKeyModal(true)}
              className="px-6 py-4 bg-zinc-950 text-white rounded-2xl font-sans font-bold text-xs uppercase tracking-widest rtl:tracking-normal flex items-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer border-none"
            >
              <Plus className="w-4 h-4 text-orange-500" /> {t("Ajouter une Clé")}
            </button>
          </div>
        </div>

        {/* State/Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 border-t border-zinc-50 pt-5">
          <span className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal me-2">
            {t("Filtrer par état :")}
          </span>
          {[
            { id: 'all', label: 'Tous les termes', count: Object.keys(dictFr).length },
            {
              id: 'mock_ar',
              label: 'Fictifs AR 🇩🇿',
              count: Object.keys(dictFr).filter(
                (k) => typeof dictAr[k] === 'string' && (dictAr[k].endsWith(' (AR)') || dictAr[k].endsWith('(AR)'))
              ).length,
              color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200',
            },
            {
              id: 'mock_en',
              label: 'Fictifs EN 🇬🇧',
              count: Object.keys(dictFr).filter(
                (k) => typeof dictEn[k] === 'string' && (dictEn[k].endsWith(' (EN)') || dictEn[k].endsWith('(EN)'))
              ).length,
              color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200',
            },
            {
              id: 'missing',
              label: 'Manquant / Non Traduit',
              count: Object.keys(dictFr).filter((k) => !dictAr[k] || !dictEn[k] || dictAr[k] === dictFr[k]).length,
              color: 'text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200',
            },
            {
              id: 'translated',
              label: 'Traduits Réels',
              count: Object.keys(dictFr).filter((k) => {
                const ar = dictAr[k];
                const en = dictEn[k];
                return (
                  typeof ar === 'string' &&
                  typeof en === 'string' &&
                  ar &&
                  en &&
                  !ar.endsWith(' (AR)') &&
                  !ar.endsWith('(AR)') &&
                  !en.endsWith(' (EN)') &&
                  !en.endsWith('(EN)') &&
                  ar !== dictFr[k]
                );
              }).length,
              color: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-100',
            },
          ].map((pill) => {
            const isActive = statusFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setStatusFilter(pill.id as any)}
                className={`px-4 py-2.5 border rounded-xl text-[10px] font-black uppercase tracking-wider rtl:tracking-normal transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                    : pill.color || 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {pill.label}
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[9px] ${
                    isActive ? 'bg-zinc-800 text-white' : 'bg-white border border-zinc-200 text-zinc-500'
                  }`}
                >
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dictionary Grid List */}
      <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-sm overflow-hidden p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-50 pb-4">
          <span className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-[0.2em]">
            {filteredKeys.length} {t("Termes Trouvés")}
          </span>
          <span className="text-[10px] font-sans font-bold text-zinc-500 uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t("Statut Direct")}
          </span>
        </div>

        <div className="divide-y divide-zinc-100/60 max-h-[600px] overflow-y-auto pe-2">
          {filteredKeys.length === 0 ? (
            <div className="py-20 text-center font-bold text-zinc-300 uppercase tracking-widest rtl:tracking-normal">
              {t("Aucun terme ne correspond à vos filtres ou recherche.")}
            </div>
          ) : (
            filteredKeys.slice(0, 100).map((key) => (
              <TranslationDictionaryRow
                key={key}
                translationKey={key}
                dictFr={dictFr}
                dictAr={dictAr}
                dictEn={dictEn}
                editingKey={editingKey}
                setEditingKey={setEditingKey}
                editForm={editForm}
                setEditForm={setEditForm}
                isTranslatingSingle={isTranslatingSingle}
                handleTranslateSingleKey={handleTranslateSingleKey}
                isSavingKey={isSavingKey}
                handleSaveTranslation={handleSaveTranslation}
              />
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};
