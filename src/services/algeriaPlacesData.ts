export interface LandmarkItem {
  name: string;
  name_ar?: string;
  category: 'quartier' | 'landmark' | 'lieu_dit';
  commune: string;
  wilaya: string;
  wilayaCode: string;
  lat: number;
  lng: number;
  zoom: number;
  description?: string;
}

export const ALGERIAN_POPULAR_LANDMARKS: LandmarkItem[] = [
  // Alger (16) - Quartiers & Repères Clés
  { name: 'Bouchaoui', name_ar: 'بوشاوي', category: 'quartier', commune: 'Cheraga', wilaya: 'Alger', wilayaCode: '16', lat: 36.7454, lng: 2.9128, zoom: 16, description: 'Forêt & Cité résidentielle' },
  { name: 'Hydra', name_ar: 'حيدرة', category: 'quartier', commune: 'Hydra', wilaya: 'Alger', wilayaCode: '16', lat: 36.7436, lng: 3.0417, zoom: 16, description: 'Quartier d\'affaires & Résidentiel' },
  { name: 'Sidi Yahia', name_ar: 'سيدي يحيى', category: 'quartier', commune: 'Hydra', wilaya: 'Alger', wilayaCode: '16', lat: 36.7350, lng: 3.0380, zoom: 16, description: 'Boulevard commercial & Boutiques' },
  { name: 'Val d\'Hydra', name_ar: 'فال دو حيدرة', category: 'quartier', commune: 'Hydra', wilaya: 'Alger', wilayaCode: '16', lat: 36.7485, lng: 3.0390, zoom: 16 },
  { name: 'Didouche Mourad', name_ar: 'ديدوش مراد', category: 'landmark', commune: 'Alger Centre', wilaya: 'Alger', wilayaCode: '16', lat: 36.7680, lng: 3.0560, zoom: 17, description: 'Grande artère du centre-ville' },
  { name: 'Telemly', name_ar: 'تيلملي', category: 'quartier', commune: 'Alger Centre', wilaya: 'Alger', wilayaCode: '16', lat: 36.7650, lng: 3.0510, zoom: 16 },
  { name: 'Belcourt / Mohamed Belouizdad', name_ar: 'بلوزداد', category: 'quartier', commune: 'Mohamed Belouizdad', wilaya: 'Alger', wilayaCode: '16', lat: 36.7510, lng: 3.0640, zoom: 16 },
  { name: 'El Biar', name_ar: 'الأبيار', category: 'quartier', commune: 'El Biar', wilaya: 'Alger', wilayaCode: '16', lat: 36.7680, lng: 3.0300, zoom: 16 },
  { name: 'Cheraga Centre', name_ar: 'وسط الشراقة', category: 'quartier', commune: 'Cheraga', wilaya: 'Alger', wilayaCode: '16', lat: 36.7689, lng: 2.9553, zoom: 16 },
  { name: 'Staoueli', name_ar: 'سطاوالي', category: 'quartier', commune: 'Staoueli', wilaya: 'Alger', wilayaCode: '16', lat: 36.7540, lng: 2.8880, zoom: 16 },
  { name: 'Moretti & Club des Pins', name_ar: 'موريتي ونادي الصنوبر', category: 'quartier', commune: 'Staoueli', wilaya: 'Alger', wilayaCode: '16', lat: 36.7590, lng: 2.8710, zoom: 16 },
  { name: 'Zeralda', name_ar: 'زرالدة', category: 'quartier', commune: 'Zeralda', wilaya: 'Alger', wilayaCode: '16', lat: 36.7140, lng: 2.8420, zoom: 15 },
  { name: 'Dely Ibrahim', name_ar: 'دالي إبراهيم', category: 'quartier', commune: 'Dely Ibrahim', wilaya: 'Alger', wilayaCode: '16', lat: 36.7530, lng: 2.9830, zoom: 16 },
  { name: 'Ain Allah', name_ar: 'عين الله', category: 'quartier', commune: 'Dely Ibrahim', wilaya: 'Alger', wilayaCode: '16', lat: 36.7580, lng: 2.9960, zoom: 16 },
  { name: 'Chevalley', name_ar: 'شوفالي', category: 'quartier', commune: 'Bouzareah', wilaya: 'Alger', wilayaCode: '16', lat: 36.7720, lng: 3.0180, zoom: 16 },
  { name: 'Ben Aknoun', name_ar: 'بن عكنون', category: 'quartier', commune: 'Ben Aknoun', wilaya: 'Alger', wilayaCode: '16', lat: 36.7590, lng: 3.0130, zoom: 16 },
  { name: 'Ain Benian', name_ar: 'عين البنيان', category: 'quartier', commune: 'Ain Benian', wilaya: 'Alger', wilayaCode: '16', lat: 36.8020, lng: 2.9220, zoom: 16 },
  { name: 'La Madrague (El Djamila)', name_ar: 'الجميلة', category: 'quartier', commune: 'Ain Benian', wilaya: 'Alger', wilayaCode: '16', lat: 36.8040, lng: 2.9320, zoom: 16 },
  { name: 'Kouba', name_ar: 'القبة', category: 'quartier', commune: 'Kouba', wilaya: 'Alger', wilayaCode: '16', lat: 36.7280, lng: 3.0820, zoom: 16 },
  { name: 'Vieux Kouba', name_ar: 'القبة القديمة', category: 'quartier', commune: 'Kouba', wilaya: 'Alger', wilayaCode: '16', lat: 36.7330, lng: 3.0760, zoom: 16 },
  { name: 'Bab Ezzouar', name_ar: 'باب الزوار', category: 'quartier', commune: 'Bab Ezzouar', wilaya: 'Alger', wilayaCode: '16', lat: 36.7160, lng: 3.1830, zoom: 15 },
  { name: 'USTHB Bab Ezzouar', name_ar: 'جامعة هواري بومدين', category: 'landmark', commune: 'Bab Ezzouar', wilaya: 'Alger', wilayaCode: '16', lat: 36.7120, lng: 3.1810, zoom: 16 },
  { name: 'Centre Commercial Bab Ezzouar', name_ar: 'المركز التجاري باب الزوار', category: 'landmark', commune: 'Bab Ezzouar', wilaya: 'Alger', wilayaCode: '16', lat: 36.7145, lng: 3.1900, zoom: 17 },
  { name: 'Bordj El Kiffan', name_ar: 'برج الكيفان', category: 'quartier', commune: 'Bordj El Kiffan', wilaya: 'Alger', wilayaCode: '16', lat: 36.7500, lng: 3.1920, zoom: 15 },
  { name: 'Mohammadia & SAFEX', name_ar: 'المحمدية وصافكس', category: 'landmark', commune: 'Mohammadia', wilaya: 'Alger', wilayaCode: '16', lat: 36.7350, lng: 3.1500, zoom: 16 },
  { name: 'Djamaâ El Djazaïr (Grande Mosquée)', name_ar: 'جامع الجزائر الأعظم', category: 'landmark', commune: 'Mohammadia', wilaya: 'Alger', wilayaCode: '16', lat: 36.7342, lng: 3.1417, zoom: 17 },
  { name: 'Maqam Echahid (Monument des Martyrs)', name_ar: 'مقام الشهيد', category: 'landmark', commune: 'El Madania', wilaya: 'Alger', wilayaCode: '16', lat: 36.7458, lng: 3.0697, zoom: 17 },
  { name: 'Jardin d\'Essai du Hamma', name_ar: 'حديقة التجارب الحامة', category: 'landmark', commune: 'Mohamed Belouizdad', wilaya: 'Alger', wilayaCode: '16', lat: 36.7444, lng: 3.0736, zoom: 17 },
  { name: 'Said Hamdine', name_ar: 'سعيد حمدين', category: 'quartier', commune: 'Bir Mourad Rais', wilaya: 'Alger', wilayaCode: '16', lat: 36.7310, lng: 3.0460, zoom: 16 },
  { name: 'Bir Khadem', name_ar: 'بئر خادم', category: 'quartier', commune: 'Bir Khadem', wilaya: 'Alger', wilayaCode: '16', lat: 36.7180, lng: 3.0510, zoom: 16 },
  { name: 'Ouled Fayet', name_ar: 'أولاد فايت', category: 'quartier', commune: 'Ouled Fayet', wilaya: 'Alger', wilayaCode: '16', lat: 36.7360, lng: 2.9460, zoom: 15 },
  { name: 'Souidania', name_ar: 'سويدانية', category: 'quartier', commune: 'Souidania', wilaya: 'Alger', wilayaCode: '16', lat: 36.7090, lng: 2.9120, zoom: 15 },
  { name: 'Draria', name_ar: 'درارية', category: 'quartier', commune: 'Draria', wilaya: 'Alger', wilayaCode: '16', lat: 36.7180, lng: 3.0030, zoom: 15 },
  { name: 'Ain Taya', name_ar: 'عين طاية', category: 'quartier', commune: 'Ain Taya', wilaya: 'Alger', wilayaCode: '16', lat: 36.7930, lng: 3.2860, zoom: 15 },
  { name: 'Rouiba', name_ar: 'الرويبة', category: 'quartier', commune: 'Rouiba', wilaya: 'Alger', wilayaCode: '16', lat: 36.7380, lng: 3.2830, zoom: 15 },
  { name: 'Reghaia', name_ar: 'رغاية', category: 'quartier', commune: 'Reghaia', wilaya: 'Alger', wilayaCode: '16', lat: 36.7350, lng: 3.3400, zoom: 15 },
  { name: 'Bordj El Bahri', name_ar: 'برج البحري', category: 'quartier', commune: 'Bordj El Bahri', wilaya: 'Alger', wilayaCode: '16', lat: 36.7880, lng: 3.2350, zoom: 15 },
  { name: 'Sidi Fredj', name_ar: 'سيدي فرج', category: 'landmark', commune: 'Staoueli', wilaya: 'Alger', wilayaCode: '16', lat: 36.7620, lng: 2.8460, zoom: 16, description: 'Port de plaisance & Presqu\'île' },
  { name: 'Plage Palm Beach', name_ar: 'بالم بيتش', category: 'landmark', commune: 'Staoueli', wilaya: 'Alger', wilayaCode: '16', lat: 36.7710, lng: 2.8630, zoom: 16 },

  // Oran (31)
  { name: 'Akid Lotfi', name_ar: 'عقيد لطفي', category: 'quartier', commune: 'Bir El Djir', wilaya: 'Oran', wilayaCode: '31', lat: 35.7190, lng: -0.6010, zoom: 16, description: 'Quartier résidentiel & Restaurants' },
  { name: 'Canastel', name_ar: 'كناستيل', category: 'quartier', commune: 'Oran', wilaya: 'Oran', wilayaCode: '31', lat: 35.7380, lng: -0.5690, zoom: 16 },
  { name: 'Maraval', name_ar: 'مارافال', category: 'quartier', commune: 'Oran', wilaya: 'Oran', wilayaCode: '31', lat: 35.6880, lng: -0.6480, zoom: 16 },
  { name: 'Gambetta', name_ar: 'غامبيطة', category: 'quartier', commune: 'Oran', wilaya: 'Oran', wilayaCode: '31', lat: 35.7080, lng: -0.6270, zoom: 16 },
  { name: 'Front de Mer Oran', name_ar: 'واجهة البحر وهران', category: 'landmark', commune: 'Oran', wilaya: 'Oran', wilayaCode: '31', lat: 35.7050, lng: -0.6450, zoom: 16 },
  { name: 'Bir El Djir', name_ar: 'بئر الجير', category: 'quartier', commune: 'Bir El Djir', wilaya: 'Oran', wilayaCode: '31', lat: 35.7160, lng: -0.5750, zoom: 15 },
  { name: 'Ain El Turk', name_ar: 'عين الترك', category: 'quartier', commune: 'Ain El Turk', wilaya: 'Oran', wilayaCode: '31', lat: 35.7440, lng: -0.7510, zoom: 15 },
  { name: 'Les Andalouses', name_ar: 'الأندلسيات', category: 'landmark', commune: 'El Ancor', wilaya: 'Oran', wilayaCode: '31', lat: 35.7330, lng: -0.8710, zoom: 15 },
  { name: 'Fort de Santa Cruz', name_ar: 'قلعة سانتا كروز', category: 'landmark', commune: 'Oran', wilaya: 'Oran', wilayaCode: '31', lat: 35.7090, lng: -0.6650, zoom: 16 },

  // Constantine (25)
  { name: 'Ali Mendjeli (Nouvelle Ville)', name_ar: 'المدينة الجديدة علي منجلي', category: 'quartier', commune: 'El Khroub', wilaya: 'Constantine', wilayaCode: '25', lat: 36.2430, lng: 6.5700, zoom: 15 },
  { name: 'Zouaghi Slimane', name_ar: 'زواغي سليمان', category: 'quartier', commune: 'Constantine', wilaya: 'Constantine', wilayaCode: '25', lat: 36.3150, lng: 6.6200, zoom: 16 },
  { name: 'Sidi Mabrouk', name_ar: 'سيدي مبروك', category: 'quartier', commune: 'Constantine', wilaya: 'Constantine', wilayaCode: '25', lat: 36.3450, lng: 6.6280, zoom: 16 },
  { name: 'Bellevue', name_ar: 'بيلفي قسنطينة', category: 'quartier', commune: 'Constantine', wilaya: 'Constantine', wilayaCode: '25', lat: 36.3530, lng: 6.6020, zoom: 16 },
  { name: 'Pont Suspendu Sidi M\'Cid', name_ar: 'جسر سيدي مسيد المعلق', category: 'landmark', commune: 'Constantine', wilaya: 'Constantine', wilayaCode: '25', lat: 36.3720, lng: 6.6150, zoom: 17 },

  // Annaba (23)
  { name: 'Chapuis & Plage Rizi Amor', name_ar: 'شاطئ شابي وريزي عمر', category: 'landmark', commune: 'Annaba', wilaya: 'Annaba', wilayaCode: '23', lat: 36.9200, lng: 7.7650, zoom: 16 },
  { name: 'Kouba Annaba', name_ar: 'قبة عنابة', category: 'quartier', commune: 'Annaba', wilaya: 'Annaba', wilayaCode: '23', lat: 36.9280, lng: 7.7480, zoom: 16 },
  { name: 'Cours de la Révolution', name_ar: 'شارع الثورة عنابة', category: 'landmark', commune: 'Annaba', wilaya: 'Annaba', wilayaCode: '23', lat: 36.9010, lng: 7.7610, zoom: 17 },
  { name: 'Seraïdi (Mont Edough)', name_ar: 'سرايدي جبل إيدوغ', category: 'quartier', commune: 'Seraidi', wilaya: 'Annaba', wilayaCode: '23', lat: 36.9170, lng: 7.6740, zoom: 15 },

  // Sétif (19)
  { name: 'Fontaine Ain Fouara', name_ar: 'عين الفوارة سطيف', category: 'landmark', commune: 'Setif', wilaya: 'Setif', wilayaCode: '19', lat: 36.1910, lng: 5.4130, zoom: 17 },
  { name: 'Park Mall Sétif', name_ar: 'بارك مول سطيف', category: 'landmark', commune: 'Setif', wilaya: 'Setif', wilayaCode: '19', lat: 36.1890, lng: 5.4050, zoom: 17 },
  { name: 'El Eulma', name_ar: 'العلمة', category: 'quartier', commune: 'El Eulma', wilaya: 'Setif', wilayaCode: '19', lat: 36.1550, lng: 5.6900, zoom: 15 },

  // Blida (09)
  { name: 'Bouinan', name_ar: 'بوعينان (المدينة الجديدة)', category: 'quartier', commune: 'Bouinan', wilaya: 'Blida', wilayaCode: '09', lat: 36.5320, lng: 2.9960, zoom: 15 },
  { name: 'Ouled Yaich', name_ar: 'أولاد يعيش', category: 'quartier', commune: 'Ouled Yaich', wilaya: 'Blida', wilayaCode: '09', lat: 36.4950, lng: 2.8580, zoom: 15 },
  { name: 'Chréa', name_ar: 'الشريعة جبال الأطلس', category: 'landmark', commune: 'Chrea', wilaya: 'Blida', wilayaCode: '09', lat: 36.4250, lng: 2.8770, zoom: 15 },

  // Tizi Ouzou (15) & Béjaïa (06)
  { name: 'Nouvelle Ville Tizi Ouzou', name_ar: 'المدينة الجديدة تيزي وزو', category: 'quartier', commune: 'Tizi Ouzou', wilaya: 'Tizi Ouzou', wilayaCode: '15', lat: 36.7020, lng: 4.0450, zoom: 16 },
  { name: 'Ihaddaden Béjaïa', name_ar: 'إحدادن بجاية', category: 'quartier', commune: 'Bejaia', wilaya: 'Bejaia', wilayaCode: '06', lat: 36.7420, lng: 5.0560, zoom: 16 },
  { name: 'Cap Carbon', name_ar: 'رأس كربون قمة القرود', category: 'landmark', commune: 'Bejaia', wilaya: 'Bejaia', wilayaCode: '06', lat: 36.7750, lng: 5.1050, zoom: 16 },
  { name: 'Tichy Plage', name_ar: 'تيشي شواطئ', category: 'landmark', commune: 'Tichy', wilaya: 'Bejaia', wilayaCode: '06', lat: 36.6690, lng: 5.1630, zoom: 15 },

  // Tlemcen (13)
  { name: 'Imama Tlemcen', name_ar: 'إمامة تلمسان', category: 'quartier', commune: 'Mansourah', wilaya: 'Tlemcen', wilayaCode: '13', lat: 34.8980, lng: -1.3320, zoom: 16 },
  { name: 'Mansourah Minaret', name_ar: 'صومعة المنصورة التاريخية', category: 'landmark', commune: 'Mansourah', wilaya: 'Tlemcen', wilayaCode: '13', lat: 34.8710, lng: -1.3410, zoom: 16 },
  { name: 'Plateau Lalla Setti', name_ar: 'هضبة لالة ستي', category: 'landmark', commune: 'Tlemcen', wilaya: 'Tlemcen', wilayaCode: '13', lat: 34.8690, lng: -1.3120, zoom: 16 },

  // Sahara & Sud
  { name: 'Vallée du M\'Zab', name_ar: 'وادي ميزاب غرداية', category: 'landmark', commune: 'Ghardaia', wilaya: 'Ghardaia', wilayaCode: '47', lat: 32.4910, lng: 3.6730, zoom: 15 },
  { name: 'Taghit Oasis & Dunes', name_ar: 'واحة وكثبان تاغيت', category: 'landmark', commune: 'Taghit', wilaya: 'Bechar', wilayaCode: '08', lat: 30.9160, lng: -2.0330, zoom: 15 },
  { name: 'Ruines Romaines de Timgad', name_ar: 'آثار تيمقاد الرومانية', category: 'landmark', commune: 'Timgad', wilaya: 'Batna', wilayaCode: '05', lat: 35.4840, lng: 6.4670, zoom: 16 },
];
