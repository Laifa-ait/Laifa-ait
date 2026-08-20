import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Check, Wand2 } from 'lucide-react';

export interface EditForm {
  fr: string;
  ar: string;
  en: string;
}

interface TranslationDictionaryRowProps {
  translationKey: string;
  dictFr: Record<string, string>;
  dictAr: Record<string, string>;
  dictEn: Record<string, string>;
  editingKey: string | null;
  setEditingKey: (key: string | null) => void;
  editForm: EditForm;
  setEditForm: React.Dispatch<React.SetStateAction<EditForm>>;
  isTranslatingSingle: boolean;
  handleTranslateSingleKey: (key: string, frText: string) => Promise<void>;
  isSavingKey: string | null;
  handleSaveTranslation: (key: string) => Promise<void>;
}

export const TranslationDictionaryRow: React.FC<TranslationDictionaryRowProps> = ({
  translationKey,
  dictFr,
  dictAr,
  dictEn,
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
  const frVal = dictFr[translationKey] || '';
  const arVal = dictAr[translationKey] || '';
  const enVal = dictEn[translationKey] || '';
  const isEditing = editingKey === translationKey;

  return (
    <div
      className="py-6 hover:bg-zinc-50/40 px-4 rounded-xl transition-all group flex flex-col space-y-4"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="font-mono text-[10px] font-bold text-orange-500 bg-orange-50/80 px-2.5 py-1 rounded">
            {translationKey}
          </span>
          <div className="mt-2 text-xs font-bold text-zinc-400 flex items-center gap-2">
            {arVal && typeof arVal === 'string' && arVal !== frVal && !arVal.endsWith(' (AR)') && !arVal.endsWith('(AR)') ? (
              <span className="text-emerald-500 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {t("AR Traduit")}
              </span>
            ) : (
              <span className="text-amber-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {t("AR Manquant")}
              </span>
            )}
            <span className="text-zinc-200">|</span>
            {enVal && typeof enVal === 'string' && enVal !== frVal && !enVal.endsWith(' (EN)') && !enVal.endsWith('(EN)') ? (
              <span className="text-emerald-500 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {t("EN Traduit")}
              </span>
            ) : (
              <span className="text-amber-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {t("EN Manquant")}
              </span>
            )}
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={() => {
              setEditingKey(translationKey);
              setEditForm({ fr: frVal, ar: arVal, en: enVal });
            }}
            className="self-start md:self-center px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold text-[10px] uppercase tracking-wider rtl:tracking-normal transition-all cursor-pointer border-none"
          >
            {t("Modifier")}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-zinc-50/80 p-6 rounded-2xl border border-zinc-100 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100/60 pb-3 mb-2">
            <span className="text-[10px] font-sans font-bold text-zinc-500 uppercase tracking-wider rtl:tracking-normal">
              {t("Édition de Clé")}
            </span>
            <button
              type="button"
              onClick={() => handleTranslateSingleKey(translationKey, editForm.fr)}
              disabled={isTranslatingSingle}
              className="px-3.5 py-2 bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-600 rounded-xl font-bold text-[9px] uppercase tracking-wider rtl:tracking-normal transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isTranslatingSingle ? 'animate-spin' : ''}`} />
              {t("Traduire AR/EN via IA")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-sans font-bold text-zinc-400 uppercase">
                {t("Français (Source) :")}
              </span>
              <input
                type="text"
                value={editForm.fr}
                onChange={(e) => setEditForm((prev) => ({ ...prev, fr: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-xl p-3 font-medium text-xs text-zinc-800 outline-none focus:border-orange-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-sans font-bold text-zinc-400 uppercase">
                {t("Anglais (EN) :")}
              </span>
              <input
                type="text"
                value={editForm.en}
                onChange={(e) => setEditForm((prev) => ({ ...prev, en: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-xl p-3 font-medium text-xs text-zinc-800 outline-none focus:border-orange-500 transition-all"
              />
            </div>
            <div className="space-y-1 col-span-full">
              <span className="text-[9px] font-sans font-bold text-zinc-400 uppercase">
                {t("Arabe (AR - RTL) :")}
              </span>
              <input
                type="text"
                dir="rtl"
                value={editForm.ar}
                onChange={(e) => setEditForm((prev) => ({ ...prev, ar: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-xl p-3 font-sans font-bold text-xs text-zinc-800 text-end outline-none focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setEditingKey(null)}
              className="px-4 py-2 hover:bg-zinc-200 text-zinc-500 bg-transparent rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer border-none"
            >
              {t("Annuler")}
            </button>
            <button
              onClick={() => handleSaveTranslation(translationKey)}
              disabled={isSavingKey === translationKey}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[10px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal transition-all disabled:opacity-50 cursor-pointer border-none"
            >
              {isSavingKey === translationKey ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100/50">
            <p className="text-[8px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-1">
              {t("🇫🇷 FR (SOURCE)")}
            </p>
            <p className="text-zinc-800 font-bold">
              {frVal || <span className="italic text-zinc-300">{t("Aucun")}</span>}
            </p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100/50">
            <p className="text-[8px] font-sans font-bold text-zinc-400 tracking-widest rtl:tracking-normal mb-1">
              {t("🇬🇧 EN (ANGLAIS)")}
            </p>
            <p className="text-zinc-800 font-bold italic">
              {enVal || <span className="italic text-zinc-300">{t("Aucun")}</span>}
            </p>
          </div>
          <div className="p-3 bg-zinc-950 text-white rounded-xl border border-zinc-900 shadow-sm">
            <p className="text-[8px] font-sans font-bold text-white/40 tracking-widest rtl:tracking-normal mb-1">
              {t("🇩🇿 AR (ARABE)")}
            </p>
            <p className="text-white font-bold text-end" dir="rtl">
              {arVal || <span className="italic text-white/30">{t("la translation")}</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
