import { admin, db } from "../src/config/firebase-admin";
import pLimit from "p-limit";

const TOTAL_TRANSACTIONS = 100_000;
const CONCURRENCY_LIMIT = 200; // Ajuster selon le CPU et la bande passante

async function executeAcidTransaction(id: number) {
  // Cibler des documents différents pour éviter la contention (hotspotting)
  const accountId = `account_${id % 1000}`; 
  const docRef = db.collection("accounts").doc(accountId);

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef);
    
    if (!doc.exists) {
      transaction.set(docRef, { balance: 100, lastUpdated: admin.firestore.FieldValue.serverTimestamp() });
    } else {
      const data = doc.data();
      const currentBalance = data && typeof data.balance === "number" ? data.balance : 100;
      const newBalance = currentBalance + 1;
      transaction.update(docRef, { balance: newBalance, lastUpdated: admin.firestore.FieldValue.serverTimestamp() });
    }
  });
}

async function runBenchmark() {
  const limit = pLimit(CONCURRENCY_LIMIT);
  console.time("Benchmark");
  console.log(`[Benchmark] 🚀 Starting ${TOTAL_TRANSACTIONS} ACID transactions with a concurrency of ${CONCURRENCY_LIMIT}...`);

  const tasks = Array.from({ length: TOTAL_TRANSACTIONS }, (_, i) => 
    limit(() => executeAcidTransaction(i))
  );

  await Promise.all(tasks);
  console.timeEnd("Benchmark");
  console.log(`[Benchmark] ✓ ${TOTAL_TRANSACTIONS} transactions successfully completed.`);
}

runBenchmark().catch(console.error);
