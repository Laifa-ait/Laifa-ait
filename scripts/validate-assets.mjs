import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const SUPPORTED_EXTENSIONS = /\.(png|jpg|jpeg|gif|webp)$/i;

function getTrackedFiles() {
  try {
    const output = execSync("git ls-files", { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
    return output.split("\n").filter(Boolean);
  } catch {
    // Fallback if git binary or repo is not initialized
    const files = [];
    function scanDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === "coverage") {
          continue;
        }
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    }
    scanDir(".");
    return files;
  }
}

function validateImageFile(filePath) {
  if (!fs.existsSync(filePath)) return true;
  const buf = fs.readFileSync(filePath);

  if (buf.length === 0) {
    return { valid: false, reason: "File is empty (0 bytes)" };
  }

  // Check HTML or error text signature
  const headText = buf.slice(0, 300).toString("utf8").toLowerCase();
  if (headText.includes("<html") || headText.includes("<!doctype html") || headText.includes("404 not found")) {
    return { valid: false, reason: "Contains HTML or 404 error page content" };
  }

  const ext = path.extname(filePath).toLowerCase();

  // Validate PNG magic bytes: 0x89 50 4E 47 0D 0A 1A 0A
  if (ext === ".png") {
    if (buf.length < 8 || buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) {
      return { valid: false, reason: "Invalid PNG magic signature" };
    }
    return { valid: true };
  }

  // Validate JPG/JPEG magic bytes: 0xFF D8 0xFF
  if (ext === ".jpg" || ext === ".jpeg") {
    if (buf.length < 3 || buf[0] !== 0xff || buf[1] !== 0xd8 || buf[2] !== 0xff) {
      return { valid: false, reason: "Invalid JPEG magic signature" };
    }
    return { valid: true };
  }

  // Validate GIF magic bytes: GIF87a or GIF89a
  if (ext === ".gif") {
    const sig = buf.slice(0, 6).toString("utf8");
    if (sig !== "GIF87a" && sig !== "GIF89a") {
      return { valid: false, reason: "Invalid GIF magic signature" };
    }
    return { valid: true };
  }

  // Validate WebP magic bytes: RIFF...WEBP
  if (ext === ".webp") {
    if (
      buf.length < 12 ||
      buf.slice(0, 4).toString("utf8") !== "RIFF" ||
      buf.slice(8, 12).toString("utf8") !== "WEBP"
    ) {
      return { valid: false, reason: "Invalid WebP magic signature" };
    }
    return { valid: true };
  }

  return { valid: true };
}

function main() {
  const allFiles = getTrackedFiles();
  const imageFiles = allFiles.filter((f) => SUPPORTED_EXTENSIONS.test(f));
  
  console.log(`[validate:assets] Scanning ${imageFiles.length} image files...`);

  const invalidFiles = [];
  for (const imgPath of imageFiles) {
    const result = validateImageFile(imgPath);
    if (!result.valid) {
      invalidFiles.push({ path: imgPath, reason: result.reason });
    }
  }

  if (invalidFiles.length > 0) {
    console.error(`\n❌ [validate:assets] FAILED: ${invalidFiles.length} invalid image asset(s) found:\n`);
    for (const item of invalidFiles) {
      console.error(`  - ${item.path}: ${item.reason}`);
    }
    console.error("");
    process.exit(1);
  }

  console.log(`✅ [validate:assets] All ${imageFiles.length} image assets passed binary signature verification.`);
}

main();
