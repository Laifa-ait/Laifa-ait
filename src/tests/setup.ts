import fs from "fs";

function isPortListening(port: number): boolean {
  try {
    const hexPort = port.toString(16).toUpperCase().padStart(4, "0");
    const tcp = fs.readFileSync("/proc/net/tcp", "utf8");
    const lines = tcp.split("\n");
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4) {
        const localAddr = parts[1];
        const state = parts[3];
        if (localAddr && localAddr.endsWith(":" + hexPort) && state === "0A") {
          return true;
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}

// Set default Firebase environment variables for tests before any other module imports firebase-admin
process.env.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "ai-studio-217f6d79-c758-4e14-845d-737228cd3915";
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || "ai-studio-217f6d79-c758-4e14-845d-737228cd3915";
process.env.GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || "ai-studio-217f6d79-c758-4e14-845d-737228cd3915";
process.env.FIREBASE_DATABASE_ID = process.env.FIREBASE_DATABASE_ID || "(default)";

// Dynamically bind to local emulator connections if the emulator daemon is actively running
const firestorePortActive = isPortListening(8085);
const storagePortActive = isPortListening(9199);

if (firestorePortActive) {
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8085";
} else {
  delete process.env.FIRESTORE_EMULATOR_HOST;
}

if (storagePortActive) {
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = process.env.FIREBASE_STORAGE_EMULATOR_HOST || "127.0.0.1:9199";
} else {
  delete process.env.FIREBASE_STORAGE_EMULATOR_HOST;
}

