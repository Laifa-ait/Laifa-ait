import { describe, it, expect } from 'vitest';
import { sanitizeHTML, sanitizePlainText, sanitizeURL, sanitizeXSS } from '../utils/sanitization';

describe('Enterprise Sanitization & XSS Defense Suite (DOMPurify)', () => {
  describe('Dangerous executable tags stripping', () => {
    it('removes <script> tags and inner executable code', () => {
      const payload = '<script>alert("XSS")</script><p>Clean content</p>';
      expect(sanitizeHTML(payload)).toBe('<p>Clean content</p>');
    });

    it('removes <iframe> tags completely', () => {
      const payload = '<iframe src="https://attacker.com/phish"></iframe><span>Safe</span>';
      expect(sanitizeHTML(payload)).toBe('<span>Safe</span>');
    });

    it('removes <object> and <embed> tags', () => {
      const payload = '<object data="exploit.swf"></object><embed src="bad.swf"></embed><p>Content</p>';
      expect(sanitizeHTML(payload)).toBe('<p>Content</p>');
    });

    it('removes <svg> tags and nested onload/onerror vectors', () => {
      const payload = '<svg onload="alert(1)"><circle r="10"/></svg><p>Text</p>';
      expect(sanitizeHTML(payload)).toBe('<p>Text</p>');
    });
  });

  describe('Inline event handlers stripping', () => {
    it('strips onerror attribute from images', () => {
      const payload = '<img src="valid.jpg" onerror="alert(document.cookie)" />';
      const sanitized = sanitizeHTML(payload);
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('<img src="valid.jpg"');
    });

    it('strips onclick event handler from buttons or links', () => {
      const payload = '<a href="https://example.com" onclick="stealTokens()">Click here</a>';
      const sanitized = sanitizeHTML(payload);
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('stealTokens');
      expect(sanitized).toContain('href="https://example.com"');
    });

    it('strips onload event handler', () => {
      const payload = '<body onload="maliciousCode()"><p>Body text</p></body>';
      const sanitized = sanitizeHTML(payload);
      expect(sanitized).not.toContain('onload');
      expect(sanitized).not.toContain('maliciousCode');
    });

    it('strips SVG with embedded event handlers', () => {
      const payload = '<div><svg><g onload="alert(1)"></g></svg>Hello</div>';
      const sanitized = sanitizeHTML(payload);
      expect(sanitized).toBe('<div>Hello</div>');
    });
  });

  describe('Dangerous URI Schemes & Protocol Obfuscation', () => {
    it('strips javascript: URI in href', () => {
      const payload = '<a href="javascript:alert(1)">Click Me</a>';
      const sanitized = sanitizeHTML(payload);
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('alert');
    });

    it('neutralizes HTML entity encoded javascript: URI (jav&#97;script:)', () => {
      const payload = '<a href="jav&#97;script:alert(1)">Malicious Link</a>';
      const sanitized = sanitizeHTML(payload);
      expect(sanitized).not.toContain('javascript');
      expect(sanitized).not.toContain('alert');
    });

    it('neutralizes URL encoded javascript: URI', () => {
      const payload = '<a href="javascript%3Aalert(1)">Encoded Attack</a>';
      const sanitized = sanitizeHTML(payload);
      expect(sanitized).not.toContain('href=');
    });

    it('disallows vbscript: protocol in URLs', () => {
      const payload = '<a href="vbscript:msgbox(1)">VBScript Link</a>';
      const sanitized = sanitizeHTML(payload);
      expect(sanitized).not.toContain('vbscript:');
    });

    it('disallows data: URLs in general links to prevent data:text/html phishing', () => {
      const payload = '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">Data URI</a>';
      const sanitized = sanitizeHTML(payload);
      expect(sanitized).not.toContain('data:text/html');
    });
  });

  describe('Nested and Reconstituted tags defense', () => {
    it('handles nested <scr<script>ipt> evasion attempt by neutralizing executable structure', () => {
      const payload = '<scr<script>ipt>alert(1)</script>';
      const sanitized = sanitizeHTML(payload);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('<script');
      // The output is rendered as safe inert text entity
      expect(sanitized).toBe('ipt&gt;alert(1)');
    });

    it('handles unclosed tags and malformed HTML correctly', () => {
      const payload = '<script src="evil.js" <p>Content</p>';
      const sanitized = sanitizeHTML(payload);
      expect(sanitized).not.toContain('evil.js');
    });
  });

  describe('Legitimate safe HTML preservation', () => {
    it('preserves authorized rich typography (p, strong, em, h2, ul, li)', () => {
      const payload = '<h2>Description</h2><p>Ce produit est <strong>authentique</strong> et <em>garanti</em>.</p><ul><li>Caractéristique 1</li></ul>';
      const sanitized = sanitizeHTML(payload);
      expect(sanitized).toBe('<h2>Description</h2><p>Ce produit est <strong>authentique</strong> et <em>garanti</em>.</p><ul><li>Caractéristique 1</li></ul>');
    });

    it('preserves valid HTTPS links and safe image sources', () => {
      const payload = '<p><a href="https://olmart.dz/produit/123">Voir produit</a><img src="https://images.olmart.dz/p.jpg" alt="Photo" /></p>';
      const sanitized = sanitizeHTML(payload);
      expect(sanitized).toContain('href="https://olmart.dz/produit/123"');
      expect(sanitized).toContain('src="https://images.olmart.dz/p.jpg"');
    });

    it('supports backward-compatible sanitizeXSS alias', () => {
      const payload = '<p>Safe</p><script>bad()</script>';
      expect(sanitizeXSS(payload)).toBe('<p>Safe</p>');
    });
  });

  describe('Plain Text Sanitizer (sanitizePlainText)', () => {
    it('strips all HTML tags and returns only text', () => {
      const payload = '<h1>Title</h1><p>Description with <b>bold</b> and <a href="#">link</a>.</p>';
      expect(sanitizePlainText(payload)).toBe('TitleDescription with bold and link.');
    });

    it('strips malicious script and tags from text fields completely', () => {
      const payload = 'iPhone 15 Pro <script>alert("XSS")</script>';
      expect(sanitizePlainText(payload)).toBe('iPhone 15 Pro ');
    });
  });

  describe('URL Sanitizer (sanitizeURL)', () => {
    it('permits valid HTTPS, HTTP, and mailto URLs', () => {
      expect(sanitizeURL('https://olmart.dz/help')).toBe('https://olmart.dz/help');
      expect(sanitizeURL('http://example.com')).toBe('http://example.com');
      expect(sanitizeURL('mailto:support@olmart.dz')).toBe('mailto:support@olmart.dz');
      expect(sanitizeURL('tel:+213555123456')).toBe('tel:+213555123456');
    });

    it('rejects javascript:, vbscript: and data: URLs', () => {
      expect(sanitizeURL('javascript:alert(1)')).toBe('#');
      expect(sanitizeURL('JAVASCRIPT:alert(1)')).toBe('#');
      expect(sanitizeURL('  javascript:void(0)  ')).toBe('#');
      expect(sanitizeURL('vbscript:msgbox(1)')).toBe('#');
      expect(sanitizeURL('data:text/html;base64,AAAA')).toBe('#');
    });

    it('rejects obfuscated/encoded javascript: URLs', () => {
      expect(sanitizeURL('jav%61script:alert(1)')).toBe('#');
      expect(sanitizeURL('java\0script:alert(1)')).toBe('#');
    });
  });
});
