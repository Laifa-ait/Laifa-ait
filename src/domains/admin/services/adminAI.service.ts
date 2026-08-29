import { admin } from "../../../config/firebase-admin";
import { ai, DEFAULT_GEMINI_MODEL } from "../../../config/gemini";
import { AiAgentsConfigMap } from "../types/ai.types";

export const DEFAULT_AGENTS_CONFIG: AiAgentsConfigMap = {
  growth: {
    isActive: true,
    focusCategory: "Tout",
    marketContext: "Mots-clés recherchés en Algérie (robes de mariée, bijoux berbères, maroquinerie de Tlemcen, dattes Deglet Nour, cosmétiques bio, qalb el louz, ustensiles traditionnels). Stratégie de prix en DA (Dinar Algérien).",
    analysisFrequency: "daily",
  },
  cart: {
    isActive: true,
    discountCode: "OLMARECOVERY10",
    discountPercent: 10,
    followUpDelay: 4,
    tone: "luxury",
  },
  moderator: {
    isActive: false,
    strictness: "strict",
    languages: "FR, AR",
    customForbiddenWords: "whatsapp, viber, telegram, téléphone, phone, contactez-moi, facebook, +213, ouedkniss, fennec",
  },
  support: {
    isActive: false,
    kbContext: "Délais de livraison : Alger (24h-48h, 400 DA), Oran (48h-72h, 500 DA), Constantine (48h-72h, 500 DA), Grand Sud (3-5 jours, 800 DA). Tous paiements en Cash on Delivery (COD) à la livraison. Les retours sont possibles sous 7 jours si le produit n'est pas utilisé et est retourné dans son emballage d'origine. Les frais de retour sont à la charge du client sauf si erreur d'Olma.",
    personality: "warm",
  },
  sentinel: {
    isActive: true,
    autoScanInterval: "hourly",
    alertThreshold: "warning",
    autoFixEnabled: true,
  }
};

export class AdminAIService {
  static async getAgentsConfigFromDb(): Promise<AiAgentsConfigMap> {
    const snapshot = await admin.firestore().collection("ai_agents").get();
    const configs: AiAgentsConfigMap = JSON.parse(JSON.stringify(DEFAULT_AGENTS_CONFIG));
    snapshot.docs.forEach((doc) => {
      const key = doc.id;
      if (configs[key]) {
        configs[key] = { ...configs[key], ...doc.data() };
      }
    });
    return configs;
  }

  static async toggleAgentStatus(key: string, isActive: boolean): Promise<void> {
    const ref = admin.firestore().collection("ai_agents").doc(key);
    await ref.set({ isActive }, { merge: true });
  }

  static async configureAgent(key: string, configData: Record<string, unknown>): Promise<void> {
    const ref = admin.firestore().collection("ai_agents").doc(key);
    await ref.set({ ...configData }, { merge: true });
  }

  static async runGrowthAgent(): Promise<Record<string, unknown>> {
    const productsSnap = await admin.firestore().collection("products").limit(20).get();
    const productsList = productsSnap.docs.map(doc => ({
      name: doc.data().name,
      category: doc.data().category,
      price: doc.data().price,
      viewsCount: doc.data().viewsCount || 0,
      salesCount: doc.data().salesCount || 0,
    }));

    const agentConfigs = await this.getAgentsConfigFromDb();
    const growthConfig = agentConfigs.growth;

    const systemPrompt = `Vous êtes un analyste de croissance IA senior spécialisé dans l'e-commerce en Algérie (58 wilayas) pour Olma Marketplace.
Votre objectif est de fournir une analyse commerciale détaillée et luxueuse basée sur les données fournies et le contexte configuré par l'administrateur.
Contexte configuré : ${growthConfig.marketContext}
Catégorie cible configurée : ${growthConfig.focusCategory}

Répondez STRICTEMENT au format JSON avec les clés suivantes :
- summary: Un résumé des tendances de marché actuelles en Algérie (FR)
- kpis: Un tableau d'objets KPI { label, value, change, trend: 'up' | 'down' }
- pricingTips: Conseils d'optimisation de prix (FR)
- topSearches: Tableau de mots-clés les plus chauds en ce moment en Algérie
- actionableAdvice: Recommandations stratégiques clés pour l'admin d'Olma (FR)`;

    const prompt = `Voici la liste échantillonnée de nos produits actuels en base de données : ${JSON.stringify(productsList)}. 
S'il n'y en a pas ou s'ils sont peu nombreux, utilisez vos connaissances expertes de l'e-commerce algérien pour fournir un rapport robuste.
Veuillez générer l'analyse de croissance complète en JSON.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });

    const reportText = response.text || "{}";
    const parsedReport = JSON.parse(reportText.match(/\{[\s\S]*\}/)?.[0] || reportText);

    const reportRef = admin.firestore().collection("ai_growth_reports").doc();
    const reportDoc = {
      ...parsedReport,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await reportRef.set(reportDoc);

    return reportDoc;
  }

  static async runCartSimulation(): Promise<{ preview: Record<string, unknown>; cart: Record<string, unknown> }> {
    const agentConfigs = await this.getAgentsConfigFromDb();
    const cartConfig = agentConfigs.cart;

    const dummyCart = {
      customerName: "Amine Belkacem",
      customerEmail: "amine.belk@gmail.com",
      items: [
        { name: "Karakou Algérois Traditionnel en Velours", price: 38000, quantity: 1 },
        { name: "Pochette de Soirée Brodée Or", price: 6500, quantity: 1 }
      ],
      totalAmount: 44500
    };

    const prompt = `Générez un e-mail de relance de panier abandonné luxueux et percutant pour le client "${dummyCart.customerName}" qui a laissé "${dummyCart.items.map(i => i.name).join(', ')}" dans son panier pour un total de ${dummyCart.totalAmount} DA.
Le code promo configuré est "${cartConfig.discountCode}" offrant une réduction de ${cartConfig.discountPercent}%.
Le ton doit être "${cartConfig.tone}" (luxueux, chaleureux, mélangeant l'élégance du français avec la convivialité algérienne de la darja si nécessaire).
L'e-mail doit comporter un sujet captivant et un corps d'e-mail rédigé en HTML propre avec des styles soignés.
Retournez un objet JSON avec les clés :
- subject: Sujet de l'e-mail
- htmlBody: Corps du message en HTML`;

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "Vous êtes l'agent IA de récupération de panier Olma. Vous rédigez des relances commerciales haut de gamme.",
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);

    return { preview: parsed, cart: dummyCart };
  }

  static async moderateProduct(title: string, description: string): Promise<Record<string, unknown>> {
    const agentConfigs = await this.getAgentsConfigFromDb();
    const modConfig = agentConfigs.moderator;

    const systemPrompt = `Vous êtes le Modérateur de Contenu IA principal pour Olma Marketplace en Algérie.
Votre rôle est d'analyser les fiches produits soumises pour s'assurer qu'elles respectent scrupuleusement la loi algérienne, les bonnes mœurs et les directives d'Olma (pas de liens externes, pas de numéros de téléphone WhatsApp, pas de prix mensongers, pas de fraude ou contrefaçon évidente).
Mots interdits configurés : ${modConfig.customForbiddenWords}
Niveau de sévérité : ${modConfig.strictness}

Retournez un objet JSON avec les clés :
- approved: boolean (si le produit est accepté ou doit être refusé)
- qualityScore: number (score de qualité de la fiche produit sur 100)
- infractionsDetected: string[] (tableau des infractions identifiées)
- feedback: string (explication constructive pour le vendeur, FR ou AR)
- checklist: { label: string, passed: boolean }[] (checklist de conformité)`;

    const prompt = `Veuillez modérer et auditer la fiche produit suivante :
Titre du produit : "${title}"
Description : "${description}"`;

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);
  }

  static async runSentinelDiagnostic(adminEmail: string): Promise<Record<string, unknown>> {
    let siteErrors: Array<Record<string, unknown>> = [];
    try {
      const siteErrorsSnap = await admin.firestore().collection("site_errors").orderBy("timestamp", "desc").limit(10).get();
      siteErrors = siteErrorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch {
      siteErrors = [];
    }

    let checkoutAudits: Array<Record<string, unknown>> = [];
    try {
      const checkoutAuditsSnap = await admin.firestore().collection("checkout_audits").orderBy("timestamp", "desc").limit(5).get();
      checkoutAudits = checkoutAuditsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch {
      checkoutAudits = [];
    }

    let auditLogs: Array<Record<string, unknown>> = [];
    try {
      const auditLogsSnap = await admin.firestore().collection("audit_logs").orderBy("timestamp", "desc").limit(10).get();
      auditLogs = auditLogsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch {
      auditLogs = [];
    }

    const systemPrompt = `Vous êtes l'Agent Sentinel & Inspecteur de Santé Système IA d'Olmart Marketplace (Algérie).
Votre mission est d'analyser en profondeur les journaux d'erreurs techniques, les audits de checkout, et l'état général de la plateforme.
Identifiez les dysfonctionnements, les goulots d'étranglement ou les problèmes de permissions Firestore / API, puis générez un rapport d'inspection structuré.

Répondez STRICTEMENT au format JSON avec la structure suivante :
{
  "healthIndex": 96,
  "statusLabel": "Excellente santé - Système Opérationnel",
  "issuesFound": [
    {
      "id": "ERR-001",
      "severity": "info",
      "title": "Optimisation du cache mémoire",
      "component": "Logistique Wilayas",
      "rootCause": "Chargement répétitif du référentiel des 58 wilayas",
      "recommendedFix": "Activer le préchargement dans le ServiceWorker"
    }
  ],
  "systemChecks": [
    { "name": "Base de Données Firestore ACID", "status": "ok", "latencyMs": 42, "detail": "Transactions de stock impeccables" },
    { "name": "API Livraisons Directes Logistique", "status": "ok", "latencyMs": 110, "detail": "Connecteur 58 Wilayas synchrone" },
    { "name": "Gemini 2.5 Flash AI Engine", "status": "ok", "latencyMs": 280, "detail": "Clé API valide & quota actif" },
    { "name": "Tunnel de Commande & Autofill", "status": "ok", "latencyMs": 35, "detail": "Conformité WCAG & Autofill 100%" }
  ],
  "summary": "Le système Olmart fonctionne à haut niveau de performance. Toutes les passerelles de paiement Cash on Delivery et de livraison directe sont opérationnelles."
}`;

    const prompt = `Voici la télémétrie actuelle de la plateforme :
1. Erreurs Front-end / Unhandled (site_errors) : ${JSON.stringify(siteErrors)}
2. Derniers Audits Tunnel de Commande (checkout_audits) : ${JSON.stringify(checkoutAudits)}
3. Journaux d'Audit Système (audit_logs) : ${JSON.stringify(auditLogs)}

Générez le rapport de diagnostic de l'Agent Sentinel au format JSON.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);

    const diagRef = admin.firestore().collection("ai_diagnostics").doc();
    const diagDoc = {
      ...parsed,
      timestamp: new Date().toISOString(),
      createdBy: adminEmail || "admin@olmart.dz"
    };
    await diagRef.set(diagDoc);

    return diagDoc;
  }
}
