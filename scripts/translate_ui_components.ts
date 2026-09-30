import fs from "fs";
import path from "path";

const localesDir = path.join(process.cwd(), "public", "locales");
const fr: Record<string, string> = JSON.parse(fs.readFileSync(path.join(localesDir, "fr.json"), "utf8"));
const ar: Record<string, string> = JSON.parse(fs.readFileSync(path.join(localesDir, "ar.json"), "utf8"));
const en: Record<string, string> = JSON.parse(fs.readFileSync(path.join(localesDir, "en.json"), "utf8"));

// Dictionary of translations to register
const newTranslations: Record<string, { fr: string; ar: string; en: string }> = {
  // Seller Onboarding
  "Complétez ces quelques étapes pour ouvrir votre boutique": {
    fr: "Complétez ces quelques étapes pour ouvrir votre boutique",
    ar: "أكمل هذه الخطوات البسيطة لفتح متجرك",
    en: "Complete these simple steps to open your store"
  },
  "Boutique": {
    fr: "Boutique",
    ar: "المتجر",
    en: "Store"
  },
  "Vérification": {
    fr: "Vérification",
    ar: "التحقق",
    en: "Verification"
  },
  "Paiement": {
    fr: "Paiement",
    ar: "الدفع",
    en: "Payment"
  },
  "Catalogue": {
    fr: "Catalogue",
    ar: "الكتالوج",
    en: "Catalog"
  },
  "Prêt": {
    fr: "Prêt",
    ar: "جاهز",
    en: "Ready"
  },
  "1. Informations de la boutique": {
    fr: "1. Informations de la boutique",
    ar: "1. معلومات المتجر",
    en: "1. Store Information"
  },
  "Nom de la boutique": {
    fr: "Nom de la boutique",
    ar: "اسم المتجر",
    en: "Store Name"
  },
  "Ex: Boutique Tech Alger": {
    fr: "Ex: Boutique Tech Alger",
    ar: "مثال: متجر تيك الجزائر",
    en: "Ex: Tech Store Algiers"
  },
  "Description": {
    fr: "Description",
    ar: "الوصف",
    en: "Description"
  },
  "Décrivez votre boutique...": {
    fr: "Décrivez votre boutique...",
    ar: "صف متجرك ومنتجاتك...",
    en: "Describe your store..."
  },
  "2. Vérification d'identité (KYC)": {
    fr: "2. Vérification d'identité (KYC)",
    ar: "2. التحقق من الهوية (KYC)",
    en: "2. Identity Verification (KYC)"
  },
  "Pour protéger nos clients, nous avons besoin de vérifier votre identité.": {
    fr: "Pour protéger nos clients, nous avons besoin de vérifier votre identité.",
    ar: "لحماية عملائنا، نحتاج إلى التحقق من هويتك القانونية.",
    en: "To protect our customers, we need to verify your identity."
  },
  "Numéro de Registre de Commerce ou NIF": {
    fr: "Numéro de Registre de Commerce ou NIF",
    ar: "رقم السجل التجاري أو الرقم الجبائي (NIF)",
    en: "Commercial Register Number or NIF"
  },
  "Ex: 1234567890": {
    fr: "Ex: 1234567890",
    ar: "مثال: 1234567890",
    en: "Ex: 1234567890"
  },
  "3. Configuration de paiement": {
    fr: "3. Configuration de paiement",
    ar: "3. إعداد الدفع",
    en: "3. Payment Configuration"
  },
  "Comment souhaitez-vous recevoir vos paiements ?": {
    fr: "Comment souhaitez-vous recevoir vos paiements ?",
    ar: "كيف ترغب في استلام مستحقاتك وأرباحك؟",
    en: "How would you like to receive your payments?"
  },
  "RIB / CCP (20 chiffres)": {
    fr: "RIB / CCP (20 chiffres)",
    ar: "رقم الحساب البريدي أو البنكي RIB / CCP (20 رقماً)",
    en: "RIB / CCP (20 digits)"
  },
  "4. Préparez votre catalogue": {
    fr: "4. Préparez votre catalogue",
    ar: "4. جهز كتالوج منتجاتك",
    en: "4. Prepare your catalog"
  },
  "Vous pourrez ajouter vos produits dès que vous accéderez à votre tableau de bord.": {
    fr: "Vous pourrez ajouter vos produits dès que vous accéderez à votre tableau de bord.",
    ar: "ستتمكن من إضافة منتجاتك بمجرد دخولك إلى لوحة التحكم الخاصة بك.",
    en: "You will be able to add your products once you access your dashboard."
  },
  "Préparez des photos claires et lumineuses": {
    fr: "Préparez des photos claires et lumineuses",
    ar: "جهز صوراً واضحة وعالية الجودة للمنتجات",
    en: "Prepare clear and bright photos"
  },
  "Rédigez des descriptions détaillées": {
    fr: "Rédigez des descriptions détaillées",
    ar: "اكتب أوصافاً تفصيلية ودقيقة",
    en: "Write detailed descriptions"
  },
  "Fixez des prix compétitifs": {
    fr: "Fixez des prix compétitifs",
    ar: "حدد أسعاراً تنافسية مناسبة",
    en: "Set competitive prices"
  },
  "Vous y êtes presque !": {
    fr: "Vous y êtes presque !",
    ar: "أنت على وشك الانتهاء !",
    en: "You are almost there!"
  },
  "Votre boutique est prête à être créée. Une fois sur votre tableau de bord, vous pourrez commencer à ajouter vos produits et configurer vos options de livraison.": {
    fr: "Votre boutique est prête à être créée. Une fois sur votre tableau de bord, vous pourrez commencer à ajouter vos produits et configurer vos options de livraison.",
    ar: "متجرك جاهز للإنشاء. بمجرد الوصول إلى لوحة التحكم، يمكنك البدء في إضافة المنتجات وضبط خيارات التوصيل.",
    en: "Your store is ready to be created. Once in your dashboard, you can start adding products and configure delivery options."
  },
  "Précédent": {
    fr: "Précédent",
    ar: "السابق",
    en: "Previous"
  },
  "Suivant": {
    fr: "Suivant",
    ar: "التالي",
    en: "Next"
  },
  "Création...": {
    fr: "Création...",
    ar: "جارٍ الإنشاء...",
    en: "Creating..."
  },
  "Ouvrir ma boutique": {
    fr: "Ouvrir ma boutique",
    ar: "فتح متجري الآن",
    en: "Open my store"
  },

  // Pro Application Form (Olma Immo)
  "Veuillez renseigner tous les champs obligatoires.": {
    fr: "Veuillez renseigner tous les champs obligatoires.",
    ar: "يرجى ملء جميع الحقول الإلزامية.",
    en: "Please fill in all required fields."
  },
  "Votre demande a été soumise avec succès !": {
    fr: "Votre demande a été soumise avec succès !",
    ar: "تم إرسال طلبك بنجاح !",
    en: "Your request has been submitted successfully!"
  },
  "Erreur lors de la soumission.": {
    fr: "Erreur lors de la soumission.",
    ar: "حدث خطأ أثناء إرسال الطلب.",
    en: "Error during submission."
  },
  "Agence Immobilière": {
    fr: "Agence Immobilière",
    ar: "وكالة عقارية",
    en: "Real Estate Agency"
  },
  "Pour les agences avec agrément et registre": {
    fr: "Pour les agences avec agrément et registre",
    ar: "للوكالات ذات الاعتماد والسجل التجاري",
    en: "For licensed agencies with commercial registry"
  },
  "Agent / Courtier Pro": {
    fr: "Agent / Courtier Pro",
    ar: "وكيل / وسيط عقاري محترف",
    en: "Pro Agent / Broker"
  },
  "Pour les professionnels indépendants": {
    fr: "Pour les professionnels indépendants",
    ar: "للمهنيين والوسطاء المستقلين",
    en: "For independent real estate professionals"
  },
  "Nom de l'agence ou Raison Sociale *": {
    fr: "Nom de l'agence ou Raison Sociale *",
    ar: "اسم الوكالة أو الشركة *",
    en: "Agency Name or Legal Entity *"
  },
  "Ex: Agence Immobilière El Bahdja": {
    fr: "Ex: Agence Immobilière El Bahdja",
    ar: "مثال: وكالة البهجة العقارية",
    en: "Ex: El Bahdja Real Estate Agency"
  },
  "N° Registre du Commerce *": {
    fr: "N° Registre du Commerce *",
    ar: "رقم السجل التجاري *",
    en: "Commercial Registry No. *"
  },
  "Ex: 16/00-1234567B22": {
    fr: "Ex: 16/00-1234567B22",
    ar: "مثال: 16/00-1234567B22",
    en: "Ex: 16/00-1234567B22"
  },
  "N° Agrément Immobilier (Optionnel)": {
    fr: "N° Agrément Immobilier (Optionnel)",
    ar: "رقم الاعتماد العقاري (اختياري)",
    en: "Real Estate License No. (Optional)"
  },
  "Ex: AGR-2023-456": {
    fr: "Ex: AGR-2023-456",
    ar: "مثال: AGR-2023-456",
    en: "Ex: AGR-2023-456"
  },
  "NIF / Numéro Fiscal (Optionnel)": {
    fr: "NIF / Numéro Fiscal (Optionnel)",
    ar: "الرقم التعريفي الجبائي NIF (اختياري)",
    en: "Tax Identification Number (Optional)"
  },
  "Ex: 002116012345678": {
    fr: "Ex: 002116012345678",
    ar: "مثال: 002116012345678",
    en: "Ex: 002116012345678"
  },
  "Téléphone Professionnel *": {
    fr: "Téléphone Professionnel *",
    ar: "الهاتف المهني *",
    en: "Professional Phone *"
  },
  "Ex: 0550 12 34 56": {
    fr: "Ex: 0550 12 34 56",
    ar: "مثال: 0550 12 34 56",
    en: "Ex: 0550 12 34 56"
  },
  "Wilaya principale *": {
    fr: "Wilaya principale *",
    ar: "الولاية الرئيسية *",
    en: "Main Wilaya *"
  },
  "Adresse du bureau / Siège": {
    fr: "Adresse du bureau / Siège",
    ar: "عنوان المكتب / المقر",
    en: "Office / Headquarters Address"
  },
  "Ex: 12 Rue Didouche Mourad, Alger": {
    fr: "Ex: 12 Rue Didouche Mourad, Alger",
    ar: "مثال: 12 شارع ديدوش مراد، الجزائر",
    en: "Ex: 12 Didouche Mourad St, Algiers"
  },
  "Présentation de l'activité (Optionnel)": {
    fr: "Présentation de l'activité (Optionnel)",
    ar: "نبذة عن النشاط والخبرة (اختياري)",
    en: "Business Presentation (Optional)"
  },
  "Décrivez brièvement vos zones d'intervention, spécialités...": {
    fr: "Décrivez brièvement vos zones d'intervention, spécialités...",
    ar: "صف بإيجاز مناطق نشاطك وتخصصاتك العقارية...",
    en: "Briefly describe your areas of coverage, specialties..."
  },
  "Soumission en cours...": {
    fr: "Soumission en cours...",
    ar: "جارٍ الإرسال...",
    en: "Submitting..."
  },
  "Soumettre ma candidature Pro": {
    fr: "Soumettre ma candidature Pro",
    ar: "إرسال طلب الانضمام المهني",
    en: "Submit My Pro Application"
  },

  // Pro Application Section
  "Vérification de votre statut professionnel...": {
    fr: "Vérification de votre statut professionnel...",
    ar: "جارٍ التحقق من صفتك المهنية...",
    en: "Checking your professional status..."
  },
  "Statut Officiel": {
    fr: "Statut Officiel",
    ar: "الصفة الرسمية",
    en: "Official Status"
  },
  "Agence Immobilière Agréée": {
    fr: "Agence Immobilière Agréée",
    ar: "وكالة عقارية معتمدة",
    en: "Certified Real Estate Agency"
  },
  "Professionnel Certifié": {
    fr: "Professionnel Certifié",
    ar: "محترف عقاري معتمد",
    en: "Certified Professional"
  },
  "Compte Validé": {
    fr: "Compte Validé",
    ar: "حساب موثق",
    en: "Verified Account"
  },
  "Raison Sociale": {
    fr: "Raison Sociale",
    ar: "الاسم التجاري",
    en: "Company Name"
  },
  "N° Agrément": {
    fr: "N° Agrément",
    ar: "رقم الاعتماد",
    en: "License No."
  },
  "Dossier en Cours d'Examen": {
    fr: "Dossier en Cours d'Examen",
    ar: "الملف قيد المراجعة والتدقيق",
    en: "Application Under Review"
  },
  "Votre dossier est en cours de validation par l'équipe Olmart Immo. Vous recevrez une réponse sous 24 à 48h.": {
    fr: "Votre dossier est en cours de validation par l'équipe Olmart Immo. Vous recevrez une réponse sous 24 à 48h.",
    ar: "ملفك قيد التحقق من قِبل فريق أولمارت عقار. ستتلقى الرد خلال 24 إلى 48 ساعة.",
    en: "Your application is being verified by Olmart Immo team. You will receive a response within 24-48 hours."
  },
  "Candidature Non Retenue": {
    fr: "Candidature Non Retenue",
    ar: "لم يتم قبول الطلب",
    en: "Application Not Approved"
  },
  "Rejoindre le Réseau Pro Olma Immo": {
    fr: "Rejoindre le Réseau Pro Olma Immo",
    ar: "الانضمام إلى شبكة المحترفين أولمارت عقار",
    en: "Join Olma Immo Pro Network"
  },
  "Publiez vos annonces avec le badge Officiel, bénéficiez d'une visibilité maximale et accédez à nos outils de gestion dédiés.": {
    fr: "Publiez vos annonces avec le badge Officiel, bénéficiez d'une visibilité maximale et accédez à nos outils de gestion dédiés.",
    ar: "انشر إعلاناتك بشارة موثقة رسمية، واستفد من أقصى ظهور وأدوات إدارة مخصصة.",
    en: "Publish your listings with an Official badge, enjoy maximum reach and access dedicated management tools."
  },
  "Postuler comme Agence / Pro": {
    fr: "Postuler comme Agence / Pro",
    ar: "التقديم كوكالة / محترف عقاري",
    en: "Apply as Agency / Pro"
  },
  "Annuler la candidature": {
    fr: "Annuler la candidature",
    ar: "إلغاء التقديم",
    en: "Cancel Application"
  },

  // Artisans Services & Quotes
  "Prestations & Tarifs Indicatifs": {
    fr: "Prestations & Tarifs Indicatifs",
    ar: "الخدمات والأسعار التقديرية",
    en: "Services & Indicative Pricing"
  },
  "Ajouter une prestation": {
    fr: "Ajouter une prestation",
    ar: "إضافة خدمة جديدة",
    en: "Add a service"
  },
  "Aucune prestation configurée.": {
    fr: "Aucune prestation configurée.",
    ar: "لم يتم تكوين أي خدمة بعد.",
    en: "No services configured yet."
  },
  "Titre de la prestation *": {
    fr: "Titre de la prestation *",
    ar: "عنوان الخدمة *",
    en: "Service Title *"
  },
  "Ex: Installation chauffe-eau": {
    fr: "Ex: Installation chauffe-eau",
    ar: "مثال: تركيب سخان ماء",
    en: "Ex: Water heater installation"
  },
  "Prix indicatif à partir de (DZD)": {
    fr: "Prix indicatif à partir de (DZD)",
    ar: "السعر التقديري ابتداءً من (دج)",
    en: "Starting price from (DZD)"
  },
  "Unité de tarification": {
    fr: "Unité de tarification",
    ar: "وحدة التسعير",
    en: "Pricing unit"
  },
  "Forfait": {
    fr: "Forfait",
    ar: "باقة / سعر إجمالي",
    en: "Fixed price"
  },
  "Par heure": {
    fr: "Par heure",
    ar: "بالساعة",
    en: "Per hour"
  },
  "Par jour": {
    fr: "Par jour",
    ar: "باليوم",
    en: "Per day"
  },
  "Par m²": {
    fr: "Par m²",
    ar: "بالمتر المربع",
    en: "Per m²"
  },
  "Sur devis": {
    fr: "Sur devis",
    ar: "حسب المقايسة (Devis)",
    en: "Upon quote"
  },
  "Enregistrement...": {
    fr: "Enregistrement...",
    ar: "جارٍ الحفظ...",
    en: "Saving..."
  },
  "Votre Nom *": {
    fr: "Votre Nom *",
    ar: "اسمك الكامل *",
    en: "Your Name *"
  },
  "Téléphone *": {
    fr: "Téléphone *",
    ar: "رقم الهاتف *",
    en: "Phone *"
  },
  "Email (Optionnel)": {
    fr: "Email (Optionnel)",
    ar: "البريد الإلكتروني (اختياري)",
    en: "Email (Optional)"
  },
  "Budget max (DZD)": {
    fr: "Budget max (DZD)",
    ar: "الميزانية القصوى (دج)",
    en: "Max budget (DZD)"
  },
  "Titre des travaux *": {
    fr: "Titre des travaux *",
    ar: "عنوان الأشغال المطلوبة *",
    en: "Work Title *"
  },
  "Ex: Rénovation peinture salon": {
    fr: "Ex: Rénovation peinture salon",
    ar: "مثال: دهان وصباغة صالون",
    en: "Ex: Living room painting renovation"
  },
  "Description détaillée *": {
    fr: "Description détaillée *",
    ar: "الوصف التفصيلي للأشغال *",
    en: "Detailed Description *"
  },
  "Niveau d'urgence": {
    fr: "Niveau d'urgence",
    ar: "درجة الاستعجال",
    en: "Urgency Level"
  },
  "Urgent (24-48h)": {
    fr: "Urgent (24-48h)",
    ar: "عاجل (24-48 ساعة)",
    en: "Urgent (24-48h)"
  },
  "Standard (1-2 sem)": {
    fr: "Standard (1-2 sem)",
    ar: "عادي (1-2 أسبوع)",
    en: "Standard (1-2 weeks)"
  },
  "Flexible": {
    fr: "Flexible",
    ar: "مرن / غير مستعجل",
    en: "Flexible"
  },
  "Date souhaitée": {
    fr: "Date souhaitée",
    ar: "التاريخ المفضل",
    en: "Preferred Date"
  },

  // Visit Request & Negotiation
  "Demande de visite": {
    fr: "Demande de visite",
    ar: "طلب زيارة ومعاينة",
    en: "Visit Request"
  },
  "Planifier une visite": {
    fr: "Planifier une visite",
    ar: "جدولة موعد زيارة",
    en: "Schedule a Visit"
  },
  "Type de visite": {
    fr: "Type de visite",
    ar: "نوع الزيارة",
    en: "Visit Type"
  },
  "Visite sur place": {
    fr: "Visite sur place",
    ar: "زيارة ميدانية في الموقع",
    en: "On-site visit"
  },
  "Visite virtuelle (Visio)": {
    fr: "Visite virtuelle (Visio)",
    ar: "معاينة افتراضية (فيديو)",
    en: "Virtual tour (Video)"
  },
  "Créneau horaire": {
    fr: "Créneau horaire",
    ar: "الفترة الزمنية",
    en: "Time slot"
  },
  "Notes ou questions spécifiques": {
    fr: "Notes ou questions spécifiques",
    ar: "ملاحظات أو استفسارات خاصة",
    en: "Notes or specific questions"
  },
  "Envoyer la demande de visite": {
    fr: "Envoyer la demande de visite",
    ar: "إرسال طلب الزيارة",
    en: "Send Visit Request"
  },
  "Demande transmise avec succès !": {
    fr: "Demande transmise avec succès !",
    ar: "تم إرسال طلب الزيارة بنجاح !",
    en: "Visit request sent successfully!"
  },
  "L'annonceur prendra contact avec vous rapidement.": {
    fr: "L'annonceur prendra contact avec vous rapidement.",
    ar: "سيتواصل معك صاحب الإعلان في أقرب وقت لتأكيد الموعد.",
    en: "The owner/agent will contact you shortly."
  },
  "Fermer": {
    fr: "Fermer",
    ar: "إغلاق",
    en: "Close"
  },

  // Price Negotiation
  "Négociation de prix": {
    fr: "Négociation de prix",
    ar: "التفاوض على السعر (Khasem 🤝)",
    en: "Price Negotiation"
  },
  "Offre en attente": {
    fr: "Offre en attente",
    ar: "العرض قيد الانتظار",
    en: "Offer pending"
  },
  "Offre acceptée": {
    fr: "Offre acceptée",
    ar: "تم قبول العرض",
    en: "Offer accepted"
  },
  "Offre refusée": {
    fr: "Offre refusée",
    ar: "تم رفض العرض",
    en: "Offer rejected"
  },
  "Offre expirée": {
    fr: "Offre expirée",
    ar: "انتهت صلاحية العرض",
    en: "Offer expired"
  },
  "Accepter l'offre": {
    fr: "Accepter l'offre",
    ar: "قبول العرض",
    en: "Accept offer"
  },
  "Refuser": {
    fr: "Refuser",
    ar: "رفض",
    en: "Decline"
  },
  "Faire une contre-proposition": {
    fr: "Faire une contre-proposition",
    ar: "تقديم عرض مقابل",
    en: "Make a counter-offer"
  },
  "Montant de la contre-proposition (DZD)": {
    fr: "Montant de la contre-proposition (DZD)",
    ar: "مبلغ العرض المقابل (دج)",
    en: "Counter-offer amount (DZD)"
  },
  "Envoyer la contre-proposition": {
    fr: "Envoyer la contre-proposition",
    ar: "إرسال العرض المقابل",
    en: "Send counter-offer"
  }
};

// Merge translations
let addedCount = 0;
for (const [k, v] of Object.entries(newTranslations)) {
  fr[k] = v.fr;
  ar[k] = v.ar;
  en[k] = v.en;
  addedCount++;
}

fs.writeFileSync(path.join(localesDir, "fr.json"), JSON.stringify(fr, null, 2), "utf8");
fs.writeFileSync(path.join(localesDir, "ar.json"), JSON.stringify(ar, null, 2), "utf8");
fs.writeFileSync(path.join(localesDir, "en.json"), JSON.stringify(en, null, 2), "utf8");

console.log(`Registered ${addedCount} new structured translations across FR, AR, EN.`);
