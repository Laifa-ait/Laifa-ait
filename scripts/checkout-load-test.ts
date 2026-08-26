import { admin, db } from "../src/config/firebase-admin";
import http from "http";

/**
 * Olmart Concurrency & Firestore Lock Stress-Test CLI
 * 
 * Usage:
 *   npx tsx scripts/checkout-load-test.ts --total=500 --concurrency=50
 * 
 * Configurable parameters:
 *   --total        Total number of order checkout transactions to execute (Default: 500, up to 10000)
 *   --concurrency  Max number of active concurrent HTTP requests (Default: 50)
 *   --host         Target server host (Default: localhost)
 *   --port         Target server port (Default: 3000)
 */

interface StressTestConfig {
  total: number;
  concurrency: number;
  host: string;
  port: number;
}

const SEED_PRODUCT_ID = "test_load_product_000";
const SEED_SELLER_ID = "test_load_seller_000";

async function setupDatabaseSeed() {
  console.log(`[Load Test] 🗄️ Seeding database for high concurrency checkout test...`);

  // 1. Seed Seller Account
  await db.collection("users").doc(SEED_SELLER_ID).set({
    uid: SEED_SELLER_ID,
    email: "load_test_seller@olmart.dz",
    displayName: "Load Test Merchant",
    role: "seller",
    status: "active",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log(`[Load Test] ✓ Seeded seller: ${SEED_SELLER_ID}`);

  // 2. Seed High-Stock Product
  await db.collection("products").doc(SEED_PRODUCT_ID).set({
    id: SEED_PRODUCT_ID,
    sellerId: SEED_SELLER_ID,
    name: "Load Test Premium Shirt",
    price: 2500,
    image: "https://olmart.dz/test.jpg",
    stock: 100000,
    status: "active",
    category: "Mode Homme",
    subcategory: "Vêtements",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log(`[Load Test] ✓ Seeded product: ${SEED_PRODUCT_ID} with 100,000 items in stock`);

  // 3. Ensure Shipping Settings Exist
  const shippingRef = db.collection("settings").doc("shipping");
  const shippingSnap = await shippingRef.get();
  if (!shippingSnap.exists) {
    await shippingRef.set({
      globalBaseFee: 600,
      wilayaFees: { "31": 500, "16": 400 },
      matrixFees: {}
    });
    console.log(`[Load Test] ✓ Seeded default shipping settings`);
  }

  // 4. Ensure Commission Settings Exist
  const commissionRef = db.collection("settings").doc("commission");
  const commissionSnap = await commissionRef.get();
  if (!commissionSnap.exists) {
    await commissionRef.set({
      globalRate: 10
    });
    console.log(`[Load Test] ✓ Seeded default commission settings`);
  }
}

async function cleanupDatabase(createdOrderIds: string[]) {
  console.log(`\n[Load Test] 🧹 Cleaning up all seeded data and transaction records...`);

  // 1. Delete Seeded Product
  await db.collection("products").doc(SEED_PRODUCT_ID).delete();
  console.log(`[Load Test] ✓ Purged product ${SEED_PRODUCT_ID}`);

  // 2. Delete Seeded Seller
  await db.collection("users").doc(SEED_SELLER_ID).delete();
  console.log(`[Load Test] ✓ Purged seller ${SEED_SELLER_ID}`);

  // 3. Delete Created Orders and Sub-Orders
  if (createdOrderIds.length > 0) {
    console.log(`[Load Test] ✓ Purging ${createdOrderIds.length} generated order documents...`);
    const batchSize = 100;
    for (let i = 0; i < createdOrderIds.length; i += batchSize) {
      const chunk = createdOrderIds.slice(i, i + batchSize);
      const batch = db.batch();
      for (const orderId of chunk) {
        batch.delete(db.collection("orders").doc(orderId));
        // Sub-order ID is usually [orderId]_[sellerId]
        batch.delete(db.collection("sub_orders").doc(`${orderId}_${SEED_SELLER_ID}`));
      }
      await batch.commit();
    }
    console.log(`[Load Test] ✓ Cleared generated transaction records successfully.`);
  }
}

function sendCheckoutRequest(config: StressTestConfig, index: number): Promise<{ success: boolean; latency: number; orderId?: string; error?: string }> {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      cart: [{
        id: SEED_PRODUCT_ID,
        sellerId: SEED_SELLER_ID,
        quantity: 1,
        name: "Load Test Premium Shirt",
        price: 2500,
        image: "https://olmart.dz/test.jpg"
      }],
      shippingAddress: {
        fullName: `Concurrency Tester #${index}`,
        phone: "0655123456",
        wilaya: "31 Oran",
        commune: "Es Senia",
        address: "Route de l aeroport"
      },
      deliveryMethod: "domicile",
      idempotencyKey: `stress_key_${Date.now()}_${index}_${Math.random().toString(36).substring(2)}`
    });

    const options = {
      hostname: config.host,
      port: config.port,
      path: "/api/v1/place-order",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      }
    };

    const startTime = Date.now();

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        const latency = Date.now() - startTime;
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(body);
            if (parsed.orderId) {
              resolve({ success: true, latency, orderId: parsed.orderId });
            } else {
              resolve({ success: false, latency, error: parsed.error || "No orderId returned" });
            }
          } catch {
            resolve({ success: false, latency, error: "Malformed response" });
          }
        } else {
          resolve({ success: false, latency, error: `HTTP ${res.statusCode}: ${body}` });
        }
      });
    });

    req.on("error", (e) => {
      const latency = Date.now() - startTime;
      resolve({ success: false, latency, error: e.message });
    });

    req.write(payload);
    req.end();
  });
}

async function run() {
  const args = process.argv.slice(2);
  const config: StressTestConfig = {
    total: 500,
    concurrency: 50,
    host: "localhost",
    port: 3000
  };

  for (const arg of args) {
    if (arg.startsWith("--total=")) {
      config.total = Math.min(10000, Math.max(1, parseInt(arg.replace("--total=", "")) || 500));
    } else if (arg.startsWith("--concurrency=")) {
      config.concurrency = Math.max(1, parseInt(arg.replace("--concurrency=", "")) || 50);
    } else if (arg.startsWith("--host=")) {
      config.host = arg.replace("--host=", "").trim();
    } else if (arg.startsWith("--port=")) {
      config.port = parseInt(arg.replace("--port=", "")) || 3000;
    }
  }

  console.log(`
==================================================
 OLMART CHECKOUT STRESS-TEST & ACCELERATION ENGINE
==================================================
 - Target URL: http://${config.host}:${config.port}/api/v1/place-order
 - Total Requests to Simulate: ${config.total}
 - Max Concurrent Workers: ${config.concurrency}
==================================================
`);

  await setupDatabaseSeed();

  console.log(`\n[Load Test] 🚀 Commencing load test...`);
  
  const createdOrderIds: string[] = [];
  const latencies: number[] = [];
  let successfulRequests = 0;
  let failedRequests = 0;
  let contentionErrors = 0;
  const errorMap = new Map<string, number>();

  const startTime = Date.now();
  let completedRequests = 0;

  async function runWorker(_workerId: number): Promise<void> {
    while (completedRequests < config.total) {
      const currentIdx = completedRequests++;
      if (currentIdx >= config.total) break;

      const result = await sendCheckoutRequest(config, currentIdx);

      latencies.push(result.latency);

      if (result.success) {
        successfulRequests++;
        if (result.orderId) createdOrderIds.push(result.orderId);
      } else {
        failedRequests++;
        const errKey = result.error || "Unknown error";
        errorMap.set(errKey, (errorMap.get(errKey) || 0) + 1);
        if (result.error && (result.error.toLowerCase().includes("contention") || result.error.toLowerCase().includes("conflict") || result.error.toLowerCase().includes("locked") || result.error.toLowerCase().includes("abort"))) {
          contentionErrors++;
        }
      }

      if (completedRequests % Math.max(1, Math.floor(config.total / 10)) === 0 || completedRequests === config.total) {
        const progress = ((completedRequests / config.total) * 100).toFixed(0);
        console.log(`[Load Test] 📊 Progress: ${completedRequests}/${config.total} (${progress}%) completed.`);
      }
    }
  }

  // Launch initial concurrent workers
  const workers: Promise<void>[] = [];
  const initialConcurrency = Math.min(config.concurrency, config.total);
  for (let i = 0; i < initialConcurrency; i++) {
    workers.push(runWorker(i));
  }

  await Promise.all(workers);

  const totalDuration = Date.now() - startTime;
  const qps = ((config.total / totalDuration) * 1000).toFixed(2);
  const avgLatency = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1);
  const maxLatency = Math.max(...latencies);
  const minLatency = Math.min(...latencies);

  latencies.sort((a, b) => a - b);
  const p95Latency = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99Latency = latencies[Math.floor(latencies.length * 0.99)] || 0;

  console.log(`
==================================================
                 TEST METRICS REPORT
==================================================
 - Total Requests Attempted: ${config.total}
 - Successful Checkouts:     ${successfulRequests}
 - Failed Checkouts:         ${failedRequests}
 - Transaction Conflicts:     ${contentionErrors}
 - Concurrency Ratio:        ${config.concurrency}
`);

  if (errorMap.size > 0) {
    console.log(`\n--- Failure Reasons Breakdown ---`);
    errorMap.forEach((count, err) => {
      console.log(` - [${count} occurrences]: ${err}`);
    });
  }

  console.log(`
 - Total Duration:           ${(totalDuration / 1000).toFixed(2)}s
 - Average Throughput:       ${qps} QPS (Queries Per Second)
 
 - Min Latency:              ${minLatency}ms
 - Average Latency:          ${avgLatency}ms
 - 95th Percentile (p95):    ${p95Latency}ms
 - 99th Percentile (p99):    ${p99Latency}ms
 - Max Latency:              ${maxLatency}ms
==================================================
`);

  await cleanupDatabase(createdOrderIds);
  console.log(`\n[Load Test] 🚀 Stress test complete. Status: SUCCESS.`);
  process.exit(0);
}

run().catch((error) => {
  console.error("❌ Critical Stress Test Failure:", error);
  process.exit(1);
});
