import fs from "fs";
import path from "path";

const localesDir = path.join(process.cwd(), "public", "locales");
const fr: Record<string, string> = JSON.parse(fs.readFileSync(path.join(localesDir, "fr.json"), "utf8"));
const ar: Record<string, string> = JSON.parse(fs.readFileSync(path.join(localesDir, "ar.json"), "utf8"));
const en: Record<string, string> = JSON.parse(fs.readFileSync(path.join(localesDir, "en.json"), "utf8"));

const items: Record<string, { fr: string; ar: string; en: string }> = {
  "Compte Administrateur": {
    fr: "Compte Administrateur",
    ar: "حساب المدير المسؤول",
    en: "Administrator Account"
  },
  "Compte Vendeur Pro": {
    fr: "Compte Vendeur Pro",
    ar: "حساب تاجر محترف",
    en: "Pro Seller Account"
  },
  "Compte Client": {
    fr: "Compte Client",
    ar: "حساب المشتري",
    en: "Customer Account"
  },
  "Ouvrir le commutateur d'univers Olmart Super-App": {
    fr: "Ouvrir le commutateur d'univers Olmart Super-App",
    ar: "فتح مبدل أقسام أولمارت الشاملة",
    en: "Open Olmart Super-App Universe Switcher"
  },
  "N° Registre du Commerce": {
    fr: "N° Registre du Commerce",
    ar: "رقم السجل التجاري",
    en: "Commercial Registry No."
  },
  "Wilaya & Contact": {
    fr: "Wilaya & Contact",
    ar: "الولاية ومعلومات الاتصال",
    en: "Wilaya & Contact"
  },
  "Tableau de Bord Pro": {
    fr: "Tableau de Bord Pro",
    ar: "لوحة تحكم المحترفين",
    en: "Pro Dashboard"
  },
  "Publier une annonce": {
    fr: "Publier une annonce",
    ar: "نشر إعلان عقاري",
    en: "Publish Listing"
  },
  "Demande en cours": {
    fr: "Demande en cours",
    ar: "الطلب قيد المعالجة",
    en: "Request in progress"
  },
  "Soumis le": {
    fr: "Soumis le",
    ar: "تاريخ التقديم",
    en: "Submitted on"
  },
  "Délai moyen de validation : 24h à 48h ouvrées. Vous recevrez une notification dès validation.": {
    fr: "Délai moyen de validation : 24h à 48h ouvrées. Vous recevrez une notification dès validation.",
    ar: "متوسط وقت المعالجة والتحقق: من 24 إلى 48 ساعة عمل. ستصلك إشعار فوري عند الاعتماد.",
    en: "Average review time: 24 to 48 business hours. You will receive a notification upon approval."
  },
  "Non validé": {
    fr: "Non validé",
    ar: "غير معتمد",
    en: "Not approved"
  },
  "Motif du refus :": {
    fr: "Motif du refus :",
    ar: "سبب عدم القبول :",
    en: "Rejection reason:"
  },
  "Documents incomplets ou informations non vérifiables.": {
    fr: "Documents incomplets ou informations non vérifiables.",
    ar: "الوثائق غير مكتملة أو المعلومات غير قابلة للتحقق.",
    en: "Incomplete documents or unverifiable information."
  },
  "Soumettre un nouveau dossier": {
    fr: "Soumettre un nouveau dossier",
    ar: "تقديم ملف جديد",
    en: "Submit a new application"
  },
  "Certification Olma Immo": {
    fr: "Certification Olma Immo",
    ar: "توثيق أولمارت عقار",
    en: "Olma Immo Certification"
  },
  "Passer à un compte Pro ou Agence": {
    fr: "Passer à un compte Pro ou Agence",
    ar: "الترقية إلى حساب وكالة أو محترف عقاري",
    en: "Upgrade to Pro or Agency Account"
  },
  "Erreur réseau": {
    fr: "Erreur réseau",
    ar: "خطأ في الشبكة",
    en: "Network error"
  },
  "Demande transmise": {
    fr: "Demande transmise",
    ar: "تم إرسال الطلب",
    en: "Request sent"
  },
  "Immobilier Olma": {
    fr: "Immobilier Olma",
    ar: "عقارات أولمارت",
    en: "Olma Real Estate"
  },
  "Matin": {
    fr: "Matin",
    ar: "صباحاً",
    en: "Morning"
  },
  "Midi": {
    fr: "Midi",
    ar: "ظهراً",
    en: "Noon"
  },
  "Après-midi": {
    fr: "Après-midi",
    ar: "بعد الظهر",
    en: "Afternoon"
  },
  "Fin de journée": {
    fr: "Fin de journée",
    ar: "مساءً",
    en: "Evening"
  },
  "Je souhaite visiter ce bien...": {
    fr: "Je souhaite visiter ce bien...",
    ar: "أرغب في معاينة هذا العقار...",
    en: "I would like to visit this property..."
  },
  "À partir de": {
    fr: "À partir de",
    ar: "ابتداءً من",
    en: "Starting from"
  },
  "Précisions sur l'intervention...": {
    fr: "Précisions sur l'intervention...",
    ar: "تفاصيل حول طبيعة التدخل والأشغال...",
    en: "Details about the intervention..."
  },
  "Décrivez les réparations, surface, pannes...": {
    fr: "Décrivez les réparations, surface, pannes...",
    ar: "صف الأعطال، المساحة، نوع الصيانة المطلوبة...",
    en: "Describe repairs, surface, issues..."
  },
  "Lieu d'intervention": {
    fr: "Lieu d'intervention",
    ar: "مكان وموقع الأشغال",
    en: "Intervention location"
  },
  "Adresse / Repère (Optionnel)": {
    fr: "Adresse / Repère (Optionnel)",
    ar: "العنوان أو معلم قريب (اختياري)",
    en: "Address / Landmark (Optional)"
  },
  "Cité, numéro de rue...": {
    fr: "Cité, numéro de rue...",
    ar: "الحي، رقم الشارع...",
    en: "Neighborhood, street number..."
  },
  "/ Heure": {
    fr: "/ Heure",
    ar: "/ بالساعة",
    en: "/ Hour"
  },
  "/ m²": {
    fr: "/ m²",
    ar: "/ بالمتر المربع",
    en: "/ m²"
  },
  "/ Jour": {
    fr: "/ Jour",
    ar: "/ باليوم",
    en: "/ Day"
  }
};

for (const [k, v] of Object.entries(items)) {
  fr[k] = v.fr;
  ar[k] = v.ar;
  en[k] = v.en;
}

fs.writeFileSync(path.join(localesDir, "fr.json"), JSON.stringify(fr, null, 2), "utf8");
fs.writeFileSync(path.join(localesDir, "ar.json"), JSON.stringify(ar, null, 2), "utf8");
fs.writeFileSync(path.join(localesDir, "en.json"), JSON.stringify(en, null, 2), "utf8");

console.log("Remaining translations registered successfully!");
