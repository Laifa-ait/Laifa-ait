/**
 * OLMART — Olma Immo & Location Visual Foundation & Design Tokens
 * 
 * Ce fichier formalise les tokens sémantiques scoped pour l'univers Olma Immo.
 * Il garantit une étanchéité totale avec le Marketplace Olmart.
 * 
 * Direction visuelle :
 * - Forest / Petrol (#1E3835, #1A3831, #0D281E)
 * - Warm Ivory (#F7F4ED, #FAF8F5)
 * - Warm Beige (#F2EEE5, #E8E2D4, #D8D2C4)
 * - Terracotta & Accent (#C97A40, #D97706)
 * - Warm Highlight (#EBDCB8)
 */

export const olmaTokens = {
  colors: {
    brand: {
      primary: 'var(--olma-brand-primary, #1A3831)',
      primaryDark: 'var(--olma-brand-primary-dark, #0D281E)',
      primaryLight: 'var(--olma-brand-primary-light, #2A4D45)',
      accent: 'var(--olma-brand-accent, #C97A40)',
      accentSoft: 'var(--olma-brand-accent-soft, #E8A87C)',
      highlight: 'var(--olma-brand-highlight, #EBDCB8)',
      highlightLight: 'var(--olma-brand-highlight-light, #F4ECD8)',
    },
    background: {
      base: 'var(--olma-bg-base, #FAF8F5)',
      subtle: 'var(--olma-bg-subtle, #F7F4ED)',
      muted: 'var(--olma-bg-muted, #F2EEE5)',
      dark: 'var(--olma-bg-dark, #0D281E)',
    },
    surface: {
      default: 'var(--olma-surface-default, #FFFFFF)',
      subtle: 'var(--olma-surface-subtle, #FAF8F5)',
      raised: 'var(--olma-surface-raised, #FFFFFF)',
      muted: 'var(--olma-surface-muted, #F7F4ED)',
      dark: 'var(--olma-surface-dark, #1A3831)',
    },
    border: {
      subtle: 'var(--olma-border-subtle, #F2EEE5)',
      default: 'var(--olma-border-default, #E8E2D4)',
      strong: 'var(--olma-border-strong, #D8D2C4)',
      focus: 'var(--olma-border-focus, #1A3831)',
      accent: 'var(--olma-border-accent, #EBDCB8)',
    },
    text: {
      primary: 'var(--olma-text-primary, #1C211E)',
      secondary: 'var(--olma-text-secondary, #4A5550)',
      muted: 'var(--olma-text-muted, #738079)',
      subtle: 'var(--olma-text-subtle, #9CA8A1)',
      inverse: 'var(--olma-text-inverse, #FAF8F5)',
      highlight: 'var(--olma-text-highlight, #EBDCB8)',
      accent: 'var(--olma-text-accent, #C97A40)',
    },
    semantic: {
      success: 'var(--olma-semantic-success, #059669)',
      successLight: 'var(--olma-semantic-success-light, #ECFDF5)',
      warning: 'var(--olma-semantic-warning, #D97706)',
      warningLight: 'var(--olma-semantic-warning-light, #FEF3C7)',
      danger: 'var(--olma-semantic-danger, #E11D48)',
      dangerLight: 'var(--olma-semantic-danger-light, #FFF1F2)',
      info: 'var(--olma-semantic-info, #0284C7)',
      infoLight: 'var(--olma-semantic-info-light, #F0F9FF)',
    },
  },
  typography: {
    fontFamily: {
      display: 'var(--olma-font-display, "Playfair Display", Georgia, serif)',
      sans: 'var(--olma-font-sans, "Inter", "Cairo", system-ui, sans-serif)',
    },
    scale: {
      hero: 'clamp(2rem, 5vw, 3.25rem)',
      display: 'clamp(1.75rem, 4vw, 2.5rem)',
      h1: '1.875rem',     /* 30px */
      h2: '1.5rem',       /* 24px */
      h3: '1.25rem',      /* 20px */
      h4: '1.125rem',     /* 18px */
      bodyLead: '1.0625rem', /* 17px */
      body: '0.9375rem',     /* 15px */
      bodySmall: '0.8125rem',/* 13px */
      caption: '0.6875rem',  /* 11px */
      badge: '0.625rem',     /* 10px */
    },
    lineHeight: {
      tight: 1.15,
      display: 1.25,
      normal: 1.55,
      relaxed: 1.65,
    },
  },
  spacing: {
    xs: '0.25rem',  /* 4px */
    sm: '0.5rem',   /* 8px */
    md: '0.75rem',  /* 12px */
    lg: '1rem',     /* 16px */
    xl: '1.5rem',   /* 24px */
    '2xl': '2rem',  /* 32px */
    '3xl': '2.5rem',/* 40px */
    '4xl': '3.5rem',/* 56px */
  },
  radius: {
    sm: '0.375rem', /* 6px */
    md: '0.5rem',   /* 8px */
    lg: '0.75rem',  /* 12px */
    xl: '1rem',     /* 16px - Standard Olma Cards */
    '2xl': '1.25rem',/* 20px - Prominent Containers */
    '3xl': '1.5rem', /* 24px - Shells / Sheets */
    full: '9999px',  /* Pills / Badges */
  },
  shadows: {
    subtle: 'var(--olma-shadow-subtle, 0 1px 2px rgba(26, 56, 49, 0.04), 0 2px 6px rgba(26, 56, 49, 0.02))',
    card: 'var(--olma-shadow-card, 0 4px 16px -2px rgba(26, 56, 49, 0.05), 0 1px 3px rgba(26, 56, 49, 0.03))',
    floating: 'var(--olma-shadow-floating, 0 12px 32px -4px rgba(26, 56, 49, 0.12), 0 4px 12px rgba(26, 56, 49, 0.06))',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
    normal: '250ms cubic-bezier(0.16, 1, 0.3, 1)',
    slow: '350ms cubic-bezier(0.16, 1, 0.3, 1)',
  },
} as const;

export type OlmaTokens = typeof olmaTokens;
