import DOMPurify from 'isomorphic-dompurify';
import type { Config } from 'isomorphic-dompurify';

/**
 * OLMART Secure Sanitization Utility
 * Powered by DOMPurify (isomorphic) with strict enterprise allowlists.
 * Mitigates XSS, URI injection, and DOM clobbering attacks.
 */

// Explicit, minimal safe allowlist for rich HTML content
const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'b', 'i', 'strong', 'em', 'u', 's', 'strike',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'code', 'pre', 'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'a', 'img', 'span', 'div'
];

const DEFAULT_ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'width', 'height'
];

// Disallow dangerous schemes: javascript:, vbscript:, data:
const SAFE_URL_PATTERN = /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i;

/**
 * Strips whitespace, non-breaking space, and ASCII control characters (0-32).
 */
function stripControlAndWhitespace(input: string): string {
  let result = '';
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (code > 32 && code !== 160 && !/\s/.test(input[i])) {
      result += input[i];
    }
  }
  return result;
}

// Add hook to rigorously inspect and clean all href/src attributes against obfuscated URI schemes
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.hasAttribute('href')) {
    const rawHref = node.getAttribute('href') || '';
    let decoded = rawHref;
    try {
      decoded = decodeURIComponent(rawHref);
    } catch {
      // ignore decode error
    }
    const cleanProto = stripControlAndWhitespace(decoded).toLowerCase();
    if (
      cleanProto.startsWith('javascript:') ||
      cleanProto.startsWith('vbscript:') ||
      cleanProto.startsWith('data:') ||
      /^\s*javascript\s*[:%]/i.test(rawHref)
    ) {
      node.removeAttribute('href');
    }
  }

  if (node.hasAttribute('src')) {
    const rawSrc = node.getAttribute('src') || '';
    let decoded = rawSrc;
    try {
      decoded = decodeURIComponent(rawSrc);
    } catch {
      // ignore decode error
    }
    const cleanProto = stripControlAndWhitespace(decoded).toLowerCase();
    if (
      cleanProto.startsWith('javascript:') ||
      cleanProto.startsWith('vbscript:') ||
      /^\s*javascript\s*[:%]/i.test(rawSrc)
    ) {
      node.removeAttribute('src');
    }
  }
});

/**
 * Sanitizes rich HTML input using DOMPurify with strict allowlist.
 */
export function sanitizeHTML(input: string, customConfig?: Config): string {
  if (!input || typeof input !== 'string') return '';

  const config: Config = {
    ALLOWED_TAGS: DEFAULT_ALLOWED_TAGS,
    ALLOWED_ATTR: DEFAULT_ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: SAFE_URL_PATTERN,
    ADD_ATTR: ['rel'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'applet', 'meta', 'style', 'link', 'form', 'frame', 'frameset', 'svg', 'math'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur', 'style'],
    FORCE_BODY: true,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false,
    ...customConfig,
  };

  const clean = DOMPurify.sanitize(input, config);
  return typeof clean === 'string' ? clean : String(clean);
}

/**
 * Backward-compatible alias for HTML sanitization
 */
export function sanitizeXSS(input: string): string {
  return sanitizeHTML(input);
}

/**
 * Completely strips all HTML tags and returns safe plain text
 */
export function sanitizePlainText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  return typeof clean === 'string' ? clean : String(clean);
}

/**
 * Validates and sanitizes a URL to ensure it does not contain dangerous protocols (javascript:, data:, vbscript:)
 */
export function sanitizeURL(url: string, fallback = '#'): string {
  if (!url || typeof url !== 'string') return fallback;

  const trimmed = url.trim();

  // Normalize control chars and decode URI components to catch obfuscation like jav&#97;script:
  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    // If malformed URI encoding, reject or keep raw
  }

  // Remove whitespace and control characters from decoded string for protocol check
  const normalizedProtocol = stripControlAndWhitespace(decoded).toLowerCase();

  if (
    normalizedProtocol.startsWith('javascript:') ||
    normalizedProtocol.startsWith('vbscript:') ||
    normalizedProtocol.startsWith('data:')
  ) {
    return fallback;
  }

  if (SAFE_URL_PATTERN.test(trimmed)) {
    return trimmed;
  }

  return fallback;
}

