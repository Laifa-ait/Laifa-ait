import * as fs from "node:fs";
import * as path from "node:path";

export interface ScanResult {
  clientCollections: Map<string, string[]>;
  ruleCollections: Set<string>;
  missingInRules: string[];
}

/**
 * Extracts declared collection names and subcollection names from firestore.rules
 */
export function extractRulesCollections(rulesContent: string): Set<string> {
  const collections = new Set<string>();
  // Match top-level or subcollection patterns: match /collectionName/...
  const matchRegex = /match\s+\/([a-zA-Z0-9_-]+)\/\{/g;
  let match: RegExpExecArray | null;

  while ((match = matchRegex.exec(rulesContent)) !== null) {
    const col = match[1];
    if (col && col !== "databases") {
      collections.add(col);
    }
  }

  // Also catch wildcard paths like match /public_configs/{document=**} or match /translations/{lang}
  const wildcardRegex = /match\s+\/([a-zA-Z0-9_-]+)\/\{[a-zA-Z0-9_]+(=|\})/g;
  while ((match = wildcardRegex.exec(rulesContent)) !== null) {
    const col = match[1];
    if (col && col !== "databases") {
      collections.add(col);
    }
  }

  return collections;
}

/**
 * Recursively scans directory for TypeScript files
 */
function getFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== "dist" && file !== "build" && file !== ".git") {
        results = results.concat(getFilesRecursively(filePath));
      }
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      results.push(filePath);
    }
  }
  return results;
}

/**
 * Extracts client Firestore collection references from TypeScript files
 */
export function scanClientCollections(srcDir: string): Map<string, string[]> {
  const collectionUsages = new Map<string, string[]>();
  const files = getFilesRecursively(srcDir);

  // Pattern 1: collection(db, "collectionName")
  const colRegex = /collection\s*\(\s*db\s*,\s*["']([a-zA-Z0-9_-]+)["']/g;
  // Pattern 2: doc(db, "collectionName", ...)
  const docRegex = /doc\s*\(\s*db\s*,\s*["']([a-zA-Z0-9_-]+)["']/g;
  // Pattern 3: Subcollection in collection(db, "parent", id, "subcol")
  const subColRegex = /collection\s*\(\s*db\s*,\s*["'][a-zA-Z0-9_-]+["']\s*,\s*[^,]+\s*,\s*["']([a-zA-Z0-9_-]+)["']/g;
  // Pattern 4: Subcollection in doc(db, "parent", id, "subcol", docId)
  const subDocRegex = /doc\s*\(\s*db\s*,\s*["'][a-zA-Z0-9_-]+["']\s*,\s*[^,]+\s*,\s*["']([a-zA-Z0-9_-]+)["']/g;
  // Pattern 5: collectionGroup(db, "subcol")
  const groupRegex = /collectionGroup\s*\(\s*db\s*,\s*["']([a-zA-Z0-9_-]+)["']/g;

  for (const file of files) {
    // Exclude tests and backend server files (which use admin SDK)
    if (file.includes("/tests/") || file.includes(".test.") || file.includes(".spec.")) {
      continue;
    }
    const content = fs.readFileSync(file, "utf8");
    const relativePath = path.relative(process.cwd(), file);

    const patterns = [colRegex, docRegex, subColRegex, subDocRegex, groupRegex];
    for (const regex of patterns) {
      regex.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = regex.exec(content)) !== null) {
        const col = m[1];
        if (col && !["databases", "test", "demo"].includes(col)) {
          const list = collectionUsages.get(col) || [];
          if (!list.includes(relativePath)) {
            list.push(relativePath);
          }
          collectionUsages.set(col, list);
        }
      }
    }
  }

  return collectionUsages;
}

/**
 * Runs full static coherence audit
 */
export function runCoherenceAudit(rulesPath: string, srcDir: string): ScanResult {
  const rulesContent = fs.readFileSync(rulesPath, "utf8");
  const ruleCollections = extractRulesCollections(rulesContent);
  const clientCollections = scanClientCollections(srcDir);

  const missingInRules: string[] = [];
  for (const col of clientCollections.keys()) {
    if (!ruleCollections.has(col)) {
      missingInRules.push(col);
    }
  }

  return {
    clientCollections,
    ruleCollections,
    missingInRules,
  };
}

function runCli(): void {
  const rootDir = process.cwd();
  const rulesPath = path.join(rootDir, "firestore.rules");
  const srcDir = path.join(rootDir, "src");

  console.log("🔍 [Olmart Security Linter] Démarrage de l'analyse de cohérence statique...");
  const result = runCoherenceAudit(rulesPath, srcDir);

  console.log(`📊 Collections clientes détectées dans /src : ${result.clientCollections.size}`);
  console.log(`🛡️  Collections déclarées dans firestore.rules : ${result.ruleCollections.size}`);

  if (result.missingInRules.length > 0) {
    console.error("\n❌ ERREUR : Des collections requêtées par le client n'ont pas de règle dans firestore.rules !");
    console.error("Ces collections seront bloquées par le Default-Deny Catch-All :\n");
    for (const col of result.missingInRules) {
      const files = result.clientCollections.get(col) || [];
      console.error(`  - Collection '${col}' utilisée dans :`);
      for (const f of files) {
        console.error(`      • ${f}`);
      }
    }
    console.error("\n⚠️  Action requise : Ajoutez un bloc 'match /" + result.missingInRules[0] + "/{id}' dans firestore.rules.");
    process.exit(1);
  }

  console.log("\n✅ SUCCÈS : 100% des collections clientes sont couvertes et sécurisées dans firestore.rules !");
  for (const col of Array.from(result.clientCollections.keys()).sort()) {
    console.log(`  ✓ /${col} (${(result.clientCollections.get(col) || []).length} référence(s))`);
  }
}

// Only execute CLI when invoked directly
const isDirectCli = Boolean(process.argv[1]) && process.argv[1].includes("lint-firestore-rules-coherence");
if (isDirectCli) {
  runCli();
}
