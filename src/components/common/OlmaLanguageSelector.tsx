import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type SupportedLanguage = 'fr' | 'ar' | 'en';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'fr', label: 'Français', nativeLabel: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', label: 'Arabe', nativeLabel: 'العربية', flag: '🇩🇿', dir: 'rtl' },
  { code: 'en', label: 'Anglais', nativeLabel: 'English', flag: '🇬🇧', dir: 'ltr' },
];

interface OlmaLanguageSelectorProps {
  variant?: 'pill' | 'compact' | 'drawer';
  className?: string;
}

export const OlmaLanguageSelector: React.FC<OlmaLanguageSelectorProps> = React.memo(({
  variant = 'pill',
  className = '',
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const rawLang = (i18n.language || 'fr').split('-')[0].toLowerCase() as SupportedLanguage;
  const currentLangCode: SupportedLanguage = ['fr', 'ar', 'en'].includes(rawLang) ? rawLang : 'fr';
  const currentOption = SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  const handleSelectLanguage = useCallback((code: SupportedLanguage) => {
    i18n.changeLanguage(code);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = code;
      document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    }
    setIsOpen(false);
  }, [i18n]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Drawer variant: Horizontal segmented control inside side drawers
  if (variant === 'drawer') {
    return (
      <div className={`p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 ${className}`}>
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <span>Langue / Language / اللغة</span>
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase">
            {currentOption.code}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLangCode;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                }`}
                title={lang.label}
              >
                <span>{lang.flag}</span>
                <span className="text-[11px]">{lang.nativeLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Compact circular or rounded pill button with dropdown menu
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        id="olma-language-selector-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Changer de langue (FR / AR / EN)"
        className={`flex items-center gap-1.5 transition-all cursor-pointer select-none ${
          variant === 'compact'
            ? 'w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 border border-slate-200/70 justify-center shadow-2xs'
            : 'px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100/90 text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 border border-slate-200/70 shadow-2xs'
        }`}
      >
        <Globe className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
          {currentOption.code}
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="olma-language-selector-btn"
          className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            Choisir la langue
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLangCode;
            return (
              <button
                key={lang.code}
                role="menuitem"
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-amber-50/80 text-amber-950 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.nativeLabel}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({lang.label})</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

OlmaLanguageSelector.displayName = 'OlmaLanguageSelector';
