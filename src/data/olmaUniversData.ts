import { OlmaAppModule } from '../types/olmaUnivers';

export const DEFAULT_OLMA_APPS: OlmaAppModule[] = [
  // --- 1. APPLICATIONS CRÉÉES (DISPONIBLES MAINTENANT) ---
  {
    id: 'olmart-marketplace',
    slug: 'olmart-marketplace',
    title: {
      fr: 'Olmart Premier Marketplace',
      ar: 'سوق أولمارت الرئيسي',
      en: 'Olmart Premier Marketplace'
    },
    description: {
      fr: 'La marketplace e-commerce centrale pour la mode, l\'électronique, l\'électroménager et les marques locales en Algérie.',
      ar: 'المنصة المركزية للتسوق الإلكتروني للموضة، الإلكترونيات والمنتجات المحلية.',
      en: 'The core marketplace for fashion, electronics, appliances and local brands.'
    },
    longDescription: {
      fr: 'Accédez à des milliers de références avec paiement sécurisé à la livraison, séquestre BaridiMob et livraison garantie dans les 58 Wilayas.',
      ar: 'تسوق آلاف المنتجات مع دفع آمن عند الاستلام وضمان التوصيل لجميع الولايات.',
      en: 'Browse thousands of products with secure COD and delivery to 58 Wilayas.'
    },
    icon: 'Store',
    gradient: 'from-amber-500 via-orange-500 to-amber-600',
    badgeColor: 'bg-amber-500 text-white font-bold',
    category: 'ecommerce',
    status: 'active',
    badge: {
      fr: 'Disponible',
      ar: 'متوفر الآن',
      en: 'Live Now'
    },
    isFeatured: true,
    targetRoute: '/',
    actionType: 'route',
    order: 1,
    tags: ['E-Commerce', '58 Wilayas', 'Paiement Sécurisé'],
    showInHomeShortcuts: true,
    waitingListCount: 15400
  },
  {
    id: 'olma-bricolage',
    slug: 'bricolage-artisans',
    title: {
      fr: 'Olma Bricolage & Artisans',
      ar: 'أولما صيانة وحرفيين',
      en: 'Olma Bricolage & Artisans'
    },
    description: {
      fr: 'Plateforme de mise en relation directe avec des artisans et techniciens qualifiés : plomberie, électricité, dépannage & travaux.',
      ar: 'منصة حجز حرفيين وفنيين معتمدين في السباكة والكهرباء والدهان والتصليح المنزلي.',
      en: 'Direct platform connecting homeowners with certified artisans and technicians: plumbing, electrical, repairs.'
    },
    longDescription: {
      fr: 'Trouvez un artisan certifié près de chez vous, demandez un devis gratuit et suivez vos interventions avec garantie satisfaction.',
      ar: 'احجز فني معتمد بالقرب منك مع تقييمات حقيقية وأسعار شفافة.',
      en: 'Book certified plumbers, electricians and home repair experts with verified ratings.'
    },
    icon: 'Wrench',
    gradient: 'from-blue-600 via-indigo-600 to-slate-800',
    badgeColor: 'bg-blue-600 text-white font-bold',
    category: 'services',
    status: 'active',
    badge: {
      fr: 'Disponible',
      ar: 'متوفر الآن',
      en: 'Live Now'
    },
    isFeatured: true,
    targetRoute: '/bricolage',
    actionType: 'route',
    order: 2,
    tags: ['Artisans', 'Dépannage', 'Plomberie', 'Électricité'],
    showInHomeShortcuts: true,
    waitingListCount: 3820
  },
  {
    id: 'olma-immo',
    slug: 'immo-location',
    title: {
      fr: 'Olma Immo',
      ar: 'أولما عقارات',
      en: 'Olma Immo'
    },
    description: {
      fr: 'Achat, vente et location d\'appartements, villas, terrains et locaux commerciaux avec annonces contrôlées et propriétaires certifiés.',
      ar: 'بيع، شراء وإيجار الشقق والفيلات والمحلات التجارية بإعلانات موثوقة عبر 58 ولاية.',
      en: 'Buy, sell and rent verified apartments, villas, land and commercial properties across 58 Wilayas.'
    },
    longDescription: {
      fr: 'Consultez des biens immobiliers vérifiés dans les 58 Wilayas avec visites virtuelles, filtres avancés et contact direct sans intermédiaire abusif.',
      ar: 'عقارات موثقة عبر 58 ولاية مع اتصال مباشر بالمالكين.',
      en: 'Verified real estate properties with direct owner contacts across 58 Wilayas.'
    },
    icon: 'Home',
    gradient: 'from-emerald-500 via-teal-600 to-teal-800',
    badgeColor: 'bg-emerald-600 text-white font-bold',
    category: 'immo',
    status: 'active',
    badge: {
      fr: 'Disponible',
      ar: 'متوفر الآن',
      en: 'Live Now'
    },
    isFeatured: true,
    targetRoute: '/immo',
    actionType: 'route',
    order: 3,
    tags: ['Immobilier', 'Location', 'Villas', 'Appartements'],
    showInHomeShortcuts: true,
    waitingListCount: 5210
  },
  {
    id: 'ventes-flash',
    slug: 'ventes-flash',
    title: {
      fr: 'Ventes Flash & Bonnes Affaires',
      ar: 'عروض خاطفة وتخفيضات',
      en: 'Flash Deals & Discounts'
    },
    description: {
      fr: 'Espace exclusif réservé aux promotions quotidiennes, offres éclair et remises exceptionnelles jusqu\'à -70% sur tout le catalogue.',
      ar: 'قسم حصري للتخفيضات اليومية والصفقات السريعة بأسعار استثنائية.',
      en: 'Exclusive hub for daily flash discounts up to 70% off across popular brands.'
    },
    longDescription: {
      fr: 'Profitez de baisses de prix limitées dans le temps sur les produits les plus demandés avec stocks mis à jour en direct.',
      ar: 'خصومات لفترة محدودة على أفضل المنتجات مع تحديث مباشر للمخزون.',
      en: 'Limited-time price drops on top trending items with real-time stock updates.'
    },
    icon: 'Zap',
    gradient: 'from-rose-500 via-red-500 to-amber-500',
    badgeColor: 'bg-rose-600 text-white font-bold',
    category: 'deals',
    status: 'active',
    badge: {
      fr: 'Disponible',
      ar: 'متوفر الآن',
      en: 'Live Now'
    },
    isFeatured: true,
    targetRoute: '/shop?flash=true',
    actionType: 'route',
    order: 4,
    tags: ['Promos', 'Flash', 'Remises', 'Économies'],
    showInHomeShortcuts: true,
    waitingListCount: 8940
  },

  // --- 2. APPLICATIONS QUI RESTENT À CRÉER (PROCHAINES SORTIES) ---
  {
    id: 'olma-auto',
    slug: 'olma-auto-motors',
    title: {
      fr: 'Olma Auto & Véhicules (Motors DZ)',
      ar: 'أولما سيارات ومركبات (موتورز)',
      en: 'Olma Motors DZ & Vehicles'
    },
    description: {
      fr: 'Plateforme spécialisée dans l\'achat, la vente de véhicules neufs & occasion, pièces détachées et location automobile contrôlée.',
      ar: 'منصة متخصصة في بيع وشراء السيارات الجديدة والمستعملة وقطع الغيار وخدمات الكراء.',
      en: 'Dedicated automotive hub for new and used cars, certified inspections and auto parts.'
    },
    longDescription: {
      fr: 'Trouvez votre véhicule avec rapport d\'inspection technique, historique vérifié, simulateur de prix et annonces de concessionnaires agréés.',
      ar: 'ابحث عن سيارتك القادمة مع فحص تقني وضمان المعاملة عبر كامل ولايات الوطن.',
      en: 'Browse certified vehicles with inspection history, fair pricing algorithms and trusted dealers.'
    },
    icon: 'Car',
    gradient: 'from-sky-500 via-cyan-600 to-blue-700',
    badgeColor: 'bg-sky-500 text-white font-bold',
    category: 'auto',
    status: 'coming_soon',
    badge: {
      fr: 'En cours de création',
      ar: 'قيد التطوير',
      en: 'Coming Soon'
    },
    isFeatured: true,
    targetRoute: '/auto',
    actionType: 'route',
    order: 5,
    tags: ['Automobile', 'Occasion', 'Neuf', 'Pièces DZ'],
    showInHomeShortcuts: true,
    waitingListCount: 4620
  },
  {
    id: 'olma-express',
    slug: 'olma-express-coursier',
    title: {
      fr: 'Olma Express & Logistique',
      ar: 'أولما إكسبريس وتوصيل سريع',
      en: 'Olma Express & Logistics'
    },
    description: {
      fr: 'Service dédié de livraison express inter-wilayas 24-48h et coursiers urbains instantanés pour colis, plis et commandes marchandes.',
      ar: 'خدمة التوصيل السريع بين الولايات وتوصيل الطرود والوثائق في نفس اليوم.',
      en: 'Inter-wilaya 24-48h express logistics and instant on-demand city parcel dispatch.'
    },
    longDescription: {
      fr: 'Suivi par géolocalisation en temps réel, enlèvement à domicile, bordereaux automatisés et tarifs négociés pour particuliers et e-commerçants.',
      ar: 'تتبع مسار شحنتك لحظة بلحظة واستلام الطرود من باب منزلك أو محلك التجاري.',
      en: 'Live real-time courier tracking, home parcel pickup and optimized merchant shipping rates.'
    },
    icon: 'Truck',
    gradient: 'from-blue-500 via-indigo-500 to-purple-600',
    badgeColor: 'bg-blue-600 text-white font-bold',
    category: 'logistics',
    status: 'coming_soon',
    badge: {
      fr: 'En cours de création',
      ar: 'قيد التطوير',
      en: 'Coming Soon'
    },
    isFeatured: true,
    targetRoute: '/express',
    actionType: 'route',
    order: 6,
    tags: ['Livraison', 'Express', 'Colis', 'Suivi GPS'],
    showInHomeShortcuts: true,
    waitingListCount: 3150
  },
  {
    id: 'olma-food',
    slug: 'olma-food-epicerie',
    title: {
      fr: 'Olma Food & Épicerie Express',
      ar: 'أولما بقالة وتوصيل أطعمة',
      en: 'Olma Food & Quick Grocery'
    },
    description: {
      fr: 'Courses quotidiennes, alimentation générale, produits frais du terroir et plats préparés livrés à domicile en moins de 60 minutes.',
      ar: 'توصيل مستلزمات البقالة اليومية، الخضر والفواكه الطازجة والوجبات إلى باب منزلك.',
      en: 'Daily essentials, fresh market grocery and local restaurant meals delivered in under 60 minutes.'
    },
    longDescription: {
      fr: 'Le supermarché local dans votre poche : approvisionnement auprès des commerces de proximité, sélection de produits frais et livraison ultra-rapide.',
      ar: 'بقالتك المفضلة وأجود المنتجات الطازجة تصلك بسرعة وأمان.',
      en: 'On-demand grocery delivery directly from verified local shops and regional food artisans.'
    },
    icon: 'ShoppingBag',
    gradient: 'from-emerald-400 via-green-500 to-lime-600',
    badgeColor: 'bg-green-600 text-white font-bold',
    category: 'food',
    status: 'coming_soon',
    badge: {
      fr: 'En cours de création',
      ar: 'قيد التطوير',
      en: 'Coming Soon'
    },
    isFeatured: true,
    targetRoute: '/food',
    actionType: 'route',
    order: 7,
    tags: ['Épicerie', 'Frais', 'Repas', 'Moins de 60 min'],
    showInHomeShortcuts: true,
    waitingListCount: 2780
  },
  {
    id: 'olma-pay',
    slug: 'olma-pay-wallet',
    title: {
      fr: 'Olma Pay & Portefeuille Séquestre',
      ar: 'أولما باي والمحفظة الرقمية',
      en: 'Olma Pay & Digital Escrow'
    },
    description: {
      fr: 'Solution financière intégrée : portefeuille numérique, paiements marchands CIB/Edahabia et protection des transactions sous séquestre.',
      ar: 'محفظة دفع رقمية، دفع إلكتروني بالبطاقة الذهبية وCIB ونظام الحساب الوسيط الآمن.',
      en: 'Integrated fintech wallet, CIB/Edahabia digital payments and escrow security.'
    },
    longDescription: {
      fr: 'Paiements instantanés entre membres, conservation des fonds sous séquestre jusqu\'à confirmation de réception, et retraits sécurisés.',
      ar: 'معاملات مالية فورية ومحمية لحماية المشتري والبائع على حد سواء.',
      en: 'Instant transfers, secure merchant escrow checkout and verified buyer-seller protection.'
    },
    icon: 'CreditCard',
    gradient: 'from-purple-600 via-violet-600 to-indigo-800',
    badgeColor: 'bg-purple-600 text-white font-bold',
    category: 'services',
    status: 'coming_soon',
    badge: {
      fr: 'En cours de création',
      ar: 'قيد التطوير',
      en: 'Coming Soon'
    },
    isFeatured: true,
    targetRoute: '/pay',
    actionType: 'route',
    order: 8,
    tags: ['Paiement', 'Portefeuille', 'Séquestre', 'CIB & Edahabia'],
    showInHomeShortcuts: true,
    waitingListCount: 6140
  }
];
