import { exec } from "child_process";
import { promisify } from "util";
import { format } from "date-fns";

const execAsync = promisify(exec);

async function backupFirestore() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.error("❌ Erreur : FIREBASE_PROJECT_ID n'est pas défini dans l'environnement.");
    process.exit(1);
  }

  const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm");
  const bucket = `gs://olmart-backups/firestore/${timestamp}`;
  
  try {
    const { stdout } = await execAsync(
      `gcloud firestore export ${bucket} --project=${projectId}`
    );
    console.log(`Backup réussi : ${bucket}`);
    console.log(stdout);
  } catch (error: unknown) {
    console.error("Backup échoué :", error);
    process.exit(1);
  }
}

backupFirestore();
