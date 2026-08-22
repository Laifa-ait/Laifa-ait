import { OlmaAppModule } from '../types/olmaUnivers';

export const DEFAULT_OLMA_APPS: OlmaAppModule[] = [
  {
    id: 'olma-bricolage',
    slug: 'bricolage-artisans',
    title: {
      fr: 'Olma Bricolage & Dépannage',
      ar: 'أولما صيانة وحرفيين',
      en: 'Olma DIY & Maintenance'
    },
    description: {
      fr: 'Plomberie, électricité, peinture, climatisation & réparations à domicile par des artisans vérifiés.',
      ar: 'سباكة، كهرباء، دهان، تكييف وتصليحات منزلية بواسطة حرفيين معتمدين.',
      en: 'Plumbing, electrical, painting, AC repair & home maintenance by verified artisans.'
    },
    longDescription: {
      fr: 'Plateforme mettant en relation les ménages et entreprises en Algérie avec des artisans et réparateurs qualifiés. Réservez un dépannage en quelques clics avec suivi en direct.',
      ar: 'منصة تربط العائلات والشركات في الجزائر بحرفيين وفنيين مؤهلين مع حجز فوري ومتابعة مباشرة.',
      en: 'Platform connecting Algerian households and businesses with qualified artisans for home services.'
    },
    icon: 'Wrench',
    category: 'services',
    status: 'active',
    badge: {
      fr: 'Style Angi.com',
      ar: 'نمط Angi.com',
      en: 'Angi Style'
    },
    isFeatured: true,
    targetRoute: '/bricolage',
    order: 1,
    tags: ['Artisans', 'Dépannage 24/7', 'Maison', 'Fix-It'],
    waitingListCount: 1420
  },
  {
    id: 'olma-immo',
    slug: 'immo-location',
    title: {
      fr: 'Olma Immo & Location',
      ar: 'أولMA عقار وإيجار',
      en: 'Olma Real Estate & Rental'
    },
    description: {
      fr: 'Location et vente d\'appartements, villas, bureaux & locaux commerciaux à travers les 58 Wilayas.',
      ar: 'كراء وبيع الشقق، الفيلات، المكاتب والمحلات التجارية عبر 58 ولاية.',
      en: 'Rent and purchase of apartments, villas, offices & commercial spaces across Algeria.'
    },
    longDescription: {
      fr: 'L\'univers immobilier moderne d\'Olmart : visites virtuelles, contrats certifiés, vérification des propriétaires et gestion locative automatisée.',
      ar: 'العالم العقاري الحديث لأولما: جولات افتراضية، عقود موثوقة وإدارة إيجار مؤتمتة.',
      en: 'Modern real estate ecosystem: virtual tours, verified owners, and transparent booking.'
    },
    icon: 'Home',
    category: 'immo',
    status: 'active',
    badge: {
      fr: 'Immobilier DZ',
      ar: 'عقارات الجزائر',
      en: 'Algeria Immo'
    },
    isFeatured: true,
    targetRoute: '/immo',
    order: 2,
    tags: ['Location', 'Achat', 'Locaux', 'Villas'],
    waitingListCount: 2890
  },
  {
    id: 'olma-auto',
    slug: 'auto-vehicules',
    title: {
      fr: 'Olma Auto & Véhicules',
      ar: 'أولما سيارات ومركبات',
      en: 'Olma Vehicles & Motors'
    },
    description: {
      fr: 'Achat, vente, reprise & location de véhicules neufs et d\'occasion avec contrôle technique certifié.',
      ar: 'شراء، بيع وإيجار السيارات الجديدة والمستعملة مع فحص تقني معتمد.',
      en: 'Buy, sell & rent new or pre-owned vehicles with inspection reports.'
    },
    longDescription: {
      fr: 'Trouvez et vendez votre véhicule en toute sécurité. Comparateur de prix, historique des véhicules et mise en relation avec concessionnaires et particuliers.',
      ar: 'جد وبع سيارتك بكل أمان. مقارن أسعار، سجل المركبات ومواصلة مباشرة مع المعارض والأفراد.',
      en: 'Marketplace for cars, motorcycles, and commercial vehicles with inspection verification.'
    },
    icon: 'Car',
    category: 'auto',
    status: 'coming_soon',
    badge: {
      fr: 'Auto DZ',
      ar: 'سيارات DZ',
      en: 'Motors DZ'
    },
    isFeatured: true,
    order: 3,
    tags: ['Occasion', 'Neuf', 'Location Auto', 'Pièces'],
    waitingListCount: 3150
  },
  {
    id: 'olma-ecommerce',
    slug: 'ecommerce-premier',
    title: {
      fr: 'Olmart Premier Marketplace',
      ar: 'أولمارت السوق الرئيسي',
      en: 'Olmart Premier Marketplace'
    },
    description: {
      fr: 'La marketplace principale : mode, électronique, électroménager & produits locaux.',
      ar: 'السوق الإلكتروني الرئيسي: أزياء، إلكترونيات، كهرومنزلية ومنتجات محلية.',
      en: 'The core marketplace for fashion, electronics, appliances & local brands.'
    },
    icon: 'ShoppingBag',
    category: 'ecommerce',
    status: 'active',
    badge: {
      fr: 'Disponible',
      ar: 'متوفر الآن',
      en: 'Live Now'
    },
    isFeatured: true,
    order: 0,
    targetRoute: '/catalog',
    tags: ['E-Commerce', '58 Wilayas', 'Paiement à la livraison'],
    waitingListCount: 15400
  },
  {
    id: 'olma-express',
    slug: 'express-logistique',
    title: {
      fr: 'Olma Express & Coursier',
      ar: 'أولما توصيل سريع',
      en: 'Olma Express Courier'
    },
    description: {
      fr: 'Livraison express inter-wilayas et coursier instantané pour vos colis et documents.',
      ar: 'توصيل سريع بين الولايات ورسائل فورية للطرود والوثائق.',
      en: 'Inter-wilaya parcel express delivery and fast city courier.'
    },
    icon: 'Truck',
    category: 'logistics',
    status: 'beta',
    badge: {
      fr: 'Version Beta',
      ar: 'نسخة تجريبية',
      en: 'Beta Release'
    },
    isFeatured: false,
    order: 4,
    tags: ['Livraison', 'Suivi GPS', 'Colis'],
    waitingListCount: 980
  },
  {
    id: 'olma-food',
    slug: 'supermarche-epicerie',
    title: {
      fr: 'Olma Epicerie & Express Food',
      ar: 'أولما بقالة وتغذية',
      en: 'Olma Grocery & Fresh'
    },
    description: {
      fr: 'Vos courses quotidiennes et produits frais livrés à domicile en moins de 60 minutes.',
      ar: 'مشترياتك اليومية والمنتجات الطازجة مسلّمة لباب منزلك في أقل من 60 دقيقة.',
      en: 'Daily groceries, fresh market produce and essentials delivered fast.'
    },
    icon: 'UtensilsCrossed',
    category: 'food',
    status: 'coming_soon',
    badge: {
      fr: 'Prochainement',
      ar: 'قريباً جداً',
      en: 'Next Up'
    },
    isFeatured: false,
    order: 5,
    tags: ['Epicerie', 'Produits Frais', 'Supermarché'],
    waitingListCount: 1870
  }
];
