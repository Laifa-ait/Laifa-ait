import { describe, it, expect } from "vitest";
import * as path from "node:path";
import {
  runCoherenceAudit,
  extractRulesCollections,
} from "../../scripts/lint-firestore-rules-coherence";

describe("Linter de Cohérence Statique Firestore (Codebase React vs firestore.rules)", () => {
  const rootDir = process.cwd();
  const rulesPath = path.join(rootDir, "firestore.rules");
  const srcDir = path.join(rootDir, "src");

  it("garantit que 100% des collections appelées par le client React ont une règle match dans firestore.rules", () => {
    const audit = runCoherenceAudit(rulesPath, srcDir);

    expect(audit.clientCollections.size).toBeGreaterThan(0);
    expect(audit.ruleCollections.size).toBeGreaterThan(0);

    if (audit.missingInRules.length > 0) {
      const details = audit.missingInRules
        .map((col) => {
          const files = audit.clientCollections.get(col) || [];
          return `Collection '${col}' appelée dans: ${files.join(", ")}`;
        })
        .join("\n");
      expect.fail(
        `Collections clientes orphelines sans règle Firestore correspondante :\n${details}`
      );
    }

    expect(audit.missingInRules).toEqual([]);
  });

  it("détecte correctement les collections déclarées dans firestore.rules", () => {
    const sampleRules = `
      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          match /{document=**} { allow read, write: if false; }
          match /users/{userId} { allow read: if true; }
          match /orders/{orderId} {
            match /messages/{messageId} { allow read: if true; }
          }
          match /translations/{lang} { allow read: if true; }
        }
      }
    `;
    const cols = extractRulesCollections(sampleRules);
    expect(cols.has("users")).toBe(true);
    expect(cols.has("orders")).toBe(true);
    expect(cols.has("messages")).toBe(true);
    expect(cols.has("translations")).toBe(true);
    expect(cols.has("databases")).toBe(false);
  });

  it("signale une anomalie si une collection cliente n'a pas de règle", () => {
    const sampleRules = `
      service cloud.firestore {
        match /databases/{database}/documents {
          match /users/{userId} { allow read: if true; }
        }
      }
    `;
    const rulesCols = extractRulesCollections(sampleRules);
    const clientCols = new Map<string, string[]>([
      ["users", ["src/pages/Profile.tsx"]],
      ["unprotected_collection", ["src/pages/Hack.tsx"]],
    ]);

    const missing = Array.from(clientCols.keys()).filter((c) => !rulesCols.has(c));
    expect(missing).toEqual(["unprotected_collection"]);
  });
});
