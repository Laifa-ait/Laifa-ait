import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useBricolageI18n } from '../../hooks/useBricolageI18n';
import { BricolageLanguage } from '../../types/bricolageI18n';

interface LanguageOption {
  code: BricolageLanguage;
  label: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

const LANGUAGES: LanguageOption[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', label: 'العربية', flag: '🇩🇿', dir: 'rtl' },
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' }
];

export const BricolageLanguageSelector: React.FC = () => {
  const { currentLang, changeLanguage } = useBricolageI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-amber-400 border border-slate-800 hover:bg-slate-800 hover:border-amber-500/50 text-xs font-black transition-all shadow-sm"
        title="Changer de langue / Change language / تغيير اللغة"
      >
        <Globe className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[11px] font-black uppercase tracking-wide">{activeOption.flag} {activeOption.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-40 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl z-50 overflow-hidden py-1">
          <div className="px-3 py-1.5 border-b border-slate-800/80 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Langue / Language
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors ${
                currentLang === lang.code
                  ? 'bg-amber-500/15 text-amber-400 font-black'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
