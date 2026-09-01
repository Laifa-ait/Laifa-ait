import { OlmaAppModule } from '../types/olmaUnivers';

export const DEFAULT_OLMA_APPS: OlmaAppModule[] = [
  {
    id: 'express',
    slug: 'olma-express',
    title: {
      fr: 'Olma Express',
      ar: 'أولما إكسبريس',
      en: 'Olma Express'
    },
    description: {
      fr: 'Livraison ultra-rapide 24-48h garantie dans les 58 Wilayas d\'Algérie.',
      ar: 'توصيل سريع مضمون خلال 24-48 ساعة عبر 58 ولاية.',
      en: 'Ultra-fast 24-48h guaranteed shipping across 58 Wilayas.'
    },
    icon: 'Truck',
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    badgeColor: 'bg-sky-500 text-white font-bold',
    category: 'logistics',
    status: 'active',
    badge: {
      fr: '48H',
      ar: '48 ساعة',
      en: '48H'
    },
    isFeatured: true,
    targetRoute: '/shop?express=true',
    actionType: 'route',
    order: 1,
    tags: ['Livraison', 'Express', '58 Wilayas'],
    showInHomeShortcuts: true
  },
  {
    id: 'flash',
    slug: 'ventes-flash',
    title: {
      fr: 'Ventes Flash',
      ar: 'عروض خاطفة',
      en: 'Flash Deals'
    },
    description: {
      fr: 'Promotions exclusives à durée limitée jusqu\'à -70% sur les grandes marques.',
      ar: 'تخفيضات حصرية لفترة محدودة تصل إلى -70%.',
      en: 'Exclusive limited-time flash discounts up to 70% off.'
    },
    icon: 'Zap',
    gradient: 'from-red-500 via-rose-500 to-orange-500',
    badgeColor: 'bg-red-500 text-white animate-pulse',
    category: 'deals',
    status: 'active',
    badge: {
      fr: '🔥 HOT',
      ar: '🔥 عاجل',
      en: '🔥 HOT'
    },
    isFeatured: true,
    targetRoute: '/shop?flash=true',
    actionType: 'route',
    order: 2,
    tags: ['Promos', 'Flash', 'Remise'],
    showInHomeShortcuts: true
  },
  {
    id: 'coupons',
    slug: 'bons-plans',
    title: {
      fr: 'Bons Plans',
      ar: 'كوبونات وخصم',
      en: 'Coupons & Deals'
    },
    description: {
      fr: 'Codes promo vérifiés, remises exceptionnelles et packs économiques.',
      ar: 'قسائم شراء وخصومات استثنائية وباقات اقتصادية.',
      en: 'Verified coupon codes, discounts and bundles.'
    },
    icon: 'Gift',
    gradient: 'from-amber-400 via-amber-500 to-orange-500',
    badgeColor: 'bg-amber-500 text-white font-bold',
    category: 'deals',
    status: 'active',
    badge: {
      fr: '-50%',
      ar: '-50%',
      en: '-50%'
    },
    isFeatured: true,
    targetRoute: '/shop?discount=true',
    actionType: 'route',
    order: 3,
    tags: ['Coupons', 'Remise', 'Economie'],
    showInHomeShortcuts: true
  },
  {
    id: 'global',
    slug: 'olma-global',
    title: {
      fr: 'Olma Global',
      ar: 'ماركات عالمية',
      en: 'Olma Global'
    },
    description: {
      fr: 'Boutiques internationales certifiées et produits originaux importés.',
      ar: 'متاجر عالمية موثقة ومنتجات أصلية مستوردة.',
      en: 'Certified international brands and genuine imports.'
    },
    icon: 'Globe2',
    gradient: 'from-purple-500 via-violet-600 to-indigo-600',
    badgeColor: 'bg-purple-600 text-white font-bold',
    category: 'ecommerce',
    status: 'active',
    badge: {
      fr: 'NEW',
      ar: 'جديد',
      en: 'NEW'
    },
    isFeatured: true,
    targetRoute: '/shop?imported=true',
    actionType: 'route',
    order: 4,
    tags: ['Global', 'Import', 'Marques'],
    showInHomeShortcuts: true
  },
  {
    id: 'supermarket',
    slug: 'supermarche',
    title: {
      fr: 'Supermarché',
      ar: 'سوبرماركت',
      en: 'Supermarket'
    },
    description: {
      fr: 'Epicerie, produits frais, entretien & hygiène au meilleur prix.',
      ar: 'بقالة، منتجات طازجة، تنظيف وعناية بأفضل الأسعار.',
      en: 'Grocery, fresh products & essentials at best prices.'
    },
    icon: 'ShoppingBasket',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    badgeColor: 'bg-emerald-500 text-white font-bold',
    category: 'food',
    status: 'active',
    badge: {
      fr: 'FRAIS',
      ar: 'طازج',
      en: 'FRESH'
    },
    isFeatured: true,
    targetRoute: 'Épicerie',
    actionType: 'category',
    order: 5,
    tags: ['Epicerie', 'Supermarché', 'Frais'],
    showInHomeShortcuts: true
  },
  {
    id: 'fashion',
    slug: 'mode-beaute',
    title: {
      fr: 'Mode & Beauté',
      ar: 'أزياء وجمال',
      en: 'Fashion & Beauty'
    },
    description: {
      fr: 'Vêtements, cosmétiques, parfums et maroquinerie tendance.',
      ar: 'ملابس، مستحضرات تجميل، عطور وحقائب عصرية.',
      en: 'Trendy fashion, apparel, cosmetics and fragrances.'
    },
    icon: 'Sparkles',
    gradient: 'from-pink-400 via-rose-500 to-red-400',
    badgeColor: 'bg-pink-500 text-white font-bold',
    category: 'fashion',
    status: 'active',
    badge: {
      fr: 'TOP',
      ar: 'الأفضل',
      en: 'TOP'
    },
    isFeatured: true,
    targetRoute: 'Mode',
    actionType: 'category',
    order: 6,
    tags: ['Mode', 'Beauté', 'Parfums'],
    showInHomeShortcuts: true
  },
  {
    id: 'tech',
    slug: 'high-tech',
    title: {
      fr: 'High-Tech',
      ar: 'إلكترونيات',
      en: 'High-Tech'
    },
    description: {
      fr: 'Smartphones, PC portables, téléviseurs et accessoires connectés avec garantie.',
      ar: 'هواتف ذكية، حواسيب، شاشات وإلكترونيات مع الضمان.',
      en: 'Smartphones, laptops, displays and electronics with warranty.'
    },
    icon: 'Smartphone',
    gradient: 'from-cyan-400 via-blue-500 to-blue-600',
    badgeColor: 'bg-blue-600 text-white font-bold',
    category: 'tech',
    status: 'active',
    badge: {
      fr: 'OFFICIEL',
      ar: 'رسمي',
      en: 'OFFICIAL'
    },
    isFeatured: true,
    targetRoute: 'Électronique',
    actionType: 'category',
    order: 7,
    tags: ['Smartphones', 'PC', 'Gaming'],
    showInHomeShortcuts: true
  },
  {
    id: 'artisanat',
    slug: 'artisanat-dz',
    title: {
      fr: 'Artisanat DZ',
      ar: 'منتجات جزائرية',
      en: 'Artisanat DZ'
    },
    description: {
      fr: 'Créations artisanales locales, poterie, tapis et produits du terroir 100% algériens.',
      ar: 'منتجات تقليدية محلية، فخار، زرابي وخيرات بلادنا.',
      en: 'Authentic Algerian handcrafted creations, ceramics and heritage products.'
    },
    icon: 'Gem',
    gradient: 'from-emerald-500 via-green-600 to-teal-700',
    badgeColor: 'bg-green-700 text-white font-bold',
    category: 'artisanat',
    status: 'active',
    badge: {
      fr: '100% DZ',
      ar: '100% جزائري',
      en: '100% DZ'
    },
    isFeatured: true,
    targetRoute: 'Artisanat',
    actionType: 'category',
    order: 8,
    tags: ['Artisanat', 'DZ', 'Terroir'],
    showInHomeShortcuts: true
  },
  {
    id: 'olma-bricolage',
    slug: 'bricolage-artisans',
    title: {
      fr: 'Olma Bricolage',
      ar: 'أولما صيانة وحرفيين',
      en: 'Olma DIY'
    },
    description: {
      fr: 'Plomberie, électricité, outillage, peinture & réparations par des artisans vérifiés.',
      ar: 'سباكة، كهرباء، دهان وتصليحات منزلية بواسطة حرفيين معتمدين.',
      en: 'Plumbing, electrical, tools & repairs by verified artisans.'
    },
    icon: 'Wrench',
    gradient: 'from-slate-600 via-zinc-700 to-zinc-900',
    badgeColor: 'bg-slate-800 text-white font-bold',
    category: 'services',
    status: 'active',
    badge: {
      fr: 'PRO',
      ar: 'محترف',
      en: 'PRO'
    },
    isFeatured: true,
    targetRoute: '/bricolage',
    actionType: 'route',
    order: 9,
    tags: ['Artisans', 'Dépannage', 'Maison', 'Bricolage'],
    showInHomeShortcuts: true,
    waitingListCount: 1420
  },
  {
    id: 'olma-immo',
    slug: 'immo-location',
    title: {
      fr: 'Immo & Auto',
      ar: 'عقارات وسيارات',
      en: 'Real Estate & Motors'
    },
    description: {
      fr: 'Achat, vente, location d\'appartements, villas & véhicules contrôlés.',
      ar: 'كراء وبيع الشقق، الفيلات والسيارات عبر 58 ولاية.',
      en: 'Real estate, villas, rentals and certified vehicle listings.'
    },
    icon: 'Home',
    gradient: 'from-violet-500 via-fuchsia-500 to-pink-600',
    badgeColor: 'bg-violet-600 text-white font-bold',
    category: 'immo',
    status: 'active',
    badge: {
      fr: 'VIP',
      ar: 'عقارات',
      en: 'VIP'
    },
    isFeatured: true,
    targetRoute: '/immo',
    actionType: 'route',
    order: 10,
    tags: ['Immo', 'Location', 'Villas', 'Auto'],
    showInHomeShortcuts: true,
    waitingListCount: 2890
  }
];
