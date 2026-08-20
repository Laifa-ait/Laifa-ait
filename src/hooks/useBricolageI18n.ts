import { useState, useEffect, useCallback } from 'react';
import i18n from '../i18n';
import { BricolageLanguage } from '../types/bricolageI18n';

export function useBricolageI18n() {
  const [currentLang, setCurrentLang] = useState<BricolageLanguage>(() => {
    const saved = localStorage.getItem('bricolage_lang');
    if (saved === 'fr' || saved === 'ar' || saved === 'en') return saved;
    const i18nLang = i18n.language?.substring(0, 2);
    if (i18nLang === 'ar' || i18nLang === 'en') return i18nLang;
    return 'fr';
  });

  const isRTL = currentLang === 'ar';

  const changeLanguage = useCallback((lang: BricolageLanguage) => {
    setCurrentLang(lang);
    localStorage.setItem('bricolage_lang', lang);
    i18n.changeLanguage(lang);

    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLang;
      document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    }
  }, [currentLang]);

  const tBricolage = useCallback((keyPath: string, fallback: string = ''): string => {
    const fullKey = `bricolage.${keyPath}`;
    const translated = i18n.t(fullKey);
    if (translated && translated !== fullKey) {
      return translated;
    }
    return fallback;
  }, []);

  return {
    currentLang,
    changeLanguage,
    isRTL,
    tBricolage
  };
}
