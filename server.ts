import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import type http from "node:http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const distServer = path.resolve(__dirname, "dist", "server.cjs");
const buildServer = path.resolve(__dirname, "build", "server.cjs");

// When executing directly as primary entrypoint (e.g., node server.ts / npm start in Cloud Run)
const isTestEnv = process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);
const isDevCommand =
  process.env.npm_lifecycle_event === "dev" ||
  Boolean(process.argv[1] && process.argv[1].includes("tsx"));

const isDirectRun =
  !isTestEnv &&
  (Boolean(process.argv[1]) &&
    (process.argv[1].includes("server.ts") ||
      process.argv[1].includes("server.js") ||
      process.argv[1].endsWith("server") ||
      process.env.NODE_ENV === "production"));

if (isDirectRun) {
  if (!isDevCommand && fs.existsSync(distServer)) {
    process.env.NODE_ENV = process.env.NODE_ENV || "production";
    require(distServer);
  } else if (!isDevCommand && fs.existsSync(buildServer)) {
    process.env.NODE_ENV = process.env.NODE_ENV || "production";
    require(buildServer);
  } else if (isDevCommand) {
    await import("./server.core.ts");
  } else {
    // If running in production but bundled files are absent, build on the fly or load core
    try {
      const { execSync } = createRequire(import.meta.url)("child_process");
      execSync("npx esbuild server.core.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs", { stdio: "inherit" });
      if (fs.existsSync(distServer)) {
        process.env.NODE_ENV = process.env.NODE_ENV || "production";
        require(distServer);
      } else {
        await import("./server.core.ts");
      }
    } catch {
      await import("./server.core.ts").catch(async () => {
        await import("./server.core.js").catch(async () => {
          await import("./server.core");
        });
      });
    }
  }
}

let cachedCorePromise: Promise<typeof import("./server.core")> | null = null;
function getCore(): Promise<typeof import("./server.core")> {
  if (!cachedCorePromise) {
    cachedCorePromise = (async () => {
      try {
        return await import("./server.core.ts");
      } catch {
        try {
          return await import("./server.core.js");
        } catch {
          return await import("./server.core");
        }
      }
    })();
  }
  return cachedCorePromise;
}

let activeStartPromise: Promise<http.Server> | null = null;

/**
 * Re-export testing & lifecycle helpers for Vitest test suites.
 */
export function startServer(portOverride?: number): Promise<http.Server> {
  if (activeStartPromise) {
    return activeStartPromise;
  }
  activeStartPromise = (async () => {
    try {
      const core = await getCore();
      return await core.startServer(portOverride);
    } catch (err) {
      activeStartPromise = null;
      throw err;
    }
  })();
  return activeStartPromise;
}

export async function stopServerForTesting(): Promise<void> {
  activeStartPromise = null;
  const core = await getCore();
  return core.stopServerForTesting();
}

export const shutdown = async (signal: string): Promise<void> => {
  activeStartPromise = null;
  const core = await getCore();
  return core.shutdown(signal);
};
