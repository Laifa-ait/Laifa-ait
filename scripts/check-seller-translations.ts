import fs from "fs";
import path from "path";

/**
 * Olmart Marketplace - Seller Dashboard Translation Diagnostic Tool
 * Scans all TSX/TS files in Seller pages and components for i18n keys
 * and verifies presence in FR, AR, and EN locale JSON files.
 */

const LOCALES_DIR = path.join(process.cwd(), "public", "locales");
const TARGET_DIRS = [
  path.join(process.cwd(), "src", "pages", "Seller"),
  path.join(process.cwd(), "src", "components", "Seller"),
];

interface TranslationReport {
  totalFilesScanned: number;
  totalKeysExtracted: number;
  uniqueKeysCount: number;
  missingInFr: string[];
  missingInAr: string[];
  missingInEn: string[];
}

function loadLocaleJson(lang: string): Record<string, string> {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ [Olmart Translation Diagnostic] Locale file missing: ${filePath}`);
    return {};
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`❌ [Olmart Translation Diagnostic] Failed to parse JSON for ${lang}:`, err);
    return {};
  }
}

function getFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      results.push(filePath);
    }
  });
  return results;
}

function extractKeysFromContent(content: string): string[] {
  const keys: Set<string> = new Set();

  // Pattern 1: Double-quoted strings -> t("...") or getNavLabel("...")
  const doubleQuoteRegex = /\b(?:t|getNavLabel)\(\s*"((?:[^"\\]|\\.)*)"/g;
  let match: RegExpExecArray | null;
  while ((match = doubleQuoteRegex.exec(content)) !== null) {
    if (match[1]) {
      const decoded = match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      if (!decoded.includes("${")) {
        keys.add(decoded.trim());
      }
    }
  }

  // Pattern 2: Single-quoted strings -> t('...') or getNavLabel('...')
  const singleQuoteRegex = /\b(?:t|getNavLabel)\(\s*'((?:[^'\\]|\\.)*)'/g;
  while ((match = singleQuoteRegex.exec(content)) !== null) {
    if (match[1]) {
      const decoded = match[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\');
      if (!decoded.includes("${")) {
        keys.add(decoded.trim());
      }
    }
  }

  // Pattern 3: Backtick strings (without template expressions) -> t(`...`) or getNavLabel(`...`)
  const backtickRegex = /\b(?:t|getNavLabel)\(\s*`([^`\\$]*)`/g;
  while ((match = backtickRegex.exec(content)) !== null) {
    if (match[1] && !match[1].includes("${")) {
      keys.add(match[1].trim());
    }
  }

  return Array.from(keys);
}

function runDiagnostic() {
  console.log("🟢 [Olmart Translation Diagnostic] 🚀 Starting diagnostic scan for Seller Dashboard...");

  const frLocales = loadLocaleJson("fr");
  const arLocales = loadLocaleJson("ar");
  const enLocales = loadLocaleJson("en");

  let allFiles: string[] = [];
  TARGET_DIRS.forEach((dir) => {
    allFiles = allFiles.concat(getFilesRecursively(dir));
  });

  const extractedKeysMap: Map<string, string[]> = new Map(); // key -> files where found
  let totalKeysExtracted = 0;

  allFiles.forEach((file) => {
    const relativePath = path.relative(process.cwd(), file);
    const content = fs.readFileSync(file, "utf-8");
    const keys = extractKeysFromContent(content);
    totalKeysExtracted += keys.length;

    keys.forEach((key) => {
      if (!extractedKeysMap.has(key)) {
        extractedKeysMap.set(key, []);
      }
      extractedKeysMap.get(key)!.push(relativePath);
    });
  });

  const uniqueKeys = Array.from(extractedKeysMap.keys());
  const report: TranslationReport = {
    totalFilesScanned: allFiles.length,
    totalKeysExtracted,
    uniqueKeysCount: uniqueKeys.length,
    missingInFr: [],
    missingInAr: [],
    missingInEn: [],
  };

  uniqueKeys.forEach((key) => {
    if (!(key in frLocales)) report.missingInFr.push(key);
    if (!(key in arLocales)) report.missingInAr.push(key);
    if (!(key in enLocales)) report.missingInEn.push(key);
  });

  console.log(`🟢 [Olmart Translation Diagnostic] 📊 Summary:`);
  console.log(`   - Files scanned: ${report.totalFilesScanned}`);
  console.log(`   - Total translation calls found: ${report.totalKeysExtracted}`);
  console.log(`   - Unique translation keys extracted: ${report.uniqueKeysCount}`);

  if (report.missingInFr.length > 0) {
    console.log(`\n⚠️ [Olmart Translation Diagnostic] ⚠️ Missing in FR (${report.missingInFr.length} keys):`);
    report.missingInFr.forEach((key) => console.log(`   - "${key}"`));
  } else {
    console.log(`🟢 [Olmart Translation Diagnostic] ✅ All keys present in FR (French)`);
  }

  if (report.missingInAr.length > 0) {
    console.log(`\n⚠️ [Olmart Translation Diagnostic] ⚠️ Missing in AR (${report.missingInAr.length} keys):`);
    report.missingInAr.forEach((key) => console.log(`   - "${key}"`));
  } else {
    console.log(`🟢 [Olmart Translation Diagnostic] ✅ All keys present in AR (Arabic)`);
  }

  if (report.missingInEn.length > 0) {
    console.log(`\n⚠️ [Olmart Translation Diagnostic] ⚠️ Missing in EN (${report.missingInEn.length} keys):`);
    report.missingInEn.forEach((key) => console.log(`   - "${key}"`));
  } else {
    console.log(`🟢 [Olmart Translation Diagnostic] ✅ All keys present in EN (English)`);
  }

  const hasMissing =
    report.missingInFr.length > 0 ||
    report.missingInAr.length > 0 ||
    report.missingInEn.length > 0;

  if (hasMissing) {
    console.error(`\n❌ [Olmart Translation Diagnostic] Status: Incomplete translations detected. Failing CI check.`);
    process.exit(1);
  } else {
    console.log(`\n🟢 [Olmart Translation Diagnostic] Status: 100% Coverage across FR, AR, EN for Seller Dashboard!`);
    process.exit(0);
  }
}

runDiagnostic();
