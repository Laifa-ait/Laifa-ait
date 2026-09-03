/**
 * Official database of the 58 Algerian Wilayas and 1,541 Communes
 * Complete with official French & Arabic names, Daïras, postal codes and GPS coordinates.
 */

export interface CommuneInfo {
  name: string;
  name_ar: string;
  daira: string;
  postal_code: string;
  lat: number;
  lng: number;
}

export interface WilayaInfo {
  code: string;
  name: string;
  name_ar: string;
  lat: number;
  lng: number;
  communes: CommuneInfo[];
}

export const ALGERIA_WILAYAS_DATABASE: WilayaInfo[] = [
  {
    "code": "01",
    "name": "Adrar",
    "name_ar": "أدرار",
    "lat": 27.867,
    "lng": -0.283,
    "communes": [
      {
        "name": "Adrar",
        "name_ar": "أدرار",
        "daira": "Adrar",
        "postal_code": "01000",
        "lat": 27.87429,
        "lng": -0.297222
      },
      {
        "name": "Akabli",
        "name_ar": "اقبلي",
        "daira": "Aoulef",
        "postal_code": "01044",
        "lat": 26.70828,
        "lng": 0.2833
      },
      {
        "name": "Aoulef",
        "name_ar": "أولف",
        "daira": "Aoulef",
        "postal_code": "01003",
        "lat": 26.96667,
        "lng": 1.08333
      },
      {
        "name": "Bouda",
        "name_ar": "بودة",
        "daira": "Adrar",
        "postal_code": "01023",
        "lat": 28.0142,
        "lng": -0.50254
      },
      {
        "name": "Fenoughil",
        "name_ar": "فنوغيل",
        "daira": "Fenoughil",
        "postal_code": "01008",
        "lat": 27.602777,
        "lng": 0.3
      },
      {
        "name": "In Zghmir",
        "name_ar": "إن زغمير",
        "daira": "Zaouiet Kounta",
        "postal_code": "01047",
        "lat": 27.093889,
        "lng": -0.121
      },
      {
        "name": "Ouled Ahmed Timmi",
        "name_ar": "أولاد أحمد تيمي",
        "daira": "Adrar",
        "postal_code": "01025",
        "lat": 27.851111,
        "lng": 0.2863
      },
      {
        "name": "Reggane",
        "name_ar": "رقان",
        "daira": "Reggane",
        "postal_code": "01004",
        "lat": 26.71576,
        "lng": 0.1714
      },
      {
        "name": "Sali",
        "name_ar": "سالي",
        "daira": "Reggane",
        "postal_code": "01009",
        "lat": 26.983333,
        "lng": -0.0275
      },
      {
        "name": "Sebaa",
        "name_ar": "السبع",
        "daira": "Tsabit",
        "postal_code": "01022",
        "lat": 28.21194,
        "lng": -0.175
      },
      {
        "name": "Tamantit",
        "name_ar": "تامنطيط",
        "daira": "Fenoughil",
        "postal_code": "01021",
        "lat": 27.7605,
        "lng": -0.266699
      },
      {
        "name": "Tamest",
        "name_ar": "تامست",
        "daira": "Fenoughil",
        "postal_code": "01020",
        "lat": 27.416666,
        "lng": 0.2667
      },
      {
        "name": "Timekten",
        "name_ar": "تيمقتن",
        "daira": "Aoulef",
        "postal_code": "01041",
        "lat": 27.021666,
        "lng": 1.015
      },
      {
        "name": "Tit",
        "name_ar": "تيت",
        "daira": "Aoulef",
        "postal_code": "01031",
        "lat": 26.950833,
        "lng": 1.015
      },
      {
        "name": "Tsabit",
        "name_ar": "تسابيت",
        "daira": "Tsabit",
        "postal_code": "01011",
        "lat": 28.35049,
        "lng": -0.216111
      },
      {
        "name": "Zaouiet Kounta",
        "name_ar": "زاوية كنتة",
        "daira": "Zaouiet Kounta",
        "postal_code": "01007",
        "lat": 27.22269,
        "lng": -0.19781
      }
    ]
  },
  {
    "code": "02",
    "name": "Chlef",
    "name_ar": "الشلف",
    "lat": 36.16472,
    "lng": 1.33167,
    "communes": [
      {
        "name": "Abou El Hassane",
        "name_ar": "أبو الحسن",
        "daira": "Abou El Hassan",
        "postal_code": "02018",
        "lat": 36.4,
        "lng": 1.192911
      },
      {
        "name": "Ain Merane",
        "name_ar": "عين مران",
        "daira": "Aïn Merane",
        "postal_code": "02004",
        "lat": 36.16277,
        "lng": 0.97037
      },
      {
        "name": "Benairia",
        "name_ar": "بنايرية",
        "daira": "Zeboudja",
        "postal_code": "02039",
        "lat": 36.3539,
        "lng": 1.37403
      },
      {
        "name": "Beni Bouattab",
        "name_ar": "بني بوعتاب",
        "daira": "El Karimia",
        "postal_code": "02071",
        "lat": 36.001947,
        "lng": 1.646925
      },
      {
        "name": "Beni Haoua",
        "name_ar": "بني حواء",
        "daira": "Beni Haoua",
        "postal_code": "02017",
        "lat": 36.5311,
        "lng": 1.56891
      },
      {
        "name": "Beni Rached",
        "name_ar": "بني راشد",
        "daira": "Oued Fodda",
        "postal_code": "02035",
        "lat": 36.280556,
        "lng": 1.516111
      },
      {
        "name": "Boukadir",
        "name_ar": "بوقادير",
        "daira": "Boukadir",
        "postal_code": "02002",
        "lat": 36.066944,
        "lng": 1.126
      },
      {
        "name": "Bouzeghaia",
        "name_ar": "بوزغاية",
        "daira": "Zeboudja",
        "postal_code": "02019",
        "lat": 36.338889,
        "lng": 1.0503
      },
      {
        "name": "Breira",
        "name_ar": "بريرة",
        "daira": "Beni Haoua",
        "postal_code": "02070",
        "lat": 36.448802,
        "lng": 1.6482
      },
      {
        "name": "Chettia",
        "name_ar": "الشطية",
        "daira": "Ouled Fares",
        "postal_code": "02007",
        "lat": 36.158999,
        "lng": 1.24098
      },
      {
        "name": "Chlef",
        "name_ar": "الشلف",
        "daira": "Chlef",
        "postal_code": "02000",
        "lat": 36.1647,
        "lng": 1.3317
      },
      {
        "name": "Dahra",
        "name_ar": "الظهرة",
        "daira": "Taougrite",
        "postal_code": "02036",
        "lat": 36.255278,
        "lng": 0.85174
      },
      {
        "name": "El Hadjadj",
        "name_ar": "الحجاج",
        "daira": "Ouled Ben Abdelkader",
        "postal_code": "02050",
        "lat": 36.015833,
        "lng": 1.378333
      },
      {
        "name": "El Karimia",
        "name_ar": "الكريمية",
        "daira": "El Karimia",
        "postal_code": "02008",
        "lat": 36.116111,
        "lng": 1.55
      },
      {
        "name": "El Marsa",
        "name_ar": "المرسى",
        "daira": "El Marsa",
        "postal_code": "02015",
        "lat": 36.401579,
        "lng": 0.916182
      },
      {
        "name": "Harchoun",
        "name_ar": "حرشون",
        "daira": "El Karimia",
        "postal_code": "02031",
        "lat": 36.11354,
        "lng": 1.506
      },
      {
        "name": "Herenfa",
        "name_ar": "الهرانفة",
        "daira": "Aïn Merane",
        "postal_code": "02038",
        "lat": 36.245277,
        "lng": 0.970516
      },
      {
        "name": "Labiod Medjadja",
        "name_ar": "الأبيض مجاجة",
        "daira": "Ouled Fares",
        "postal_code": "02049",
        "lat": 36.276783,
        "lng": 1.385516
      },
      {
        "name": "Moussadek",
        "name_ar": "مصدق",
        "daira": "El Marsa",
        "postal_code": "02060",
        "lat": 36.333333,
        "lng": 0.7303
      },
      {
        "name": "Oued Fodda",
        "name_ar": "وادي الفضة",
        "daira": "Oued Fodda",
        "postal_code": "02003",
        "lat": 36.183333,
        "lng": 1.549921
      },
      {
        "name": "Oued Goussine",
        "name_ar": "وادي قوسين",
        "daira": "Beni Haoua",
        "postal_code": "02061",
        "lat": 36.525556,
        "lng": 1.4967
      },
      {
        "name": "Oued Sly",
        "name_ar": "وادي سلي",
        "daira": "Boukadir",
        "postal_code": "02011",
        "lat": 36.1,
        "lng": 1.2
      },
      {
        "name": "Ouled Abbes",
        "name_ar": "أولاد عباس",
        "daira": "Oued Fodda",
        "postal_code": "02029",
        "lat": 36.21909,
        "lng": 1.483333
      },
      {
        "name": "Ouled Ben Abdelkader",
        "name_ar": "أولاد بن عبد القادر",
        "daira": "Ouled Ben Abdelkader",
        "postal_code": "02037",
        "lat": 36.0258,
        "lng": 1.28
      },
      {
        "name": "Ouled Fares",
        "name_ar": "أولاد فارس",
        "daira": "Ouled Fares",
        "postal_code": "02010",
        "lat": 36.231605,
        "lng": 1.236999
      },
      {
        "name": "Oum Drou",
        "name_ar": "أم الدروع",
        "daira": "Chlef",
        "postal_code": "02024",
        "lat": 36.2,
        "lng": 1.3833
      },
      {
        "name": "Sendjas",
        "name_ar": "سنجاس",
        "daira": "Chlef",
        "postal_code": "02025",
        "lat": 36.0696,
        "lng": 1.309028
      },
      {
        "name": "Sidi Abderrahmane",
        "name_ar": "سيدي عبد الرحمن",
        "daira": "Ténès",
        "postal_code": "02066",
        "lat": 36.492277,
        "lng": 1.095742
      },
      {
        "name": "Sidi Akkacha",
        "name_ar": "سيدي عكاشة",
        "daira": "Ténès",
        "postal_code": "02009",
        "lat": 36.46472,
        "lng": 1.303
      },
      {
        "name": "Sobha",
        "name_ar": "الصبحة",
        "daira": "Boukadir",
        "postal_code": "02033",
        "lat": 36.110035,
        "lng": 1.110123
      },
      {
        "name": "Tadjena",
        "name_ar": "تاجنة",
        "daira": "Abou El Hassan",
        "postal_code": "02043",
        "lat": 36.3167,
        "lng": 1.335167
      },
      {
        "name": "Talassa",
        "name_ar": "تلعصة",
        "daira": "Abou El Hassan",
        "postal_code": "02065",
        "lat": 36.428822,
        "lng": 1.05
      },
      {
        "name": "Taougrit",
        "name_ar": "تاوقريت",
        "daira": "Taougrite",
        "postal_code": "02012",
        "lat": 36.244723,
        "lng": 0.922852
      },
      {
        "name": "Tenes",
        "name_ar": "تنس",
        "daira": "Ténès",
        "postal_code": "02006",
        "lat": 36.509722,
        "lng": 1.30809
      },
      {
        "name": "Zeboudja",
        "name_ar": "الزبوجة",
        "daira": "Zeboudja",
        "postal_code": "02014",
        "lat": 36.350527,
        "lng": 1.430283
      }
    ]
  },
  {
    "code": "03",
    "name": "Laghouat",
    "name_ar": "الأغواط",
    "lat": 33.80278,
    "lng": 2.875,
    "communes": [
      {
        "name": "Aflou",
        "name_ar": "أفلو",
        "daira": "Aflou",
        "postal_code": "",
        "lat": 34.11279,
        "lng": 2.1019
      },
      {
        "name": "Ain Madhi",
        "name_ar": "عين ماضي",
        "daira": "Aïn Madhi",
        "postal_code": "03012",
        "lat": 33.7956,
        "lng": 2.3052
      },
      {
        "name": "Ain Sidi Ali",
        "name_ar": "عين سيدي علي",
        "daira": "Gueltat Sidi Saad",
        "postal_code": "",
        "lat": 34.156872,
        "lng": 1.542386
      },
      {
        "name": "Benacer Benchohra",
        "name_ar": "بن ناصر بن شهرة",
        "daira": "Ksar El Hirane",
        "postal_code": "03033",
        "lat": 33.751463,
        "lng": 3.002939
      },
      {
        "name": "Brida",
        "name_ar": "بريدة",
        "daira": "Brida",
        "postal_code": "",
        "lat": 33.906111,
        "lng": 1.784444
      },
      {
        "name": "El Assafia",
        "name_ar": "العسافية",
        "daira": "Sidi Makhlouf",
        "postal_code": "03014",
        "lat": 33.8264,
        "lng": 2.9899
      },
      {
        "name": "El Beidha",
        "name_ar": "البيضاء",
        "daira": "Aflou",
        "postal_code": "",
        "lat": 34.47475,
        "lng": 2.17408
      },
      {
        "name": "El Ghicha",
        "name_ar": "الغيشة",
        "daira": "El Ghicha",
        "postal_code": "",
        "lat": 33.930145,
        "lng": 2.140703
      },
      {
        "name": "El Haouaita",
        "name_ar": "الحويطة",
        "daira": "Aïn Madhi",
        "postal_code": "03040",
        "lat": 33.645394,
        "lng": 2.444713
      },
      {
        "name": "Gueltat Sidi Saad",
        "name_ar": "قلتة سيدي سعد",
        "daira": "Gueltat Sidi Saad",
        "postal_code": "",
        "lat": 34.2961,
        "lng": 1.94667
      },
      {
        "name": "Hadj Mechri",
        "name_ar": "الحاج مشري",
        "daira": "Hadj Mechri",
        "postal_code": "",
        "lat": 33.95713,
        "lng": 1.599207
      },
      {
        "name": "Hassi Delaa",
        "name_ar": "حاسي الدلاعة",
        "daira": "Hassi R'Mel",
        "postal_code": "03022",
        "lat": 33.41742,
        "lng": 3.55021
      },
      {
        "name": "Hassi R'mel",
        "name_ar": "حاسي الرمل",
        "daira": "Hassi R'Mel",
        "postal_code": "03004",
        "lat": 32.928,
        "lng": 3.271
      },
      {
        "name": "Kheneg",
        "name_ar": "الخنق",
        "daira": "Aïn Madhi",
        "postal_code": "03010",
        "lat": 33.744444,
        "lng": 2.794
      },
      {
        "name": "Ksar El Hirane",
        "name_ar": "قصر الحيران",
        "daira": "Ksar El Hirane",
        "postal_code": "03003",
        "lat": 33.788564,
        "lng": 3.140717
      },
      {
        "name": "Laghouat",
        "name_ar": "الأغواط",
        "daira": "Laghouat",
        "postal_code": "03000",
        "lat": 33.8,
        "lng": 2.875
      },
      {
        "name": "Oued M'zi",
        "name_ar": "وادي مزي",
        "daira": "Aflou",
        "postal_code": "",
        "lat": 33.92422,
        "lng": 2.4369
      },
      {
        "name": "Oued Morra",
        "name_ar": "وادي مرة",
        "daira": "Aflou",
        "postal_code": "",
        "lat": 34.166667,
        "lng": 2.316667
      },
      {
        "name": "Sebgag",
        "name_ar": "سبقاق",
        "daira": "El Ghicha",
        "postal_code": "",
        "lat": 34.02958,
        "lng": 1.92798
      },
      {
        "name": "Sidi Bouzid",
        "name_ar": "سيدي بوزيد",
        "daira": "Brida",
        "postal_code": "",
        "lat": 34.342777,
        "lng": 2.261389
      },
      {
        "name": "Sidi Makhlouf",
        "name_ar": "سيدي مخلوف",
        "daira": "Sidi Makhlouf",
        "postal_code": "03019",
        "lat": 34.12942,
        "lng": 3.01436
      },
      {
        "name": "Tadjemout",
        "name_ar": "تاجموت",
        "daira": "Aïn Madhi",
        "postal_code": "03007",
        "lat": 33.87729,
        "lng": 2.52113
      },
      {
        "name": "Tadjrouna",
        "name_ar": "تاجرونة",
        "daira": "Aïn Madhi",
        "postal_code": "03011",
        "lat": 33.503632,
        "lng": 2.101217
      },
      {
        "name": "Taouiala",
        "name_ar": "تاويالة",
        "daira": "Hadj Mechri",
        "postal_code": "",
        "lat": 33.87186,
        "lng": 1.8606
      }
    ]
  },
  {
    "code": "04",
    "name": "Oum El Bouaghi",
    "name_ar": "أم البواقي",
    "lat": 35.8775,
    "lng": 7.11361,
    "communes": [
      {
        "name": "Ain Babouche",
        "name_ar": "عين ببوش",
        "daira": "Aïn Babouche",
        "postal_code": "04020",
        "lat": 35.941111,
        "lng": 7.1875
      },
      {
        "name": "Ain Beida",
        "name_ar": "عين البيضاء",
        "daira": "Aïn Beïda",
        "postal_code": "04001",
        "lat": 35.798133,
        "lng": 7.392173
      },
      {
        "name": "Ain Diss",
        "name_ar": "عين الديس",
        "daira": "Aïn Babouche",
        "postal_code": "04025",
        "lat": 36.03,
        "lng": 7.8
      },
      {
        "name": "Ain Fekroun",
        "name_ar": "عين فكرون",
        "daira": "Aïn Fakroun",
        "postal_code": "04005",
        "lat": 35.9711,
        "lng": 6.8737
      },
      {
        "name": "Ain Kercha",
        "name_ar": "عين كرشة",
        "daira": "Aïn Kercha",
        "postal_code": "04006",
        "lat": 35.916667,
        "lng": 6.68333
      },
      {
        "name": "Ain M'lila",
        "name_ar": "عين مليلة",
        "daira": "Aïn M'lila",
        "postal_code": "04002",
        "lat": 36.03823,
        "lng": 6.57318
      },
      {
        "name": "Ain Zitoun",
        "name_ar": "عين الزيتون",
        "daira": "Oum El Bouaghi",
        "postal_code": "04023",
        "lat": 35.684444,
        "lng": 6.9403
      },
      {
        "name": "Behir Chergui",
        "name_ar": "بحير الشرقي",
        "daira": "Meskiana",
        "postal_code": "04026",
        "lat": 35.790804,
        "lng": 7.6833
      },
      {
        "name": "Berriche",
        "name_ar": "بريش",
        "daira": "Aïn Beïda",
        "postal_code": "04015",
        "lat": 35.795833,
        "lng": 7.37667
      },
      {
        "name": "Bir Chouhada",
        "name_ar": "بئر الشهداء",
        "daira": "Souk Naamane",
        "postal_code": "04021",
        "lat": 35.894444,
        "lng": 6.29
      },
      {
        "name": "Dhalaa",
        "name_ar": "الضلعة",
        "daira": "Dhalaa",
        "postal_code": "04008",
        "lat": 35.461111,
        "lng": 7.547222
      },
      {
        "name": "El Amiria",
        "name_ar": "العامرية",
        "daira": "Sigus",
        "postal_code": "04038",
        "lat": 36.111944,
        "lng": 6.8822
      },
      {
        "name": "El Belala",
        "name_ar": "البلالة",
        "daira": "Meskiana",
        "postal_code": "04044",
        "lat": 35.665278,
        "lng": 7.788333
      },
      {
        "name": "El Djazia",
        "name_ar": "الجازية",
        "daira": "Dhalaa",
        "postal_code": "04040",
        "lat": 35.663154,
        "lng": 7.507127
      },
      {
        "name": "El Fedjoudj Boughrara Sa",
        "name_ar": "الفجوج بوغرارة سعودي",
        "daira": "Aïn Fakroun",
        "postal_code": "04042",
        "lat": 35.70805,
        "lng": 6.816944
      },
      {
        "name": "El Harmilia",
        "name_ar": "الحرملية",
        "daira": "Aïn Kercha",
        "postal_code": "04032",
        "lat": 35.923532,
        "lng": 6.619263
      },
      {
        "name": "Fkirina",
        "name_ar": "فكيرينة",
        "daira": "Fkirina",
        "postal_code": "04013",
        "lat": 35.663889,
        "lng": 7.2989
      },
      {
        "name": "Hanchir Toumghani",
        "name_ar": "هنشير تومغني",
        "daira": "Aïn Kercha",
        "postal_code": "04012",
        "lat": 35.934722,
        "lng": 6.7808
      },
      {
        "name": "Ksar Sbahi",
        "name_ar": "قصر الصباحي",
        "daira": "Ksar Sbahi",
        "postal_code": "04018",
        "lat": 36.0833,
        "lng": 7.25
      },
      {
        "name": "Meskiana",
        "name_ar": "مسكيانة",
        "daira": "Meskiana",
        "postal_code": "04004",
        "lat": 35.631,
        "lng": 7.6669
      },
      {
        "name": "Oued Nini",
        "name_ar": "وادي نيني",
        "daira": "Fkirina",
        "postal_code": "04047",
        "lat": 35.5722,
        "lng": 7.298855
      },
      {
        "name": "Ouled Gacem",
        "name_ar": "أولاد قاسم",
        "daira": "Aïn M'lila",
        "postal_code": "04041",
        "lat": 36.034166,
        "lng": 6.6658
      },
      {
        "name": "Ouled Hamla",
        "name_ar": "أولاد حملة",
        "daira": "Aïn M'lila",
        "postal_code": "04019",
        "lat": 36.09042,
        "lng": 6.46483
      },
      {
        "name": "Ouled Zouai",
        "name_ar": "أولاد زواي",
        "daira": "Souk Naamane",
        "postal_code": "04039",
        "lat": 35.836111,
        "lng": 6.506667
      },
      {
        "name": "Oum El Bouaghi",
        "name_ar": "أم البواقي",
        "daira": "Oum El Bouaghi",
        "postal_code": "04000",
        "lat": 35.8706,
        "lng": 7.117
      },
      {
        "name": "Rahia",
        "name_ar": "الرحية",
        "daira": "Meskiana",
        "postal_code": "04045",
        "lat": 35.716667,
        "lng": 6.933333
      },
      {
        "name": "Sigus",
        "name_ar": "سيقوس",
        "daira": "Sigus",
        "postal_code": "04011",
        "lat": 36.12361,
        "lng": 6.770814
      },
      {
        "name": "Souk Naamane",
        "name_ar": "سوق نعمان",
        "daira": "Souk Naamane",
        "postal_code": "04010",
        "lat": 35.895833,
        "lng": 6.389444
      },
      {
        "name": "Zorg",
        "name_ar": "الزرق",
        "daira": "Aïn Beïda",
        "postal_code": "04024",
        "lat": 35.787778,
        "lng": 7.468055
      }
    ]
  },
  {
    "code": "05",
    "name": "Batna",
    "name_ar": "باتنة",
    "lat": 35.55,
    "lng": 6.16667,
    "communes": [
      {
        "name": "Ain Djasser",
        "name_ar": "عين جاسر",
        "daira": "Aïn Djasser",
        "postal_code": "05032",
        "lat": 35.830828,
        "lng": 6.004412
      },
      {
        "name": "Ain Touta",
        "name_ar": "عين التوتة",
        "daira": "Aïn Touta",
        "postal_code": "05002",
        "lat": 35.399109,
        "lng": 5.919839
      },
      {
        "name": "Ain Yagout",
        "name_ar": "عين ياقوت",
        "daira": "El Madher",
        "postal_code": "05031",
        "lat": 35.7746,
        "lng": 6.41644
      },
      {
        "name": "Arris",
        "name_ar": "أريس",
        "daira": "Arris",
        "postal_code": "05007",
        "lat": 35.25881,
        "lng": 6.34706
      },
      {
        "name": "Azil Abedelkader",
        "name_ar": "عزيل عبد القادر",
        "daira": "Azil Abdelkader",
        "postal_code": "",
        "lat": 35.3667,
        "lng": 5.1833
      },
      {
        "name": "Barika",
        "name_ar": "بريكة",
        "daira": "Barika",
        "postal_code": "",
        "lat": 35.3972,
        "lng": 5.3658
      },
      {
        "name": "Batna",
        "name_ar": "باتنة",
        "daira": "Batna",
        "postal_code": "05000",
        "lat": 35.55597,
        "lng": 6.174145
      },
      {
        "name": "Beni Foudhala El Hakania",
        "name_ar": "بني فضالة الحقانية",
        "daira": "Aïn Touta",
        "postal_code": "05141",
        "lat": 35.3525,
        "lng": 5.8667
      },
      {
        "name": "Bitam",
        "name_ar": "بيطام",
        "daira": "Barika",
        "postal_code": "",
        "lat": 35.0333,
        "lng": 5.3
      },
      {
        "name": "Boulhilat",
        "name_ar": "بولهيلات",
        "daira": "Chemora",
        "postal_code": "05062",
        "lat": 35.6752,
        "lng": 6.6625
      },
      {
        "name": "Boumagueur",
        "name_ar": "بومقر",
        "daira": "N'Gaous",
        "postal_code": "05057",
        "lat": 35.5052,
        "lng": 5.5525
      },
      {
        "name": "Boumia",
        "name_ar": "بومية",
        "daira": "El Madher",
        "postal_code": "05104",
        "lat": 35.677222,
        "lng": 6.480833
      },
      {
        "name": "Bouzina",
        "name_ar": "بوزينة",
        "daira": "Bouzina",
        "postal_code": "05041",
        "lat": 35.269895,
        "lng": 6.099698
      },
      {
        "name": "Chemora",
        "name_ar": "الشمرة",
        "daira": "Chemora",
        "postal_code": "05039",
        "lat": 35.66528,
        "lng": 6.5011
      },
      {
        "name": "Chir",
        "name_ar": "شير",
        "daira": "Teniet El Abed",
        "postal_code": "05108",
        "lat": 35.213563,
        "lng": 6
      },
      {
        "name": "Djerma",
        "name_ar": "جرمة",
        "daira": "El Madher",
        "postal_code": "05105",
        "lat": 35.685141,
        "lng": 6.301343
      },
      {
        "name": "Djezzar",
        "name_ar": "الجزار",
        "daira": "Seggana",
        "postal_code": "",
        "lat": 35.50956,
        "lng": 5.26679
      },
      {
        "name": "El Hassi",
        "name_ar": "الحاسي",
        "daira": "Aïn Djasser",
        "postal_code": "05116",
        "lat": 35.722778,
        "lng": 5.906111
      },
      {
        "name": "El Madher",
        "name_ar": "المعذر",
        "daira": "El Madher",
        "postal_code": "05015",
        "lat": 35.63121,
        "lng": 6.369152
      },
      {
        "name": "Fesdis",
        "name_ar": "فسديس",
        "daira": "Batna",
        "postal_code": "05077",
        "lat": 35.62,
        "lng": 6.27476
      },
      {
        "name": "Foum Toub",
        "name_ar": "فم الطوب",
        "daira": "Ichmoul",
        "postal_code": "05049",
        "lat": 35.405,
        "lng": 6.549721
      },
      {
        "name": "Ghassira",
        "name_ar": "غسيرة",
        "daira": "T'Kout",
        "postal_code": "05043",
        "lat": 35.2576,
        "lng": 6.20608
      },
      {
        "name": "Gosbat",
        "name_ar": "القصبات",
        "daira": "Ras El Aioun",
        "postal_code": "05068",
        "lat": 35.6667,
        "lng": 5.517
      },
      {
        "name": "Guigba",
        "name_ar": "القيقبة",
        "daira": "Ras El Aioun",
        "postal_code": "05067",
        "lat": 35.807778,
        "lng": 6
      },
      {
        "name": "Hidoussa",
        "name_ar": "حيدوسة",
        "daira": "Merouana",
        "postal_code": "05033",
        "lat": 35.6375,
        "lng": 5.9375
      },
      {
        "name": "Ichemoul",
        "name_ar": "إشمول",
        "daira": "Ichmoul",
        "postal_code": "05026",
        "lat": 35.310694,
        "lng": 6.50382
      },
      {
        "name": "Inoughissen",
        "name_ar": "إينوغيسن",
        "daira": "Ichmoul",
        "postal_code": "05083",
        "lat": 35.286388,
        "lng": 6.55
      },
      {
        "name": "Kimmel",
        "name_ar": "كيمل",
        "daira": "T'Kout",
        "postal_code": "05079",
        "lat": 35.3442,
        "lng": 6.471658
      },
      {
        "name": "Ksar Bellezma",
        "name_ar": "قصر بلزمة",
        "daira": "Merouana",
        "postal_code": "05047",
        "lat": 35.67649,
        "lng": 5.9033
      },
      {
        "name": "Larbaa",
        "name_ar": "لارباع",
        "daira": "Bouzina",
        "postal_code": "",
        "lat": 35.403889,
        "lng": 6.11124
      },
      {
        "name": "Lazrou",
        "name_ar": "لازرو",
        "daira": "Seriana",
        "postal_code": "05117",
        "lat": 35.7,
        "lng": 6.2167
      },
      {
        "name": "Lemcene",
        "name_ar": "لمسان",
        "daira": "Ouled Si Slimane",
        "postal_code": "",
        "lat": 35.65611,
        "lng": 5.79667
      },
      {
        "name": "M Doukal",
        "name_ar": "إمدوكل",
        "daira": "Barika",
        "postal_code": "",
        "lat": 35.121,
        "lng": 5.485278
      },
      {
        "name": "Maafa",
        "name_ar": "معافة",
        "daira": "Aïn Touta",
        "postal_code": "05123",
        "lat": 35.266667,
        "lng": 5.919839
      },
      {
        "name": "Menaa",
        "name_ar": "منعة",
        "daira": "Menaa",
        "postal_code": "05012",
        "lat": 35.1777,
        "lng": 6.006775
      },
      {
        "name": "Merouana",
        "name_ar": "مروانة",
        "daira": "Merouana",
        "postal_code": "05013",
        "lat": 35.63106,
        "lng": 5.91186
      },
      {
        "name": "N Gaous",
        "name_ar": "نقاوس",
        "daira": "N'Gaous",
        "postal_code": "05004",
        "lat": 35.561836,
        "lng": 5.610924
      },
      {
        "name": "Oued Chaaba",
        "name_ar": "وادي الشعبة",
        "daira": "Batna",
        "postal_code": "05054",
        "lat": 35.504722,
        "lng": 6.07784
      },
      {
        "name": "Oued El Ma",
        "name_ar": "وادي الماء",
        "daira": "Merouana",
        "postal_code": "05016",
        "lat": 35.645278,
        "lng": 5.994722
      },
      {
        "name": "Oued Taga",
        "name_ar": "وادي الطاقة",
        "daira": "Teniet El Abed",
        "postal_code": "05036",
        "lat": 35.4205,
        "lng": 6.23
      },
      {
        "name": "Ouled Ammar",
        "name_ar": "أولاد عمار",
        "daira": "Azil Abdelkader",
        "postal_code": "",
        "lat": 35.15,
        "lng": 5.34
      },
      {
        "name": "Ouled Aouf",
        "name_ar": "أولاد عوف",
        "daira": "Aïn Touta",
        "postal_code": "05133",
        "lat": 35.455556,
        "lng": 5.756944
      },
      {
        "name": "Ouled Fadel",
        "name_ar": "أولاد فاضل",
        "daira": "Timgad",
        "postal_code": "05063",
        "lat": 35.4843,
        "lng": 6.6247
      },
      {
        "name": "Ouled Sellem",
        "name_ar": "أولاد سلام",
        "daira": "Ras El Aioun",
        "postal_code": "05044",
        "lat": 35.841186,
        "lng": 5.8822
      },
      {
        "name": "Ouled Si Slimane",
        "name_ar": "أولاد سي سليمان",
        "daira": "Ouled Si Slimane",
        "postal_code": "05066",
        "lat": 35.610833,
        "lng": 5.632777
      },
      {
        "name": "Ouyoun El Assafir",
        "name_ar": "عيون العصافير",
        "daira": "Tazoult",
        "postal_code": "05069",
        "lat": 35.552203,
        "lng": 6.343878
      },
      {
        "name": "Rahbat",
        "name_ar": "الرحبات",
        "daira": "Ras El Aioun",
        "postal_code": "05091",
        "lat": 35.5333,
        "lng": 5.65
      },
      {
        "name": "Ras El Aioun",
        "name_ar": "رأس العيون",
        "daira": "Ras El Aioun",
        "postal_code": "05009",
        "lat": 35.675,
        "lng": 5.65
      },
      {
        "name": "Sefiane",
        "name_ar": "سفيان",
        "daira": "N'Gaous",
        "postal_code": "05064",
        "lat": 35.4414,
        "lng": 5.5581
      },
      {
        "name": "Seggana",
        "name_ar": "سقانة",
        "daira": "Seggana",
        "postal_code": "",
        "lat": 35.365555,
        "lng": 5.575
      },
      {
        "name": "Seriana",
        "name_ar": "سريانة",
        "daira": "Seriana",
        "postal_code": "05025",
        "lat": 35.691666,
        "lng": 6.18639
      },
      {
        "name": "T Kout",
        "name_ar": "تكوت",
        "daira": "T'Kout",
        "postal_code": "05020",
        "lat": 35.3339,
        "lng": 6.30861
      },
      {
        "name": "Talkhamt",
        "name_ar": "تالخمت",
        "daira": "Ras El Aioun",
        "postal_code": "05051",
        "lat": 35.665278,
        "lng": 5.8667
      },
      {
        "name": "Taxlent",
        "name_ar": "تاكسلانت",
        "daira": "Ouled Si Slimane",
        "postal_code": "05055",
        "lat": 35.5333,
        "lng": 5.81667
      },
      {
        "name": "Tazoult",
        "name_ar": "تازولت",
        "daira": "Tazoult",
        "postal_code": "05011",
        "lat": 35.489188,
        "lng": 6.254311
      },
      {
        "name": "Teniet El Abed",
        "name_ar": "ثنية العابد",
        "daira": "Teniet El Abed",
        "postal_code": "05035",
        "lat": 35.24695,
        "lng": 6.19062
      },
      {
        "name": "Tighanimine",
        "name_ar": "تيغانمين",
        "daira": "Arris",
        "postal_code": "05060",
        "lat": 35.195553,
        "lng": 6.25
      },
      {
        "name": "Tigharghar",
        "name_ar": "تغرغار",
        "daira": "Menaa",
        "postal_code": "05059",
        "lat": 35.160278,
        "lng": 6.0347
      },
      {
        "name": "Tilatou",
        "name_ar": "تيلاطو",
        "daira": "Tilatou",
        "postal_code": "",
        "lat": 35.329167,
        "lng": 5.8667
      },
      {
        "name": "Timgad",
        "name_ar": "تيمقاد",
        "daira": "Timgad",
        "postal_code": "05023",
        "lat": 35.485165,
        "lng": 6.4686
      },
      {
        "name": "Zanet El Beida",
        "name_ar": "زانة البيضاء",
        "daira": "Seriana",
        "postal_code": "05071",
        "lat": 35.809722,
        "lng": 6.08512
      }
    ]
  },
  {
    "code": "06",
    "name": "Béjaïa",
    "name_ar": "بجاية",
    "lat": 36.75111,
    "lng": 5.06417,
    "communes": [
      {
        "name": "Adekar",
        "name_ar": "أدكار",
        "daira": "Adekar",
        "postal_code": "06021",
        "lat": 36.683333,
        "lng": 4.6667
      },
      {
        "name": "Ait R'zine",
        "name_ar": "أيت رزين",
        "daira": "Ighil Ali",
        "postal_code": "06013",
        "lat": 36.370347,
        "lng": 4.4868
      },
      {
        "name": "Ait-Smail",
        "name_ar": "أيت إسماعيل",
        "daira": "Darguina",
        "postal_code": "06044",
        "lat": 36.7333,
        "lng": 4.85
      },
      {
        "name": "Akbou",
        "name_ar": "أقبو",
        "daira": "Akbou",
        "postal_code": "06001",
        "lat": 36.4575,
        "lng": 4.53494
      },
      {
        "name": "Akfadou",
        "name_ar": "أكفادو",
        "daira": "Chemini",
        "postal_code": "06142",
        "lat": 36.633333,
        "lng": 4.5895
      },
      {
        "name": "Amalou",
        "name_ar": "أمالو",
        "daira": "Seddouk",
        "postal_code": "06034",
        "lat": 36.477777,
        "lng": 4.633333
      },
      {
        "name": "Amizour",
        "name_ar": "أميزور",
        "daira": "Amizour",
        "postal_code": "06008",
        "lat": 36.64022,
        "lng": 4.9013
      },
      {
        "name": "Aokas",
        "name_ar": "أوقاس",
        "daira": "Aokas",
        "postal_code": "06007",
        "lat": 36.6333,
        "lng": 5.25
      },
      {
        "name": "Barbacha",
        "name_ar": "برباشة",
        "daira": "Barbacha",
        "postal_code": "06009",
        "lat": 36.5667,
        "lng": 4.96667
      },
      {
        "name": "Bejaia",
        "name_ar": "بجاية",
        "daira": "Béjaïa",
        "postal_code": "06000",
        "lat": 36.75089,
        "lng": 5.056733
      },
      {
        "name": "Beni Djellil",
        "name_ar": "بني جليل",
        "daira": "Amizour",
        "postal_code": "06067",
        "lat": 36.572927,
        "lng": 4.8108
      },
      {
        "name": "Beni K'sila",
        "name_ar": "بني كسيلة",
        "daira": "Adekar",
        "postal_code": "06106",
        "lat": 36.839681,
        "lng": 4.707062
      },
      {
        "name": "Beni-Mallikeche",
        "name_ar": "بني مليكش",
        "daira": "Beni Maouche",
        "postal_code": "06039",
        "lat": 36.433333,
        "lng": 4.671389
      },
      {
        "name": "Benimaouche",
        "name_ar": "بني معوش",
        "daira": "Timezrit",
        "postal_code": "06024",
        "lat": 36.47833,
        "lng": 4.63833
      },
      {
        "name": "Boudjellil",
        "name_ar": "بو جليل",
        "daira": "Tazmalt",
        "postal_code": "06018",
        "lat": 36.334,
        "lng": 4.414167
      },
      {
        "name": "Bouhamza",
        "name_ar": "بوحمزة",
        "daira": "Seddouk",
        "postal_code": "06031",
        "lat": 36.489722,
        "lng": 4.6064
      },
      {
        "name": "Boukhelifa",
        "name_ar": "بوخليفة",
        "daira": "Tichy",
        "postal_code": "06059",
        "lat": 36.5831,
        "lng": 4.9667
      },
      {
        "name": "Chellata",
        "name_ar": "شلاطة",
        "daira": "Akbou",
        "postal_code": "06052",
        "lat": 36.51355,
        "lng": 4.510886
      },
      {
        "name": "Chemini",
        "name_ar": "شميني",
        "daira": "Chemini",
        "postal_code": "06022",
        "lat": 36.594402,
        "lng": 4.621041
      },
      {
        "name": "Darguina",
        "name_ar": "درقينة",
        "daira": "Darguina",
        "postal_code": "06016",
        "lat": 36.6344,
        "lng": 5.375595
      },
      {
        "name": "Dra El Caid",
        "name_ar": "ذراع القايد",
        "daira": "Kherrata",
        "postal_code": "06070",
        "lat": 36.429534,
        "lng": 5.247552
      },
      {
        "name": "El Kseur",
        "name_ar": "القصر",
        "daira": "El Kseur",
        "postal_code": "06003",
        "lat": 36.684389,
        "lng": 4.852222
      },
      {
        "name": "Fenaia Il Maten",
        "name_ar": "فناية الماثن",
        "daira": "El Kseur",
        "postal_code": "06041",
        "lat": 36.671667,
        "lng": 4.790555
      },
      {
        "name": "Feraoun",
        "name_ar": "فرعون",
        "daira": "Amizour",
        "postal_code": "06033",
        "lat": 36.556944,
        "lng": 4.85454
      },
      {
        "name": "Ighil-Ali",
        "name_ar": "إغيل علي",
        "daira": "Ighil Ali",
        "postal_code": "06014",
        "lat": 36.337986,
        "lng": 4.470213
      },
      {
        "name": "Ighram",
        "name_ar": "اغرم",
        "daira": "Akbou",
        "postal_code": "06057",
        "lat": 36.46295,
        "lng": 4.505
      },
      {
        "name": "Kendira",
        "name_ar": "كنديرة",
        "daira": "Barbacha",
        "postal_code": "06032",
        "lat": 36.653,
        "lng": 5.0173
      },
      {
        "name": "Kherrata",
        "name_ar": "خراطة",
        "daira": "Kherrata",
        "postal_code": "06004",
        "lat": 36.492724,
        "lng": 5.278
      },
      {
        "name": "Leflaye",
        "name_ar": "الفلاي",
        "daira": "Sidi-Aïch",
        "postal_code": "06043",
        "lat": 36.609167,
        "lng": 4.8814
      },
      {
        "name": "M'cisna",
        "name_ar": "مسيسنة",
        "daira": "Seddouk",
        "postal_code": "06038",
        "lat": 36.563407,
        "lng": 4.710368
      },
      {
        "name": "Melbou",
        "name_ar": "مالبو",
        "daira": "Souk El Ténine",
        "postal_code": "06076",
        "lat": 36.671389,
        "lng": 5.360759
      },
      {
        "name": "Oued Ghir",
        "name_ar": "وادي غير",
        "daira": "Béjaïa",
        "postal_code": "06017",
        "lat": 36.710277,
        "lng": 4.983333
      },
      {
        "name": "Ouzellaguen",
        "name_ar": "أوزلاقن",
        "daira": "Ouzellaguen",
        "postal_code": "06010",
        "lat": 36.54203,
        "lng": 4.612778
      },
      {
        "name": "Seddouk",
        "name_ar": "صدوق",
        "daira": "Seddouk",
        "postal_code": "06011",
        "lat": 36.547,
        "lng": 4.70778
      },
      {
        "name": "Sidi Ayad",
        "name_ar": "سيدي عياد",
        "daira": "Sidi-Aïch",
        "postal_code": "06085",
        "lat": 36.61667,
        "lng": 4.75
      },
      {
        "name": "Sidi-Aich",
        "name_ar": "سيدي عيش",
        "daira": "Sidi-Aïch",
        "postal_code": "06005",
        "lat": 36.612944,
        "lng": 4.688298
      },
      {
        "name": "Smaoun",
        "name_ar": "سمعون",
        "daira": "Amizour",
        "postal_code": "06020",
        "lat": 36.6389,
        "lng": 4.8
      },
      {
        "name": "Souk El Tenine",
        "name_ar": "سوق لإثنين",
        "daira": "Souk El Ténine",
        "postal_code": "06012",
        "lat": 36.625652,
        "lng": 5.336022
      },
      {
        "name": "Souk Oufella",
        "name_ar": "سوق اوفلا",
        "daira": "Chemini",
        "postal_code": "06036",
        "lat": 36.606111,
        "lng": 4.6389
      },
      {
        "name": "Tala Hamza",
        "name_ar": "تالة حمزة",
        "daira": "Tichy",
        "postal_code": "06066",
        "lat": 36.68768,
        "lng": 5.007845
      },
      {
        "name": "Tamokra",
        "name_ar": "تامقرة",
        "daira": "Akbou",
        "postal_code": "06109",
        "lat": 36.3932,
        "lng": 4.6645
      },
      {
        "name": "Tamridjet",
        "name_ar": "تامريجت",
        "daira": "Souk El Ténine",
        "postal_code": "06077",
        "lat": 36.583312,
        "lng": 5.425376
      },
      {
        "name": "Taourit Ighil",
        "name_ar": "تاوريرت إغيل",
        "daira": "Adekar",
        "postal_code": "06035",
        "lat": 36.720216,
        "lng": 4.7381
      },
      {
        "name": "Taskriout",
        "name_ar": "تاسكريوت",
        "daira": "Darguina",
        "postal_code": "06015",
        "lat": 36.56667,
        "lng": 5.2733
      },
      {
        "name": "Tazmalt",
        "name_ar": "تازمالت",
        "daira": "Tazmalt",
        "postal_code": "06006",
        "lat": 36.387804,
        "lng": 4.407921
      },
      {
        "name": "Tibane",
        "name_ar": "طيبان",
        "daira": "Chemini",
        "postal_code": "06087",
        "lat": 36.613585,
        "lng": 4.651185
      },
      {
        "name": "Tichy",
        "name_ar": "تيشي",
        "daira": "Tichy",
        "postal_code": "06023",
        "lat": 36.6961,
        "lng": 5.155088
      },
      {
        "name": "Tifra",
        "name_ar": "تيفرة",
        "daira": "Sidi-Aïch",
        "postal_code": "06028",
        "lat": 36.666736,
        "lng": 4.69635
      },
      {
        "name": "Timezrit",
        "name_ar": "تيمزريت",
        "daira": "Timezrit",
        "postal_code": "06019",
        "lat": 36.615556,
        "lng": 4.7667
      },
      {
        "name": "Tinebdar",
        "name_ar": "تينبدار",
        "daira": "Sidi-Aïch",
        "postal_code": "06037",
        "lat": 36.62528,
        "lng": 4.68111
      },
      {
        "name": "Tizi-N'berber",
        "name_ar": "تيزي نبربر",
        "daira": "Aokas",
        "postal_code": "06060",
        "lat": 36.613462,
        "lng": 5.217632
      },
      {
        "name": "Toudja",
        "name_ar": "توجة",
        "daira": "El Kseur",
        "postal_code": "06030",
        "lat": 36.75,
        "lng": 4.892228
      }
    ]
  },
  {
    "code": "07",
    "name": "Biskra",
    "name_ar": "بسكرة",
    "lat": 34.85,
    "lng": 5.733,
    "communes": [
      {
        "name": "Ain Naga",
        "name_ar": "عين الناقة",
        "daira": "Sidi Okba",
        "postal_code": "07039",
        "lat": 34.68762,
        "lng": 6.09419
      },
      {
        "name": "Ain Zaatout",
        "name_ar": "عين زعطوط",
        "daira": "El Kantara",
        "postal_code": "",
        "lat": 34.908056,
        "lng": 5.83
      },
      {
        "name": "Biskra",
        "name_ar": "بسكرة",
        "daira": "Biskra",
        "postal_code": "07000",
        "lat": 34.8,
        "lng": 5.751048
      },
      {
        "name": "Bordj Ben Azzouz",
        "name_ar": "برج بن عزوز",
        "daira": "Tolga",
        "postal_code": "07021",
        "lat": 34.697222,
        "lng": 5.362777
      },
      {
        "name": "Bouchakroun",
        "name_ar": "بوشقرون",
        "daira": "Tolga",
        "postal_code": "07022",
        "lat": 34.809167,
        "lng": 5.341111
      },
      {
        "name": "Branis",
        "name_ar": "برانيس",
        "daira": "Djemorah",
        "postal_code": "",
        "lat": 34.99338,
        "lng": 5.775
      },
      {
        "name": "Chetma",
        "name_ar": "شتمة",
        "daira": "Sidi Okba",
        "postal_code": "07024",
        "lat": 34.801667,
        "lng": 5.659722
      },
      {
        "name": "Djemorah",
        "name_ar": "جمورة",
        "daira": "Djemorah",
        "postal_code": "",
        "lat": 35.102684,
        "lng": 5.864722
      },
      {
        "name": "El Feidh",
        "name_ar": "الفيض",
        "daira": "Zeribet El Oued",
        "postal_code": "07026",
        "lat": 34.4669,
        "lng": 6.535645
      },
      {
        "name": "El Ghrous",
        "name_ar": "الغروس",
        "daira": "Foughala",
        "postal_code": "07027",
        "lat": 34.723393,
        "lng": 5.285277
      },
      {
        "name": "El Hadjab",
        "name_ar": "الحاجب",
        "daira": "Biskra",
        "postal_code": "07037",
        "lat": 34.79027,
        "lng": 5.596944
      },
      {
        "name": "El Haouch",
        "name_ar": "الحوش",
        "daira": "Sidi Okba",
        "postal_code": "07028",
        "lat": 34.8667,
        "lng": 6.025574
      },
      {
        "name": "El Kantara",
        "name_ar": "القنطرة",
        "daira": "El Kantara",
        "postal_code": "",
        "lat": 35.192365,
        "lng": 5.666831
      },
      {
        "name": "El Outaya",
        "name_ar": "الوطاية",
        "daira": "El Outaya",
        "postal_code": "",
        "lat": 35.03412,
        "lng": 5.59517
      },
      {
        "name": "Foughala",
        "name_ar": "فوغالة",
        "daira": "Foughala",
        "postal_code": "07031",
        "lat": 34.732606,
        "lng": 5.316667
      },
      {
        "name": "Khenguet Sidi Nadji",
        "name_ar": "خنقة سيدي ناجي",
        "daira": "Zeribet El Oued",
        "postal_code": "07032",
        "lat": 34.821721,
        "lng": 6.695894
      },
      {
        "name": "Lichana",
        "name_ar": "ليشانة",
        "daira": "Tolga",
        "postal_code": "07009",
        "lat": 34.71753,
        "lng": 5.428985
      },
      {
        "name": "Lioua",
        "name_ar": "ليوة",
        "daira": "Ourlal",
        "postal_code": "07033",
        "lat": 34.63099,
        "lng": 5.4
      },
      {
        "name": "M'chouneche",
        "name_ar": "مشونش",
        "daira": "M'Chouneche",
        "postal_code": "07010",
        "lat": 34.9497,
        "lng": 6.0039
      },
      {
        "name": "M'lili",
        "name_ar": "مليلي",
        "daira": "Ourlal",
        "postal_code": "07068",
        "lat": 34.805833,
        "lng": 5.554247
      },
      {
        "name": "Mekhadma",
        "name_ar": "مخادمة",
        "daira": "Ourlal",
        "postal_code": "07034",
        "lat": 34.64779,
        "lng": 5.867778
      },
      {
        "name": "Meziraa",
        "name_ar": "المزيرعة",
        "daira": "Zeribet El Oued",
        "postal_code": "07043",
        "lat": 34.72167,
        "lng": 6.29278
      },
      {
        "name": "Oumache",
        "name_ar": "أوماش",
        "daira": "Ourlal",
        "postal_code": "07035",
        "lat": 34.69292,
        "lng": 5.6883
      },
      {
        "name": "Ourlal",
        "name_ar": "أورلال",
        "daira": "Ourlal",
        "postal_code": "07011",
        "lat": 34.655556,
        "lng": 5.525895
      },
      {
        "name": "Sidi Okba",
        "name_ar": "سيدي عقبة",
        "daira": "Sidi Okba",
        "postal_code": "07005",
        "lat": 34.74512,
        "lng": 5.9
      },
      {
        "name": "Tolga",
        "name_ar": "طولقة",
        "daira": "Tolga",
        "postal_code": "07003",
        "lat": 34.7214,
        "lng": 5.380213
      },
      {
        "name": "Zeribet El Oued",
        "name_ar": "زريبة الوادي",
        "daira": "Zeribet El Oued",
        "postal_code": "07012",
        "lat": 34.683,
        "lng": 6.511
      }
    ]
  },
  {
    "code": "08",
    "name": "Béchar",
    "name_ar": "بشار",
    "lat": 31.617,
    "lng": -2.217,
    "communes": [
      {
        "name": "Abadla",
        "name_ar": "العبادلة",
        "daira": "Abadla",
        "postal_code": "08003",
        "lat": 31.019,
        "lng": -2.72387
      },
      {
        "name": "Bechar",
        "name_ar": "بشار",
        "daira": "Béchar",
        "postal_code": "08000",
        "lat": 31.61667,
        "lng": -2.21667
      },
      {
        "name": "Beni-Ounif",
        "name_ar": "بني ونيف",
        "daira": "Beni Ounif",
        "postal_code": "08010",
        "lat": 32.049243,
        "lng": -1.2514
      },
      {
        "name": "Boukais",
        "name_ar": "بوكايس",
        "daira": "Lahmar",
        "postal_code": "08034",
        "lat": 31.923333,
        "lng": -2.46361
      },
      {
        "name": "Erg-Ferradj",
        "name_ar": "عرق فراج",
        "daira": "Abadla",
        "postal_code": "08023",
        "lat": 31.0347,
        "lng": -2.791389
      },
      {
        "name": "Kenadsa",
        "name_ar": "القنادسة",
        "daira": "Kenadsa",
        "postal_code": "08011",
        "lat": 31.5544,
        "lng": -2.4327
      },
      {
        "name": "Lahmar",
        "name_ar": "لحمر",
        "daira": "Lahmar",
        "postal_code": "08026",
        "lat": 31.931388,
        "lng": -2.2597
      },
      {
        "name": "Machraa-Houari-Boumediene",
        "name_ar": "مشرع هواري بومدين",
        "daira": "Abadla",
        "postal_code": "08027",
        "lat": 30.932247,
        "lng": -2.737545
      },
      {
        "name": "Meridja",
        "name_ar": "المريجة",
        "daira": "Kenadsa",
        "postal_code": "08041",
        "lat": 31.55,
        "lng": -2.95
      },
      {
        "name": "Mogheul",
        "name_ar": "موغل",
        "daira": "Lahmar",
        "postal_code": "08042",
        "lat": 32.0225,
        "lng": -2.222725
      },
      {
        "name": "Taghit",
        "name_ar": "تاغيت",
        "daira": "Taghit",
        "postal_code": "08030",
        "lat": 30.920106,
        "lng": -2.032217
      }
    ]
  },
  {
    "code": "09",
    "name": "Blida",
    "name_ar": "البليدة",
    "lat": 36.46861,
    "lng": 2.83194,
    "communes": [
      {
        "name": "Ain Romana",
        "name_ar": "عين الرمانة",
        "daira": "Mouzaïa",
        "postal_code": "09023",
        "lat": 36.396357,
        "lng": 2.648709
      },
      {
        "name": "Beni Mered",
        "name_ar": "بني مراد",
        "daira": "Ouled Yaïch",
        "postal_code": "09003",
        "lat": 36.52389,
        "lng": 2.86131
      },
      {
        "name": "Beni-Tamou",
        "name_ar": "بني تامو",
        "daira": "Oued Alleug",
        "postal_code": "09024",
        "lat": 36.536389,
        "lng": 2.8161
      },
      {
        "name": "Benkhelil",
        "name_ar": "بن خليل",
        "daira": "Oued Alleug",
        "postal_code": "09025",
        "lat": 36.620278,
        "lng": 2.876389
      },
      {
        "name": "Blida",
        "name_ar": "البليدة",
        "daira": "Blida",
        "postal_code": "09000",
        "lat": 36.47004,
        "lng": 2.8319
      },
      {
        "name": "Bouarfa",
        "name_ar": "بوعرفة",
        "daira": "Blida",
        "postal_code": "09019",
        "lat": 36.466944,
        "lng": 2.816389
      },
      {
        "name": "Boufarik",
        "name_ar": "بوفاريك",
        "daira": "Boufarik",
        "postal_code": "09001",
        "lat": 36.57413,
        "lng": 2.910833
      },
      {
        "name": "Bougara",
        "name_ar": "بوقرة",
        "daira": "Bougara",
        "postal_code": "09008",
        "lat": 36.54,
        "lng": 3.081
      },
      {
        "name": "Bouinan",
        "name_ar": "بوعينان",
        "daira": "Bouinan",
        "postal_code": "09020",
        "lat": 36.53167,
        "lng": 2.99194
      },
      {
        "name": "Chebli",
        "name_ar": "الشبلي",
        "daira": "Bouinan",
        "postal_code": "09009",
        "lat": 36.567222,
        "lng": 3.008518
      },
      {
        "name": "Chiffa",
        "name_ar": "الشفة",
        "daira": "Mouzaïa",
        "postal_code": "09010",
        "lat": 36.4669,
        "lng": 2.75
      },
      {
        "name": "Chrea",
        "name_ar": "الشريعة",
        "daira": "Ouled Yaïch",
        "postal_code": "09027",
        "lat": 36.425556,
        "lng": 2.876667
      },
      {
        "name": "Djebabra",
        "name_ar": "جبابرة",
        "daira": "Meftah",
        "postal_code": "09028",
        "lat": 36.584167,
        "lng": 3.268903
      },
      {
        "name": "El-Affroun",
        "name_ar": "العفرون",
        "daira": "El Affroun",
        "postal_code": "09011",
        "lat": 36.4701,
        "lng": 2.625
      },
      {
        "name": "Guerrouaou",
        "name_ar": "قرواو",
        "daira": "Boufarik",
        "postal_code": "09029",
        "lat": 36.516667,
        "lng": 2.8844
      },
      {
        "name": "Hammam Elouane",
        "name_ar": "حمام ملوان",
        "daira": "Bougara",
        "postal_code": "09030",
        "lat": 36.486667,
        "lng": 3.045
      },
      {
        "name": "Larbaa",
        "name_ar": "الأربعاء",
        "daira": "Larbaâ",
        "postal_code": "09002",
        "lat": 36.565278,
        "lng": 3.153933
      },
      {
        "name": "Meftah",
        "name_ar": "مفتاح",
        "daira": "Meftah",
        "postal_code": "09012",
        "lat": 36.6204,
        "lng": 3.22248
      },
      {
        "name": "Mouzaia",
        "name_ar": "موزاية",
        "daira": "Mouzaïa",
        "postal_code": "09013",
        "lat": 36.4669,
        "lng": 2.6899
      },
      {
        "name": "Oued Djer",
        "name_ar": "وادي جر",
        "daira": "El Affroun",
        "postal_code": "09032",
        "lat": 36.420146,
        "lng": 2.549511
      },
      {
        "name": "Oued El Alleug",
        "name_ar": "وادي العلايق",
        "daira": "Oued Alleug",
        "postal_code": "09014",
        "lat": 36.55528,
        "lng": 2.79028
      },
      {
        "name": "Ouled Slama",
        "name_ar": "اولاد سلامة",
        "daira": "Bougara",
        "postal_code": "09033",
        "lat": 36.548333,
        "lng": 3.11
      },
      {
        "name": "Ouled Yaich",
        "name_ar": "أولاد يعيش",
        "daira": "Ouled Yaïch",
        "postal_code": "09015",
        "lat": 36.50393,
        "lng": 2.8619
      },
      {
        "name": "Souhane",
        "name_ar": "صوحان",
        "daira": "Larbaâ",
        "postal_code": "09034",
        "lat": 36.532916,
        "lng": 3.248306
      },
      {
        "name": "Soumaa",
        "name_ar": "الصومعة",
        "daira": "Boufarik",
        "postal_code": "09022",
        "lat": 36.51833,
        "lng": 2.905278
      }
    ]
  },
  {
    "code": "10",
    "name": "Bouira",
    "name_ar": "البويرة",
    "lat": 36.38,
    "lng": 3.90139,
    "communes": [
      {
        "name": "Aghbalou",
        "name_ar": "أغبالو",
        "daira": "M'Chedallah",
        "postal_code": "10007",
        "lat": 36.371392,
        "lng": 4.225
      },
      {
        "name": "Ahl El Ksar",
        "name_ar": "أهل القصر",
        "daira": "Bechloul",
        "postal_code": "10008",
        "lat": 36.2549,
        "lng": 4.03944
      },
      {
        "name": "Ain El Hadjar",
        "name_ar": "عين الحجر",
        "daira": "Aïn Bessem",
        "postal_code": "10031",
        "lat": 36.33889,
        "lng": 3.806389
      },
      {
        "name": "Ain Laloui",
        "name_ar": "عين العلوي",
        "daira": "Aïn Bessem",
        "postal_code": "10032",
        "lat": 36.316667,
        "lng": 3.75
      },
      {
        "name": "Ain Turk",
        "name_ar": "عين الترك",
        "daira": "Bouira",
        "postal_code": "10033",
        "lat": 36.393333,
        "lng": 3.824722
      },
      {
        "name": "Ain-Bessem",
        "name_ar": "عين بسام",
        "daira": "Aïn Bessem",
        "postal_code": "10005",
        "lat": 36.296667,
        "lng": 3.67
      },
      {
        "name": "Ait Laaziz",
        "name_ar": "أيت لعزيز",
        "daira": "Bouira",
        "postal_code": "10034",
        "lat": 36.442893,
        "lng": 3.90864
      },
      {
        "name": "Aomar",
        "name_ar": "أعمر",
        "daira": "Kadiria",
        "postal_code": "10010",
        "lat": 36.4925,
        "lng": 3.794
      },
      {
        "name": "Ath Mansour",
        "name_ar": "آث منصور",
        "daira": "M'Chedallah",
        "postal_code": "10011",
        "lat": 36.330823,
        "lng": 4.301147
      },
      {
        "name": "Bechloul",
        "name_ar": "بشلول",
        "daira": "Bechloul",
        "postal_code": "10012",
        "lat": 36.316667,
        "lng": 4.075
      },
      {
        "name": "Bir Ghbalou",
        "name_ar": "بئر غبالو",
        "daira": "Bir Ghbalou",
        "postal_code": "10013",
        "lat": 36.264167,
        "lng": 3.7224
      },
      {
        "name": "Bordj Okhriss",
        "name_ar": "برج أوخريص",
        "daira": "Bordj Okhriss",
        "postal_code": "10014",
        "lat": 36.083333,
        "lng": 3.974444
      },
      {
        "name": "Bouderbala",
        "name_ar": "بودربالة",
        "daira": "Lakhdaria",
        "postal_code": "10016",
        "lat": 36.58,
        "lng": 3.5089
      },
      {
        "name": "Bouira",
        "name_ar": "البويرة",
        "daira": "Bouira",
        "postal_code": "10000",
        "lat": 36.37763,
        "lng": 3.896235
      },
      {
        "name": "Boukram",
        "name_ar": "بوكرم",
        "daira": "Lakhdaria",
        "postal_code": "10054",
        "lat": 36.5261,
        "lng": 3.36604
      },
      {
        "name": "Chorfa",
        "name_ar": "شرفة",
        "daira": "M'Chedallah",
        "postal_code": "10019",
        "lat": 36.36505,
        "lng": 4.323611
      },
      {
        "name": "Dechmia",
        "name_ar": "الدشمية",
        "daira": "Sour El Ghozlane",
        "postal_code": "10057",
        "lat": 36.13,
        "lng": 3.5767
      },
      {
        "name": "Dirah",
        "name_ar": "ديرة",
        "daira": "Sour El Ghozlane",
        "postal_code": "10020",
        "lat": 36.0003,
        "lng": 3.65992
      },
      {
        "name": "Djebahia",
        "name_ar": "جباحية",
        "daira": "Kadiria",
        "postal_code": "10036",
        "lat": 36.4764,
        "lng": 3.7588
      },
      {
        "name": "El Adjiba",
        "name_ar": "العجيبة",
        "daira": "Bechloul",
        "postal_code": "10021",
        "lat": 36.374997,
        "lng": 4.161614
      },
      {
        "name": "El Asnam",
        "name_ar": "الأسنام",
        "daira": "Bechloul",
        "postal_code": "10022",
        "lat": 36.3206,
        "lng": 4.013889
      },
      {
        "name": "El Hachimia",
        "name_ar": "الهاشمية",
        "daira": "El Hachimia",
        "postal_code": "10023",
        "lat": 36.24071,
        "lng": 3.8161
      },
      {
        "name": "El Khabouzia",
        "name_ar": "الخبوزية",
        "daira": "Bir Ghbalou",
        "postal_code": "10038",
        "lat": 36.3159,
        "lng": 3.600833
      },
      {
        "name": "El-Hakimia",
        "name_ar": "الحاكمية",
        "daira": "Sour El Ghozlane",
        "postal_code": "10058",
        "lat": 36.091492,
        "lng": 3.7806
      },
      {
        "name": "El-Mokrani",
        "name_ar": "المقراني",
        "daira": "Souk El Khemis",
        "postal_code": "10060",
        "lat": 36.42889,
        "lng": 3.60375
      },
      {
        "name": "Guerrouma",
        "name_ar": "قرومة",
        "daira": "Lakhdaria",
        "postal_code": "10037",
        "lat": 36.46305,
        "lng": 3.429645
      },
      {
        "name": "Hadjera Zerga",
        "name_ar": "الحجرة الزرقاء",
        "daira": "Bordj Okhriss",
        "postal_code": "10065",
        "lat": 35.957778,
        "lng": 3.849444
      },
      {
        "name": "Haizer",
        "name_ar": "حيزر",
        "daira": "Haizer",
        "postal_code": "10024",
        "lat": 36.39702,
        "lng": 3.99917
      },
      {
        "name": "Hanif",
        "name_ar": "حنيف",
        "daira": "M'Chedallah",
        "postal_code": "10030",
        "lat": 36.335801,
        "lng": 4.34149
      },
      {
        "name": "Kadiria",
        "name_ar": "قادرية",
        "daira": "Kadiria",
        "postal_code": "10006",
        "lat": 36.520024,
        "lng": 3.692753
      },
      {
        "name": "Lakhdaria",
        "name_ar": "الأخضرية",
        "daira": "Lakhdaria",
        "postal_code": "10002",
        "lat": 36.56448,
        "lng": 3.59675
      },
      {
        "name": "M Chedallah",
        "name_ar": "أمشدالة",
        "daira": "M'Chedallah",
        "postal_code": "10003",
        "lat": 36.371392,
        "lng": 4.264103
      },
      {
        "name": "Maala",
        "name_ar": "معلة",
        "daira": "Lakhdaria",
        "postal_code": "10039",
        "lat": 36.492778,
        "lng": 3.573611
      },
      {
        "name": "Maamora",
        "name_ar": "المعمورة",
        "daira": "Sour El Ghozlane",
        "postal_code": "10071",
        "lat": 36.033056,
        "lng": 3.62017
      },
      {
        "name": "Mezdour",
        "name_ar": "مزدور",
        "daira": "Bordj Okhriss",
        "postal_code": "10040",
        "lat": 36.376111,
        "lng": 4.07056
      },
      {
        "name": "Oued El Berdi",
        "name_ar": "وادي البردي",
        "daira": "El Hachimia",
        "postal_code": "10075",
        "lat": 36.263892,
        "lng": 3.92665
      },
      {
        "name": "Ouled Rached",
        "name_ar": "أولاد راشد",
        "daira": "Bechloul",
        "postal_code": "10076",
        "lat": 36.21525,
        "lng": 4.1106
      },
      {
        "name": "Raouraoua",
        "name_ar": "روراوة",
        "daira": "Bir Ghbalou",
        "postal_code": "10042",
        "lat": 36.55528,
        "lng": 3.7375
      },
      {
        "name": "Ridane",
        "name_ar": "ريدان",
        "daira": "Sour El Ghozlane",
        "postal_code": "10083",
        "lat": 36.073888,
        "lng": 3.46166
      },
      {
        "name": "Saharidj",
        "name_ar": "سحاريج",
        "daira": "M'Chedallah",
        "postal_code": "10043",
        "lat": 36.396944,
        "lng": 3.8619
      },
      {
        "name": "Souk El Khemis",
        "name_ar": "سوق الخميس",
        "daira": "Souk El Khemis",
        "postal_code": "10044",
        "lat": 36.388056,
        "lng": 3.635
      },
      {
        "name": "Sour El Ghozlane",
        "name_ar": "سور الغزلان",
        "daira": "Sour El Ghozlane",
        "postal_code": "10004",
        "lat": 36.14766,
        "lng": 3.69123
      },
      {
        "name": "Taghzout",
        "name_ar": "تاغزوت",
        "daira": "Haizer",
        "postal_code": "10055",
        "lat": 36.3167,
        "lng": 3.9667
      },
      {
        "name": "Taguedite",
        "name_ar": "تاقديت",
        "daira": "Bordj Okhriss",
        "postal_code": "10045",
        "lat": 36.0175,
        "lng": 3.994722
      },
      {
        "name": "Z'barbar",
        "name_ar": "زبربر",
        "daira": "Lakhdaria",
        "postal_code": "10047",
        "lat": 36.48473,
        "lng": 3.52588
      }
    ]
  },
  {
    "code": "11",
    "name": "Tamanrasset",
    "name_ar": "تمنراست",
    "lat": 22.78889,
    "lng": 5.52556,
    "communes": [
      {
        "name": "Abelsa",
        "name_ar": "ابلسة",
        "daira": "Abalessa",
        "postal_code": "",
        "lat": 22.89,
        "lng": 4.84722
      },
      {
        "name": "Ain Amguel",
        "name_ar": "عين امقل",
        "daira": "Tamanrasset",
        "postal_code": "11003",
        "lat": 23.6987,
        "lng": 5.1619
      },
      {
        "name": "Idles",
        "name_ar": "أدلس",
        "daira": "Tazrouk",
        "postal_code": "11020",
        "lat": 23.817397,
        "lng": 5.934366
      },
      {
        "name": "Tamanrasset",
        "name_ar": "تمنراست",
        "daira": "Tamanrasset",
        "postal_code": "11000",
        "lat": 22.788821,
        "lng": 5.52278
      },
      {
        "name": "Tazrouk",
        "name_ar": "تاظروك",
        "daira": "Tazrouk",
        "postal_code": "11010",
        "lat": 23.4133,
        "lng": 6.265556
      }
    ]
  },
  {
    "code": "12",
    "name": "Tébessa",
    "name_ar": "تبسة",
    "lat": 35.4,
    "lng": 8.117,
    "communes": [
      {
        "name": "Ain Zerga",
        "name_ar": "عين الزرقاء",
        "daira": "Ouenza",
        "postal_code": "12008",
        "lat": 35.648611,
        "lng": 8.261111
      },
      {
        "name": "Bedjene",
        "name_ar": "بجن",
        "daira": "El Ogla",
        "postal_code": "12035",
        "lat": 35.40417,
        "lng": 7.474652
      },
      {
        "name": "Bekkaria",
        "name_ar": "بكارية",
        "daira": "El Kouif",
        "postal_code": "12019",
        "lat": 35.366667,
        "lng": 8.242222
      },
      {
        "name": "Bir Dheheb",
        "name_ar": "بئر الذهب",
        "daira": "Morsott",
        "postal_code": "12031",
        "lat": 34.908056,
        "lng": 7.938333
      },
      {
        "name": "Bir Mokkadem",
        "name_ar": "بئر مقدم",
        "daira": "Bir Mokkadem",
        "postal_code": "12011",
        "lat": 35.3725,
        "lng": 7.809604
      },
      {
        "name": "Bir-El-Ater",
        "name_ar": "بئر العاتر",
        "daira": "Bir El Ater",
        "postal_code": "",
        "lat": 34.74488,
        "lng": 8.06
      },
      {
        "name": "Boukhadra",
        "name_ar": "بوخضرة",
        "daira": "El Aouinet",
        "postal_code": "12012",
        "lat": 35.744444,
        "lng": 8.0325
      },
      {
        "name": "Boulhaf Dyr",
        "name_ar": "بولحاف الدير",
        "daira": "El Kouif",
        "postal_code": "12039",
        "lat": 35.52052,
        "lng": 8.10581
      },
      {
        "name": "Cheria",
        "name_ar": "الشريعة",
        "daira": "Cheria",
        "postal_code": "12002",
        "lat": 35.268483,
        "lng": 7.747102
      },
      {
        "name": "El Kouif",
        "name_ar": "الكويف",
        "daira": "El Kouif",
        "postal_code": "12006",
        "lat": 35.498333,
        "lng": 8.321944
      },
      {
        "name": "El Malabiod",
        "name_ar": "الماء الابيض",
        "daira": "El Ma Labiodh",
        "postal_code": "12014",
        "lat": 35.2056,
        "lng": 8.170556
      },
      {
        "name": "El Meridj",
        "name_ar": "المريج",
        "daira": "Ouenza",
        "postal_code": "12023",
        "lat": 35.79308,
        "lng": 8.22951
      },
      {
        "name": "El Mezeraa",
        "name_ar": "المزرعة",
        "daira": "El Ogla",
        "postal_code": "12042",
        "lat": 35.266667,
        "lng": 7.58
      },
      {
        "name": "El Ogla",
        "name_ar": "العقلة",
        "daira": "El Ogla",
        "postal_code": "12015",
        "lat": 35.183333,
        "lng": 7.46762
      },
      {
        "name": "El Ogla El Malha",
        "name_ar": "العقلة المالحة",
        "daira": "Negrine",
        "postal_code": "",
        "lat": 35.121944,
        "lng": 7.940218
      },
      {
        "name": "El-Aouinet",
        "name_ar": "العوينات",
        "daira": "El Aouinet",
        "postal_code": "12005",
        "lat": 35.867,
        "lng": 7.887778
      },
      {
        "name": "El-Houidjbet",
        "name_ar": "الحويجبات",
        "daira": "El Ma Labiodh",
        "postal_code": "12038",
        "lat": 35.293317,
        "lng": 8.278941
      },
      {
        "name": "Ferkane",
        "name_ar": "فركان",
        "daira": "Bir El Ater",
        "postal_code": "",
        "lat": 34.56233,
        "lng": 7.412222
      },
      {
        "name": "Guorriguer",
        "name_ar": "قريقر",
        "daira": "Bir Mokkadem",
        "postal_code": "12046",
        "lat": 35.422777,
        "lng": 7.593333
      },
      {
        "name": "Hammamet",
        "name_ar": "الحمامات",
        "daira": "Bir Mokkadem",
        "postal_code": "12016",
        "lat": 35.590833,
        "lng": 7.953
      },
      {
        "name": "Morsott",
        "name_ar": "مرسط",
        "daira": "Morsott",
        "postal_code": "12017",
        "lat": 35.66944,
        "lng": 8.01667
      },
      {
        "name": "Negrine",
        "name_ar": "نقرين",
        "daira": "Negrine",
        "postal_code": "",
        "lat": 34.48593,
        "lng": 7.519309
      },
      {
        "name": "Ouenza",
        "name_ar": "الونزة",
        "daira": "Ouenza",
        "postal_code": "12003",
        "lat": 35.9533,
        "lng": 8.12917
      },
      {
        "name": "Oum Ali",
        "name_ar": "أم علي",
        "daira": "Oum Ali",
        "postal_code": "12027",
        "lat": 35.3333,
        "lng": 8.3009
      },
      {
        "name": "Saf Saf El Ouesra",
        "name_ar": "صفصاف الوسرى",
        "daira": "Oum Ali",
        "postal_code": "12037",
        "lat": 34.956586,
        "lng": 8.207628
      },
      {
        "name": "Stah Guentis",
        "name_ar": "سطح قنطيس",
        "daira": "El Ogla",
        "postal_code": "12032",
        "lat": 34.9984,
        "lng": 7.30829
      },
      {
        "name": "Tebessa",
        "name_ar": "تبسة",
        "daira": "Tébessa",
        "postal_code": "12000",
        "lat": 35.405556,
        "lng": 8.12417
      },
      {
        "name": "Telidjen",
        "name_ar": "ثليجان",
        "daira": "Cheria",
        "postal_code": "12053",
        "lat": 35.21525,
        "lng": 7.767222
      }
    ]
  },
  {
    "code": "13",
    "name": "Tlemcen",
    "name_ar": "تلمسان",
    "lat": 34.88278,
    "lng": -1.31667,
    "communes": [
      {
        "name": "Ain Fetah",
        "name_ar": "عين فتاح",
        "daira": "Fellaoucene",
        "postal_code": "13028",
        "lat": 34.965556,
        "lng": -1.638611
      },
      {
        "name": "Ain Fezza",
        "name_ar": "عين فزة",
        "daira": "Chetouane",
        "postal_code": "13022",
        "lat": 34.87,
        "lng": -1.1868
      },
      {
        "name": "Ain Ghoraba",
        "name_ar": "عين غرابة",
        "daira": "Mansourah",
        "postal_code": "13023",
        "lat": 34.713889,
        "lng": -1.389167
      },
      {
        "name": "Ain Kebira",
        "name_ar": "عين الكبيرة",
        "daira": "Fellaoucene",
        "postal_code": "13053",
        "lat": 35.032777,
        "lng": -1.665278
      },
      {
        "name": "Ain Nehala",
        "name_ar": "عين النحالة",
        "daira": "Aïn Tallout",
        "postal_code": "13054",
        "lat": 35.027326,
        "lng": -0.932222
      },
      {
        "name": "Ain Tellout",
        "name_ar": "عين تالوت",
        "daira": "Aïn Tallout",
        "postal_code": "13012",
        "lat": 34.805556,
        "lng": -0.954444
      },
      {
        "name": "Ain Youcef",
        "name_ar": "عين يوسف",
        "daira": "Remchi",
        "postal_code": "13013",
        "lat": 35.047222,
        "lng": -1.3739
      },
      {
        "name": "Amieur",
        "name_ar": "عمير",
        "daira": "Chetouane",
        "postal_code": "13058",
        "lat": 35.035277,
        "lng": -1.24
      },
      {
        "name": "Azail",
        "name_ar": "العزايل",
        "daira": "Beni Snous",
        "postal_code": "13080",
        "lat": 34.68,
        "lng": -1.4656
      },
      {
        "name": "Bab El Assa",
        "name_ar": "باب العسة",
        "daira": "Bab El Assa",
        "postal_code": "13014",
        "lat": 34.960317,
        "lng": -2.0318
      },
      {
        "name": "Beni Bahdel",
        "name_ar": "بني بهدل",
        "daira": "Beni Snous",
        "postal_code": "13060",
        "lat": 34.693889,
        "lng": -1.5186
      },
      {
        "name": "Beni Boussaid",
        "name_ar": "بني بوسعيد",
        "daira": "Beni Boussaid",
        "postal_code": "13049",
        "lat": 34.65,
        "lng": -1.75306
      },
      {
        "name": "Beni Khellad",
        "name_ar": "بني خلاد",
        "daira": "Honaïne",
        "postal_code": "13074",
        "lat": 35.1725,
        "lng": -1.5572
      },
      {
        "name": "Beni Mester",
        "name_ar": "بني مستر",
        "daira": "Mansourah",
        "postal_code": "13061",
        "lat": 34.87045,
        "lng": -1.42319
      },
      {
        "name": "Beni Ouarsous",
        "name_ar": "بني وارسوس",
        "daira": "Remchi",
        "postal_code": "13025",
        "lat": 35.083333,
        "lng": -1.55731
      },
      {
        "name": "Beni Smiel",
        "name_ar": "بني صميل",
        "daira": "Ouled Mimoun",
        "postal_code": "13086",
        "lat": 34.816666,
        "lng": -1.0267
      },
      {
        "name": "Beni Snous",
        "name_ar": "بني سنوس",
        "daira": "Beni Snous",
        "postal_code": "13037",
        "lat": 34.659314,
        "lng": -1.545077
      },
      {
        "name": "Bensekrane",
        "name_ar": "بن سكران",
        "daira": "Bensekrane",
        "postal_code": "13008",
        "lat": 35.073908,
        "lng": -1.22747
      },
      {
        "name": "Bouhlou",
        "name_ar": "بوحلو",
        "daira": "Sabra",
        "postal_code": "13026",
        "lat": 34.773889,
        "lng": -1.5731
      },
      {
        "name": "Bouihi",
        "name_ar": "البويهي",
        "daira": "Sidi Djillali",
        "postal_code": "",
        "lat": 34.41389,
        "lng": -1.68583
      },
      {
        "name": "Chetouane",
        "name_ar": "شتوان",
        "daira": "Chetouane",
        "postal_code": "13048",
        "lat": 34.920334,
        "lng": -1.297531
      },
      {
        "name": "Dar Yaghmoracen",
        "name_ar": "دار يغمراسن",
        "daira": "Ghazaouet",
        "postal_code": "13032",
        "lat": 35.100556,
        "lng": -1.800833
      },
      {
        "name": "Djebala",
        "name_ar": "جبالة",
        "daira": "Nedroma",
        "postal_code": "13029",
        "lat": 34.976388,
        "lng": -1.7248
      },
      {
        "name": "El Aricha",
        "name_ar": "العريشة",
        "daira": "El Aricha",
        "postal_code": "",
        "lat": 34.22259,
        "lng": -1.257
      },
      {
        "name": "El Fehoul",
        "name_ar": "الفحول",
        "daira": "Remchi",
        "postal_code": "13033",
        "lat": 35.12,
        "lng": -1.294444
      },
      {
        "name": "El Gor",
        "name_ar": "القور",
        "daira": "El Aricha",
        "postal_code": "",
        "lat": 34.63797,
        "lng": -1.15296
      },
      {
        "name": "Fellaoucene",
        "name_ar": "فلاوسن",
        "daira": "Fellaoucene",
        "postal_code": "13035",
        "lat": 35.035,
        "lng": -1.605833
      },
      {
        "name": "Ghazaouet",
        "name_ar": "الغزوات",
        "daira": "Ghazaouet",
        "postal_code": "13002",
        "lat": 35.093858,
        "lng": -1.86038
      },
      {
        "name": "Hammam Boughrara",
        "name_ar": "حمام بوغرارة",
        "daira": "Maghnia",
        "postal_code": "13036",
        "lat": 34.8935,
        "lng": -1.6386
      },
      {
        "name": "Hennaya",
        "name_ar": "الحناية",
        "daira": "Hennaya",
        "postal_code": "13009",
        "lat": 34.951389,
        "lng": -1.37104
      },
      {
        "name": "Honnaine",
        "name_ar": "هنين",
        "daira": "Honaïne",
        "postal_code": "13015",
        "lat": 35.178934,
        "lng": -1.649353
      },
      {
        "name": "M'sirda Fouaga",
        "name_ar": "مسيردة الفواقة",
        "daira": "Marsa Ben M'Hidi",
        "postal_code": "13024",
        "lat": 35.019722,
        "lng": -2.065
      },
      {
        "name": "Maghnia",
        "name_ar": "مغنية",
        "daira": "Maghnia",
        "postal_code": "13001",
        "lat": 34.85345,
        "lng": -1.730556
      },
      {
        "name": "Mansourah",
        "name_ar": "منصورة",
        "daira": "Mansourah",
        "postal_code": "13016",
        "lat": 34.871111,
        "lng": -1.337999
      },
      {
        "name": "Marsa Ben M'hidi",
        "name_ar": "مرسى بن مهيدي",
        "daira": "Marsa Ben M'Hidi",
        "postal_code": "13017",
        "lat": 35.08669,
        "lng": -2.19771
      },
      {
        "name": "Nedroma",
        "name_ar": "ندرومة",
        "daira": "Nedroma",
        "postal_code": "13004",
        "lat": 35.01361,
        "lng": -1.748
      },
      {
        "name": "Oued Lakhdar",
        "name_ar": "وادي الخضر",
        "daira": "Ouled Mimoun",
        "postal_code": "13068",
        "lat": 34.874963,
        "lng": -1.134114
      },
      {
        "name": "Ouled Mimoun",
        "name_ar": "أولاد ميمون",
        "daira": "Ouled Mimoun",
        "postal_code": "13010",
        "lat": 34.90472,
        "lng": -1.0347
      },
      {
        "name": "Ouled Riyah",
        "name_ar": "أولاد رياح",
        "daira": "Hennaya",
        "postal_code": "13070",
        "lat": 34.9625,
        "lng": -1.497222
      },
      {
        "name": "Remchi",
        "name_ar": "الرمشي",
        "daira": "Remchi",
        "postal_code": "13005",
        "lat": 35.06196,
        "lng": -1.43362
      },
      {
        "name": "Sabra",
        "name_ar": "صبرة",
        "daira": "Sabra",
        "postal_code": "13011",
        "lat": 34.828026,
        "lng": -1.5283
      },
      {
        "name": "Sebbaa Chioukh",
        "name_ar": "سبعة شيوخ",
        "daira": "Remchi",
        "postal_code": "13042",
        "lat": 35.156111,
        "lng": -1.355833
      },
      {
        "name": "Sebdou",
        "name_ar": "سبدو",
        "daira": "Sebdou",
        "postal_code": "13006",
        "lat": 34.639444,
        "lng": -1.32694
      },
      {
        "name": "Sidi Abdelli",
        "name_ar": "سيدي العبدلي",
        "daira": "Bensekrane",
        "postal_code": "13019",
        "lat": 35.069,
        "lng": -1.1371
      },
      {
        "name": "Sidi Djillali",
        "name_ar": "سيدي الجيلالي",
        "daira": "Sidi Djillali",
        "postal_code": "",
        "lat": 34.4609,
        "lng": -1.5664
      },
      {
        "name": "Sidi Medjahed",
        "name_ar": "سيدي مجاهد",
        "daira": "Beni Boussaid",
        "postal_code": "13044",
        "lat": 34.775277,
        "lng": -1.6367
      },
      {
        "name": "Souahlia",
        "name_ar": "السواحلية",
        "daira": "Ghazaouet",
        "postal_code": "13020",
        "lat": 35.033333,
        "lng": -1.8881
      },
      {
        "name": "Souani",
        "name_ar": "السواني",
        "daira": "Bab El Assa",
        "postal_code": "13046",
        "lat": 34.921819,
        "lng": -1.917252
      },
      {
        "name": "Souk Tleta",
        "name_ar": "سوق الثلاثاء",
        "daira": "Bab El Assa",
        "postal_code": "13078",
        "lat": 35.023889,
        "lng": -1.927222
      },
      {
        "name": "Terny Beni Hediel",
        "name_ar": "تيرني بني هديل",
        "daira": "Mansourah",
        "postal_code": "13079",
        "lat": 34.79583,
        "lng": -1.35812
      },
      {
        "name": "Tianet",
        "name_ar": "تيانت",
        "daira": "Ghazaouet",
        "postal_code": "13047",
        "lat": 35.090833,
        "lng": -1.8389
      },
      {
        "name": "Tlemcen",
        "name_ar": "تلمسان",
        "daira": "Tlemcen",
        "postal_code": "13000",
        "lat": 34.882777,
        "lng": -1.316667
      },
      {
        "name": "Zenata",
        "name_ar": "زناتة",
        "daira": "Hennaya",
        "postal_code": "13051",
        "lat": 35.0167,
        "lng": -1.4583
      }
    ]
  },
  {
    "code": "14",
    "name": "Tiaret",
    "name_ar": "تيارت",
    "lat": 35.367,
    "lng": 1.317,
    "communes": [
      {
        "name": "Ain Bouchekif",
        "name_ar": "عين بوشقيف",
        "daira": "Dahmouni",
        "postal_code": "14040",
        "lat": 35.355833,
        "lng": 1.51056
      },
      {
        "name": "Ain Deheb",
        "name_ar": "عين الذهب",
        "daira": "Aïn Deheb",
        "postal_code": "14007",
        "lat": 34.8422,
        "lng": 1.545077
      },
      {
        "name": "Ain Dzarit",
        "name_ar": "عين دزاريت",
        "daira": "Mahdia",
        "postal_code": "14017",
        "lat": 35.35339,
        "lng": 1.66699
      },
      {
        "name": "Ain El Hadid",
        "name_ar": "عين الحديد",
        "daira": "Frenda",
        "postal_code": "14008",
        "lat": 35.05783,
        "lng": 0.88479
      },
      {
        "name": "Ain Kermes",
        "name_ar": "عين كرمس",
        "daira": "Aïn Kermes",
        "postal_code": "14009",
        "lat": 34.908176,
        "lng": 1.10807
      },
      {
        "name": "Bougara",
        "name_ar": "بوقرة",
        "daira": "Zmalet El Emir Abdelkader",
        "postal_code": "",
        "lat": 35.553353,
        "lng": 1.967282
      },
      {
        "name": "Chehaima",
        "name_ar": "شحيمة",
        "daira": "Aïn Deheb",
        "postal_code": "14046",
        "lat": 34.8959,
        "lng": 1.304756
      },
      {
        "name": "Dahmouni",
        "name_ar": "دحموني",
        "daira": "Dahmouni",
        "postal_code": "14010",
        "lat": 35.415715,
        "lng": 1.483333
      },
      {
        "name": "Djebilet Rosfa",
        "name_ar": "جبيلات الرصفاء",
        "daira": "Aïn Kermes",
        "postal_code": "14061",
        "lat": 34.86375,
        "lng": 1.015
      },
      {
        "name": "Djillali Ben Amar",
        "name_ar": "جيلالي بن عمار",
        "daira": "Mechraa Safa",
        "postal_code": "14048",
        "lat": 35.44444,
        "lng": 0.849722
      },
      {
        "name": "Faidja",
        "name_ar": "الفايجة",
        "daira": "Sougueur",
        "postal_code": "14049",
        "lat": 34.87,
        "lng": 1.705556
      },
      {
        "name": "Frenda",
        "name_ar": "فرندة",
        "daira": "Frenda",
        "postal_code": "14001",
        "lat": 35.05,
        "lng": 1.053825
      },
      {
        "name": "Guertoufa",
        "name_ar": "قرطوفة",
        "daira": "Rahouia",
        "postal_code": "14019",
        "lat": 35.393056,
        "lng": 1.25
      },
      {
        "name": "Hamadia",
        "name_ar": "حمادية",
        "daira": "Rechaiga",
        "postal_code": "",
        "lat": 35.45918,
        "lng": 1.87316
      },
      {
        "name": "Ksar Chellala",
        "name_ar": "قصر الشلالة",
        "daira": "Ksar Chellala",
        "postal_code": "",
        "lat": 35.21222,
        "lng": 2.3189
      },
      {
        "name": "Madna",
        "name_ar": "مادنة",
        "daira": "Aïn Kermes",
        "postal_code": "14055",
        "lat": 34.753055,
        "lng": 0.98278
      },
      {
        "name": "Mahdia",
        "name_ar": "مهدية",
        "daira": "Mahdia",
        "postal_code": "14004",
        "lat": 35.427088,
        "lng": 1.755
      },
      {
        "name": "Mechraa Safa",
        "name_ar": "مشرع الصفا",
        "daira": "Mechraa Safa",
        "postal_code": "14012",
        "lat": 35.383889,
        "lng": 1.03803
      },
      {
        "name": "Medrissa",
        "name_ar": "مدريسة",
        "daira": "Aïn Kermes",
        "postal_code": "14013",
        "lat": 34.8959,
        "lng": 1.2407
      },
      {
        "name": "Medroussa",
        "name_ar": "مدروسة",
        "daira": "Medroussa",
        "postal_code": "14023",
        "lat": 35.17721,
        "lng": 1.203611
      },
      {
        "name": "Meghila",
        "name_ar": "مغيلة",
        "daira": "Meghila",
        "postal_code": "14024",
        "lat": 35.596479,
        "lng": 1.4136
      },
      {
        "name": "Mellakou",
        "name_ar": "ملاكو",
        "daira": "Medroussa",
        "postal_code": "14025",
        "lat": 35.249789,
        "lng": 1.233766
      },
      {
        "name": "Nadorah",
        "name_ar": "الناظورة",
        "daira": "Mahdia",
        "postal_code": "14058",
        "lat": 35.069,
        "lng": 1.890556
      },
      {
        "name": "Naima",
        "name_ar": "النعيمة",
        "daira": "Aïn Deheb",
        "postal_code": "14060",
        "lat": 34.639444,
        "lng": 1.4775
      },
      {
        "name": "Oued Lilli",
        "name_ar": "وادي ليلي",
        "daira": "Oued Lilli",
        "postal_code": "14014",
        "lat": 35.5107,
        "lng": 1.2713
      },
      {
        "name": "Rahouia",
        "name_ar": "الرحوية",
        "daira": "Rahouia",
        "postal_code": "14005",
        "lat": 35.530278,
        "lng": 1.6
      },
      {
        "name": "Rechaiga",
        "name_ar": "الرشايقة",
        "daira": "Rechaiga",
        "postal_code": "",
        "lat": 35.4081,
        "lng": 1.9739
      },
      {
        "name": "Sebaine",
        "name_ar": "السبعين",
        "daira": "Mahdia",
        "postal_code": "14030",
        "lat": 34.63797,
        "lng": 1.603611
      },
      {
        "name": "Sebt",
        "name_ar": "السبت",
        "daira": "Meghila",
        "postal_code": "14062",
        "lat": 35.656111,
        "lng": 1.3728
      },
      {
        "name": "Serghine",
        "name_ar": "سرغين",
        "daira": "Ksar Chellala",
        "postal_code": "",
        "lat": 35.254444,
        "lng": 2.30861
      },
      {
        "name": "Si Abdelghani",
        "name_ar": "سي عبد الغني",
        "daira": "Sougueur",
        "postal_code": "14027",
        "lat": 35.2194,
        "lng": 1.638611
      },
      {
        "name": "Sidi Abderrahmane",
        "name_ar": "سيدي عبد الرحمن",
        "daira": "Aïn Kermes",
        "postal_code": "14028",
        "lat": 34.79861,
        "lng": 1.130278
      },
      {
        "name": "Sidi Ali Mellal",
        "name_ar": "سيدي علي ملال",
        "daira": "Oued Lilli",
        "postal_code": "14064",
        "lat": 35.563333,
        "lng": 1.2256
      },
      {
        "name": "Sidi Bakhti",
        "name_ar": "سيدي بختي",
        "daira": "Medroussa",
        "postal_code": "14065",
        "lat": 35.156111,
        "lng": 0.9783
      },
      {
        "name": "Sidi Hosni",
        "name_ar": "سيدي حسني",
        "daira": "Meghila",
        "postal_code": "14029",
        "lat": 35.4711,
        "lng": 1.521582
      },
      {
        "name": "Sougueur",
        "name_ar": "السوقر",
        "daira": "Sougueur",
        "postal_code": "14003",
        "lat": 35.18568,
        "lng": 1.49612
      },
      {
        "name": "Tagdempt",
        "name_ar": "تاقدمت",
        "daira": "Mechraa Safa",
        "postal_code": "14068",
        "lat": 35.335556,
        "lng": 1.545077
      },
      {
        "name": "Takhemaret",
        "name_ar": "تخمرت",
        "daira": "Frenda",
        "postal_code": "14015",
        "lat": 35.035,
        "lng": 0.683333
      },
      {
        "name": "Tiaret",
        "name_ar": "تيارت",
        "daira": "Tiaret",
        "postal_code": "14000",
        "lat": 35.3667,
        "lng": 1.3167
      },
      {
        "name": "Tidda",
        "name_ar": "تيدة",
        "daira": "Oued Lilli",
        "postal_code": "14071",
        "lat": 35.5825,
        "lng": 1.266238
      },
      {
        "name": "Tousnina",
        "name_ar": "توسنينة",
        "daira": "Sougueur",
        "postal_code": "14037",
        "lat": 34.02,
        "lng": 1.276389
      },
      {
        "name": "Zmalet El Emir Abdelkade",
        "name_ar": "زمالة الأمير عبد القادر",
        "daira": "Ksar Chellala",
        "postal_code": "",
        "lat": 34.89336,
        "lng": 2.31
      }
    ]
  },
  {
    "code": "15",
    "name": "Tizi Ouzou",
    "name_ar": "تيزي وزو",
    "lat": 36.717,
    "lng": 4.05,
    "communes": [
      {
        "name": "Abi-Youcef",
        "name_ar": "أبي يوسف",
        "daira": "Aïn El Hammam",
        "postal_code": "15128",
        "lat": 36.538333,
        "lng": 4.343889
      },
      {
        "name": "Aghribs",
        "name_ar": "أغريب",
        "daira": "Azeffoun",
        "postal_code": "15022",
        "lat": 36.802222,
        "lng": 4.322778
      },
      {
        "name": "Agouni-Gueghrane",
        "name_ar": "أقني قغران",
        "daira": "Ouadhia",
        "postal_code": "15023",
        "lat": 36.515225,
        "lng": 4.113796
      },
      {
        "name": "Ain-El-Hammam",
        "name_ar": "عين الحمام",
        "daira": "Aïn El Hammam",
        "postal_code": "15002",
        "lat": 36.57056,
        "lng": 4.31111
      },
      {
        "name": "Ain-Zaouia",
        "name_ar": "عين الزاوية",
        "daira": "Draâ El Mizan",
        "postal_code": "15056",
        "lat": 36.550449,
        "lng": 3.89416
      },
      {
        "name": "Ait Aggouacha",
        "name_ar": "أيت عقـواشة",
        "daira": "Larbaâ Nath Irathen",
        "postal_code": "15059",
        "lat": 36.617777,
        "lng": 4.23
      },
      {
        "name": "Ait Bouaddou",
        "name_ar": "أيت بــوادو",
        "daira": "Ouadhia",
        "postal_code": "15025",
        "lat": 36.508333,
        "lng": 4.058333
      },
      {
        "name": "Ait Boumahdi",
        "name_ar": "أيت بومهدي",
        "daira": "Ouacif",
        "postal_code": "15085",
        "lat": 36.4883,
        "lng": 4.182096
      },
      {
        "name": "Ait Khellili",
        "name_ar": "أيت خليلي",
        "daira": "Mekla",
        "postal_code": "15028",
        "lat": 36.666474,
        "lng": 4.3134
      },
      {
        "name": "Ait Yahia Moussa",
        "name_ar": "أيت يحي موسى",
        "daira": "Draâ El Mizan",
        "postal_code": "15027",
        "lat": 36.641111,
        "lng": 3.89
      },
      {
        "name": "Ait-Aissa-Mimoun",
        "name_ar": "أيت عيسى ميمون",
        "daira": "Ouaguenoun",
        "postal_code": "15033",
        "lat": 36.748696,
        "lng": 4.1156
      },
      {
        "name": "Ait-Chafaa",
        "name_ar": "أيت شافع",
        "daira": "Azeffoun",
        "postal_code": "15060",
        "lat": 36.81702,
        "lng": 4.53358
      },
      {
        "name": "Ait-Mahmoud",
        "name_ar": "أيت محمود",
        "daira": "Beni Douala",
        "postal_code": "15045",
        "lat": 36.508394,
        "lng": 3.993187
      },
      {
        "name": "Ait-Oumalou",
        "name_ar": "أيت أومالو",
        "daira": "Tizi Rached",
        "postal_code": "15055",
        "lat": 36.658639,
        "lng": 4.228209
      },
      {
        "name": "Ait-Toudert",
        "name_ar": "أيت تودرت",
        "daira": "Ouacif",
        "postal_code": "15063",
        "lat": 36.6914,
        "lng": 4.1615
      },
      {
        "name": "Ait-Yahia",
        "name_ar": "أيت يحيى",
        "daira": "Aïn El Hammam",
        "postal_code": "15073",
        "lat": 36.606664,
        "lng": 4.330278
      },
      {
        "name": "Akbil",
        "name_ar": "اقبيل",
        "daira": "Aïn El Hammam",
        "postal_code": "15099",
        "lat": 36.499552,
        "lng": 4.305154
      },
      {
        "name": "Akerrou",
        "name_ar": "أقرو",
        "daira": "Azeffoun",
        "postal_code": "15076",
        "lat": 36.7992,
        "lng": 4.4206
      },
      {
        "name": "Assi-Youcef",
        "name_ar": "أسي يوسف",
        "daira": "Boghni",
        "postal_code": "15026",
        "lat": 36.5071,
        "lng": 4
      },
      {
        "name": "Azazga",
        "name_ar": "عزازقة",
        "daira": "Azazga",
        "postal_code": "15001",
        "lat": 36.74472,
        "lng": 4.37222
      },
      {
        "name": "Azeffoun",
        "name_ar": "أزفون",
        "daira": "Azeffoun",
        "postal_code": "15010",
        "lat": 36.889531,
        "lng": 4.424015
      },
      {
        "name": "Beni Zmenzer",
        "name_ar": "بنــــي زمنزار",
        "daira": "Beni Douala",
        "postal_code": "15029",
        "lat": 36.64775,
        "lng": 4.04202
      },
      {
        "name": "Beni-Aissi",
        "name_ar": "بني عيسي",
        "daira": "Beni Douala",
        "postal_code": "15070",
        "lat": 36.663628,
        "lng": 4.0938
      },
      {
        "name": "Beni-Douala",
        "name_ar": "بني دوالة",
        "daira": "Beni Douala",
        "postal_code": "15011",
        "lat": 36.61954,
        "lng": 4.08282
      },
      {
        "name": "Beni-Yenni",
        "name_ar": "بني يني",
        "daira": "Beni Yenni",
        "postal_code": "15030",
        "lat": 36.5752,
        "lng": 4.20764
      },
      {
        "name": "Beni-Zikki",
        "name_ar": "بني زيكــي",
        "daira": "Bouzguène",
        "postal_code": "15119",
        "lat": 36.55308,
        "lng": 4.301147
      },
      {
        "name": "Boghni",
        "name_ar": "بوغني",
        "daira": "Boghni",
        "postal_code": "15003",
        "lat": 36.54222,
        "lng": 3.95306
      },
      {
        "name": "Boudjima",
        "name_ar": "بوجيمة",
        "daira": "Makouda",
        "postal_code": "15031",
        "lat": 36.802,
        "lng": 4.1481
      },
      {
        "name": "Bounouh",
        "name_ar": "بونوح",
        "daira": "Boghni",
        "postal_code": "15032",
        "lat": 36.49935,
        "lng": 4.07056
      },
      {
        "name": "Bouzeguene",
        "name_ar": "بوزقــن",
        "daira": "Bouzguène",
        "postal_code": "15009",
        "lat": 36.616705,
        "lng": 4.47985
      },
      {
        "name": "Draa-Ben-Khedda",
        "name_ar": "ذراع بن خدة",
        "daira": "Draâ Ben Khedda",
        "postal_code": "15004",
        "lat": 36.73096,
        "lng": 3.965251
      },
      {
        "name": "Draa-El-Mizan",
        "name_ar": "ذراع الميزان",
        "daira": "Draâ El Mizan",
        "postal_code": "15005",
        "lat": 36.536,
        "lng": 3.833
      },
      {
        "name": "Freha",
        "name_ar": "فريحة",
        "daira": "Azazga",
        "postal_code": "15012",
        "lat": 36.76124,
        "lng": 4.3194
      },
      {
        "name": "Frikat",
        "name_ar": "فريقات",
        "daira": "Draâ El Mizan",
        "postal_code": "15068",
        "lat": 36.492644,
        "lng": 3.994722
      },
      {
        "name": "Iboudrarene",
        "name_ar": "إبودرارن",
        "daira": "Beni Yenni",
        "postal_code": "15116",
        "lat": 36.529,
        "lng": 4.298611
      },
      {
        "name": "Idjeur",
        "name_ar": "إيجــار",
        "daira": "Bouzguène",
        "postal_code": "15036",
        "lat": 36.6664,
        "lng": 4.5186
      },
      {
        "name": "Iferhounene",
        "name_ar": "إفــرحــونان",
        "daira": "Iferhounène",
        "postal_code": "15013",
        "lat": 36.51667,
        "lng": 4.38333
      },
      {
        "name": "Ifigha",
        "name_ar": "إيفيغاء",
        "daira": "Azazga",
        "postal_code": "15035",
        "lat": 36.671389,
        "lng": 4.469722
      },
      {
        "name": "Iflissen",
        "name_ar": "إفليـــسن",
        "daira": "Tigzirt",
        "postal_code": "15069",
        "lat": 36.89623,
        "lng": 4.223084
      },
      {
        "name": "Illilten",
        "name_ar": "إيلـيــلتـن",
        "daira": "Iferhounène",
        "postal_code": "15037",
        "lat": 36.5167,
        "lng": 4.0497
      },
      {
        "name": "Illoula Oumalou",
        "name_ar": "إيلولة أومـــالو",
        "daira": "Bouzguène",
        "postal_code": "15038",
        "lat": 36.5667,
        "lng": 4.59611
      },
      {
        "name": "Imsouhal",
        "name_ar": "إمســوحال",
        "daira": "Iferhounène",
        "postal_code": "15024",
        "lat": 36.574444,
        "lng": 4.39
      },
      {
        "name": "Irdjen",
        "name_ar": "إيرجـــن",
        "daira": "Larbaâ Nath Irathen",
        "postal_code": "15039",
        "lat": 36.6562,
        "lng": 4.140165
      },
      {
        "name": "Larbaa Nath Irathen",
        "name_ar": "الأربعــاء ناث إيراثن",
        "daira": "Larbaâ Nath Irathen",
        "postal_code": "15006",
        "lat": 36.63667,
        "lng": 4.206709
      },
      {
        "name": "M'kira",
        "name_ar": "مكيرة",
        "daira": "Tizi Gheniff",
        "postal_code": "15047",
        "lat": 36.6253,
        "lng": 3.993611
      },
      {
        "name": "Maatkas",
        "name_ar": "معـــاتقة",
        "daira": "Mâatkas",
        "postal_code": "15017",
        "lat": 36.619436,
        "lng": 3.957237
      },
      {
        "name": "Makouda",
        "name_ar": "ماكودة",
        "daira": "Makouda",
        "postal_code": "15041",
        "lat": 36.791944,
        "lng": 4.063
      },
      {
        "name": "Mechtras",
        "name_ar": "مشطراس",
        "daira": "Boghni",
        "postal_code": "15042",
        "lat": 36.53117,
        "lng": 3.9981
      },
      {
        "name": "Mekla",
        "name_ar": "مقــلع",
        "daira": "Mekla",
        "postal_code": "15014",
        "lat": 36.68178,
        "lng": 4.264103
      },
      {
        "name": "Mizrana",
        "name_ar": "ميزرانـــة",
        "daira": "Tigzirt",
        "postal_code": "15062",
        "lat": 36.89623,
        "lng": 4.096111
      },
      {
        "name": "Ouacif",
        "name_ar": "واسيف",
        "daira": "Ouacif",
        "postal_code": "15015",
        "lat": 36.5245,
        "lng": 4.20556
      },
      {
        "name": "Ouadhias",
        "name_ar": "واضية",
        "daira": "Ouadhia",
        "postal_code": "15016",
        "lat": 36.55611,
        "lng": 4.0897
      },
      {
        "name": "Ouaguenoun",
        "name_ar": "واقنون",
        "daira": "Ouaguenoun",
        "postal_code": "15046",
        "lat": 36.758895,
        "lng": 4.174722
      },
      {
        "name": "Sidi Namane",
        "name_ar": "سيدي نعمان",
        "daira": "Draâ Ben Khedda",
        "postal_code": "15043",
        "lat": 36.7169,
        "lng": 3.9839
      },
      {
        "name": "Souama",
        "name_ar": "صوامـــع",
        "daira": "Mekla",
        "postal_code": "15044",
        "lat": 36.637553,
        "lng": 4.343862
      },
      {
        "name": "Souk-El-Tenine",
        "name_ar": "سوق الاثنين",
        "daira": "Mâatkas",
        "postal_code": "15071",
        "lat": 36.594099,
        "lng": 4.008551
      },
      {
        "name": "Tadmait",
        "name_ar": "تادمايت",
        "daira": "Draâ Ben Khedda",
        "postal_code": "15018",
        "lat": 36.74413,
        "lng": 3.90045
      },
      {
        "name": "Tigzirt",
        "name_ar": "تيقـزيرت",
        "daira": "Tigzirt",
        "postal_code": "15019",
        "lat": 36.89623,
        "lng": 4.12142
      },
      {
        "name": "Timizart",
        "name_ar": "تيمـيزار",
        "daira": "Ouaguenoun",
        "postal_code": "15152",
        "lat": 36.8,
        "lng": 4.2667
      },
      {
        "name": "Tirmitine",
        "name_ar": "تيرمتين",
        "daira": "Draâ Ben Khedda",
        "postal_code": "15049",
        "lat": 36.661809,
        "lng": 3.984722
      },
      {
        "name": "Tizi N'tleta",
        "name_ar": "تيزي نثلاثة",
        "daira": "Ouadhia",
        "postal_code": "15050",
        "lat": 36.5457,
        "lng": 4.057
      },
      {
        "name": "Tizi-Gheniff",
        "name_ar": "تيزي غنيف",
        "daira": "Tizi Gheniff",
        "postal_code": "15020",
        "lat": 36.58839,
        "lng": 3.77445
      },
      {
        "name": "Tizi-Ouzou",
        "name_ar": "تيزي وزو",
        "daira": "Tizi Ouzou",
        "postal_code": "15000",
        "lat": 36.733333,
        "lng": 4.05
      },
      {
        "name": "Tizi-Rached",
        "name_ar": "تيزي راشد",
        "daira": "Tizi Rached",
        "postal_code": "15051",
        "lat": 36.679952,
        "lng": 4.208729
      },
      {
        "name": "Yakourene",
        "name_ar": "إعــكورن",
        "daira": "Azazga",
        "postal_code": "15052",
        "lat": 36.7305,
        "lng": 4.438611
      },
      {
        "name": "Yatafene",
        "name_ar": "يطــافن",
        "daira": "Beni Yenni",
        "postal_code": "15053",
        "lat": 36.575278,
        "lng": 4.2989
      },
      {
        "name": "Zekri",
        "name_ar": "زكري",
        "daira": "Azazga",
        "postal_code": "15077",
        "lat": 36.780278,
        "lng": 4.5531
      }
    ]
  },
  {
    "code": "16",
    "name": "Alger",
    "name_ar": "الجزائر",
    "lat": 36.7325,
    "lng": 3.08722,
    "communes": [
      {
        "name": "Ain Benian",
        "name_ar": "عين بنيان",
        "daira": "Chéraga",
        "postal_code": "16018",
        "lat": 36.791944,
        "lng": 2.933792
      },
      {
        "name": "Ain Taya",
        "name_ar": "عين طاية",
        "daira": "Dar El Beïda",
        "postal_code": "16019",
        "lat": 36.785253,
        "lng": 3.2869
      },
      {
        "name": "Alger Centre",
        "name_ar": "الجزائر الوسطى",
        "daira": "Sidi M'Hamed",
        "postal_code": "16000",
        "lat": 36.76846,
        "lng": 3.0909
      },
      {
        "name": "Bab El Oued",
        "name_ar": "باب الوادي",
        "daira": "Bab El Oued",
        "postal_code": "16008",
        "lat": 36.790703,
        "lng": 3.05
      },
      {
        "name": "Bab Ezzouar",
        "name_ar": "باب الزوار",
        "daira": "Dar El Beïda",
        "postal_code": "16024",
        "lat": 36.720625,
        "lng": 3.1853
      },
      {
        "name": "Baba Hassen",
        "name_ar": "بابا حسن",
        "daira": "Draria",
        "postal_code": "16081",
        "lat": 36.694697,
        "lng": 2.972
      },
      {
        "name": "Bachedjerah",
        "name_ar": "باش جراح",
        "daira": "El Harrach",
        "postal_code": "16026",
        "lat": 36.7006,
        "lng": 3.0667
      },
      {
        "name": "Baraki",
        "name_ar": "براقي",
        "daira": "Baraki",
        "postal_code": "16027",
        "lat": 36.6667,
        "lng": 3.0961
      },
      {
        "name": "Ben Aknoun",
        "name_ar": "ابن عكنون",
        "daira": "Bouzareah",
        "postal_code": "16028",
        "lat": 36.758895,
        "lng": 3.010066
      },
      {
        "name": "Beni Messous",
        "name_ar": "بني مسوس",
        "daira": "Bouzareah",
        "postal_code": "16044",
        "lat": 36.73962,
        "lng": 2.974444
      },
      {
        "name": "Bir Mourad Rais",
        "name_ar": "بئر مراد رايس",
        "daira": "Bir Mourad Raïs",
        "postal_code": "16013",
        "lat": 36.732325,
        "lng": 3.045
      },
      {
        "name": "Bir Touta",
        "name_ar": "بئر توتة",
        "daira": "Birtouta",
        "postal_code": "16045",
        "lat": 36.62815,
        "lng": 2.99889
      },
      {
        "name": "Birkhadem",
        "name_ar": "بئر خادم",
        "daira": "Bir Mourad Raïs",
        "postal_code": "16029",
        "lat": 36.71499,
        "lng": 3.05002
      },
      {
        "name": "Bologhine Ibnou Ziri",
        "name_ar": "بولوغين بن زيري",
        "daira": "Bab El Oued",
        "postal_code": "16030",
        "lat": 36.80528,
        "lng": 3.04278
      },
      {
        "name": "Bordj El Bahri",
        "name_ar": "برج البحري",
        "daira": "Dar El Beïda",
        "postal_code": "16046",
        "lat": 36.779133,
        "lng": 3.22248
      },
      {
        "name": "Bordj El Kiffan",
        "name_ar": "برج الكيفان",
        "daira": "Dar El Beïda",
        "postal_code": "16031",
        "lat": 36.74871,
        "lng": 3.19249
      },
      {
        "name": "Bourouba",
        "name_ar": "بوروبة",
        "daira": "El Harrach",
        "postal_code": "16162",
        "lat": 36.711707,
        "lng": 3.1165
      },
      {
        "name": "Bouzareah",
        "name_ar": "بوزريعة",
        "daira": "Bouzareah",
        "postal_code": "16032",
        "lat": 36.79,
        "lng": 3.0177
      },
      {
        "name": "Casbah",
        "name_ar": "القصبة",
        "daira": "Bab El Oued",
        "postal_code": "16001",
        "lat": 36.784496,
        "lng": 3.058872
      },
      {
        "name": "Cheraga",
        "name_ar": "الشراقة",
        "daira": "Chéraga",
        "postal_code": "16014",
        "lat": 36.7677,
        "lng": 2.95924
      },
      {
        "name": "Dar El Beida",
        "name_ar": "الدار البيضاء",
        "daira": "Dar El Beïda",
        "postal_code": "16033",
        "lat": 36.7133,
        "lng": 3.2125
      },
      {
        "name": "Dely Ibrahim",
        "name_ar": "دالي ابراهيم",
        "daira": "Chéraga",
        "postal_code": "16047",
        "lat": 36.752851,
        "lng": 2.980056
      },
      {
        "name": "Djasr Kasentina",
        "name_ar": "جسر قسنطينة",
        "daira": "Bir Mourad Raïs",
        "postal_code": "16048",
        "lat": 36.6969,
        "lng": 3.058889
      },
      {
        "name": "Douira",
        "name_ar": "الدويرة",
        "daira": "Draria",
        "postal_code": "",
        "lat": 36.67,
        "lng": 2.927584
      },
      {
        "name": "Draria",
        "name_ar": "الدرارية",
        "daira": "Draria",
        "postal_code": "16050",
        "lat": 36.717286,
        "lng": 3.002562
      },
      {
        "name": "El Achour",
        "name_ar": "العاشور",
        "daira": "Draria",
        "postal_code": "16104",
        "lat": 36.728558,
        "lng": 2.982556
      },
      {
        "name": "El Biar",
        "name_ar": "الابيار",
        "daira": "Bouzareah",
        "postal_code": "16003",
        "lat": 36.7677,
        "lng": 3.0297
      },
      {
        "name": "El Harrach",
        "name_ar": "الحراش",
        "daira": "El Harrach",
        "postal_code": "16004",
        "lat": 36.7164,
        "lng": 3.715
      },
      {
        "name": "El Madania",
        "name_ar": "المدنية",
        "daira": "Sidi M'Hamed",
        "postal_code": "16015",
        "lat": 36.741179,
        "lng": 3.06889
      },
      {
        "name": "El Magharia",
        "name_ar": "المغارية",
        "daira": "Hussein Dey",
        "postal_code": "16053",
        "lat": 36.732,
        "lng": 3.111488
      },
      {
        "name": "El Marsa",
        "name_ar": "المرسى",
        "daira": "Dar El Beïda",
        "postal_code": "16115",
        "lat": 36.811125,
        "lng": 3.254722
      },
      {
        "name": "El Mouradia",
        "name_ar": "المرادية",
        "daira": "Sidi M'Hamed",
        "postal_code": "16035",
        "lat": 36.749768,
        "lng": 3.048856
      },
      {
        "name": "Hammamet",
        "name_ar": "الحمامات",
        "daira": "Chéraga",
        "postal_code": "16082",
        "lat": 36.804164,
        "lng": 3.0034
      },
      {
        "name": "Herraoua",
        "name_ar": "هراوة",
        "daira": "Rouïba",
        "postal_code": "",
        "lat": 36.77278,
        "lng": 3.253056
      },
      {
        "name": "Hussein Dey",
        "name_ar": "حسين داي",
        "daira": "Hussein Dey",
        "postal_code": "16005",
        "lat": 36.744147,
        "lng": 3.092008
      },
      {
        "name": "Hydra",
        "name_ar": "حيدرة",
        "daira": "Bir Mourad Raïs",
        "postal_code": "16016",
        "lat": 36.740951,
        "lng": 3.0251
      },
      {
        "name": "Khraissia",
        "name_ar": "الخرايسية",
        "daira": "Draria",
        "postal_code": "16091",
        "lat": 36.683333,
        "lng": 2.9821
      },
      {
        "name": "Kouba",
        "name_ar": "القبة",
        "daira": "Hussein Dey",
        "postal_code": "16006",
        "lat": 36.74413,
        "lng": 3.086474
      },
      {
        "name": "Les Eucalyptus",
        "name_ar": "الكاليتوس",
        "daira": "Baraki",
        "postal_code": "16057",
        "lat": 36.6664,
        "lng": 3.167926
      },
      {
        "name": "Maalma",
        "name_ar": "المعالمة",
        "daira": "Zéralda",
        "postal_code": "16093",
        "lat": 36.619436,
        "lng": 3.030556
      },
      {
        "name": "Mohamed Belouzdad",
        "name_ar": "محمد بلوزداد",
        "daira": "Hussein Dey",
        "postal_code": "",
        "lat": 36.75354,
        "lng": 3.06228
      },
      {
        "name": "Mohammadia",
        "name_ar": "المحمدية",
        "daira": "Dar El Beïda",
        "postal_code": "16058",
        "lat": 36.734953,
        "lng": 3.152869
      },
      {
        "name": "Oued Koriche",
        "name_ar": "وادي قريش",
        "daira": "Bab El Oued",
        "postal_code": "16041",
        "lat": 36.783631,
        "lng": 3.042698
      },
      {
        "name": "Oued Smar",
        "name_ar": "وادي السمار",
        "daira": "El Harrach",
        "postal_code": "16059",
        "lat": 36.74472,
        "lng": 3.172222
      },
      {
        "name": "Ouled Chebel",
        "name_ar": "اولاد شبل",
        "daira": "Birtouta",
        "postal_code": "16118",
        "lat": 36.604469,
        "lng": 2.987557
      },
      {
        "name": "Ouled Fayet",
        "name_ar": "اولاد فايت",
        "daira": "Chéraga",
        "postal_code": "16094",
        "lat": 36.7365,
        "lng": 2.949444
      },
      {
        "name": "Rahmania",
        "name_ar": "الرحمانية",
        "daira": "Zéralda",
        "postal_code": "16121",
        "lat": 36.680833,
        "lng": 2.906
      },
      {
        "name": "Rais Hamidou",
        "name_ar": "الرايس حميدو",
        "daira": "Bab El Oued",
        "postal_code": "16060",
        "lat": 36.81784,
        "lng": 3.18
      },
      {
        "name": "Reghaia",
        "name_ar": "رغاية",
        "daira": "Rouïba",
        "postal_code": "16036",
        "lat": 36.7359,
        "lng": 3.3402
      },
      {
        "name": "Rouiba",
        "name_ar": "الرويبة",
        "daira": "Rouïba",
        "postal_code": "16017",
        "lat": 36.725909,
        "lng": 3.28079
      },
      {
        "name": "Sehaoula",
        "name_ar": "السحاولة",
        "daira": "Bir Mourad Raïs",
        "postal_code": "",
        "lat": 36.7046,
        "lng": 3.008518
      },
      {
        "name": "Sidi M'hamed",
        "name_ar": "سيدي امحمد",
        "daira": "Sidi M'Hamed",
        "postal_code": "16007",
        "lat": 36.756337,
        "lng": 3.055116
      },
      {
        "name": "Sidi Moussa",
        "name_ar": "سيدي موسى",
        "daira": "Baraki",
        "postal_code": "16061",
        "lat": 36.605556,
        "lng": 3.088
      },
      {
        "name": "Souidania",
        "name_ar": "سويدانية",
        "daira": "Zéralda",
        "postal_code": "16097",
        "lat": 36.708983,
        "lng": 2.902617
      },
      {
        "name": "Staoueli",
        "name_ar": "سطاوالي",
        "daira": "Zéralda",
        "postal_code": "16062",
        "lat": 36.753333,
        "lng": 2.894444
      },
      {
        "name": "Tessala El Merdja",
        "name_ar": "تسالة المرجة",
        "daira": "Birtouta",
        "postal_code": "16099",
        "lat": 36.622256,
        "lng": 2.922589
      },
      {
        "name": "Zeralda",
        "name_ar": "زرالدة",
        "daira": "Zéralda",
        "postal_code": "16063",
        "lat": 36.694615,
        "lng": 2.827796
      }
    ]
  },
  {
    "code": "17",
    "name": "Djelfa",
    "name_ar": "الجلفة",
    "lat": 34.66667,
    "lng": 3.25,
    "communes": [
      {
        "name": "Ain Chouhada",
        "name_ar": "عين الشهداء",
        "daira": "El Idrissia",
        "postal_code": "17039",
        "lat": 34.241328,
        "lng": 2.522269
      },
      {
        "name": "Ain El Ibel",
        "name_ar": "عين الإبل",
        "daira": "Aïn El Ibel",
        "postal_code": "17011",
        "lat": 34.35472,
        "lng": 3.2239
      },
      {
        "name": "Ain Fekka",
        "name_ar": "عين فقه",
        "daira": "Sidi Laadjel",
        "postal_code": "",
        "lat": 35.433333,
        "lng": 3.583333
      },
      {
        "name": "Ain Maabed",
        "name_ar": "عين معبد",
        "daira": "Hassi Bahbah",
        "postal_code": "17025",
        "lat": 34.805689,
        "lng": 3.133333
      },
      {
        "name": "Aïn Oussera",
        "name_ar": "عين وسارة",
        "daira": "Aïn Oussera",
        "postal_code": "",
        "lat": 35.454265,
        "lng": 2.904444
      },
      {
        "name": "Amourah",
        "name_ar": "عمورة",
        "daira": "Amourah",
        "postal_code": "",
        "lat": 34.354444,
        "lng": 3.870833
      },
      {
        "name": "Benhar",
        "name_ar": "بنهار",
        "daira": "Aïn Oussera",
        "postal_code": "",
        "lat": 35.48594,
        "lng": 3.1081
      },
      {
        "name": "Benyagoub",
        "name_ar": "بن يعقوب",
        "daira": "Charef",
        "postal_code": "17026",
        "lat": 34.466492,
        "lng": 2.784077
      },
      {
        "name": "Birine",
        "name_ar": "بيرين",
        "daira": "Birine",
        "postal_code": "",
        "lat": 35.638311,
        "lng": 3.2869
      },
      {
        "name": "Bouira Lahdab",
        "name_ar": "بويرة الأحداب",
        "daira": "Bouira Lahdab",
        "postal_code": "",
        "lat": 35.243889,
        "lng": 3.75
      },
      {
        "name": "Charef",
        "name_ar": "الشارف",
        "daira": "Charef",
        "postal_code": "17015",
        "lat": 34.621,
        "lng": 2.80111
      },
      {
        "name": "Dar Chioukh",
        "name_ar": "دار الشيوخ",
        "daira": "Dar Chioukh",
        "postal_code": "17006",
        "lat": 34.9,
        "lng": 3.4833
      },
      {
        "name": "Deldoul",
        "name_ar": "دلدول",
        "daira": "Messaad",
        "postal_code": "",
        "lat": 34.20519,
        "lng": 3.25311
      },
      {
        "name": "Djelfa",
        "name_ar": "الجلفة",
        "daira": "Djelfa",
        "postal_code": "17000",
        "lat": 34.67279,
        "lng": 3.25
      },
      {
        "name": "Douis",
        "name_ar": "دويس",
        "daira": "El Idrissia",
        "postal_code": "17030",
        "lat": 34.368366,
        "lng": 2.701076
      },
      {
        "name": "El Guedid",
        "name_ar": "القديد",
        "daira": "Charef",
        "postal_code": "17019",
        "lat": 34.646501,
        "lng": 2.61625
      },
      {
        "name": "El Idrissia",
        "name_ar": "الادريسية",
        "daira": "El Idrissia",
        "postal_code": "17020",
        "lat": 34.454851,
        "lng": 2.524745
      },
      {
        "name": "El Khemis",
        "name_ar": "الخميس",
        "daira": "Birine",
        "postal_code": "",
        "lat": 35.5397,
        "lng": 2.515833
      },
      {
        "name": "Faidh El Botma",
        "name_ar": "فيض البطمة",
        "daira": "Sed Rahal",
        "postal_code": "",
        "lat": 34.527777,
        "lng": 3.781944
      },
      {
        "name": "Guernini",
        "name_ar": "قرنيني",
        "daira": "Aïn Oussera",
        "postal_code": "",
        "lat": 35.199703,
        "lng": 2.682896
      },
      {
        "name": "Guettara",
        "name_ar": "قطارة",
        "daira": "Messaad",
        "postal_code": "",
        "lat": 33.158611,
        "lng": 4.685277
      },
      {
        "name": "Had Sahary",
        "name_ar": "حد الصحاري",
        "daira": "Bouira Lahdab",
        "postal_code": "",
        "lat": 35.35056,
        "lng": 3.3609
      },
      {
        "name": "Hassi Bahbah",
        "name_ar": "حاسي بحبح",
        "daira": "Hassi Bahbah",
        "postal_code": "17002",
        "lat": 35.078229,
        "lng": 3.0297
      },
      {
        "name": "Hassi El Euch",
        "name_ar": "حاسي العش",
        "daira": "Hassi Bahbah",
        "postal_code": "17032",
        "lat": 35.152007,
        "lng": 3.248451
      },
      {
        "name": "Hassi Fedoul",
        "name_ar": "حاسي فدول",
        "daira": "Sidi Laadjel",
        "postal_code": "",
        "lat": 35.436666,
        "lng": 2.2142
      },
      {
        "name": "M'liliha",
        "name_ar": "مليليحة",
        "daira": "Dar Chioukh",
        "postal_code": "17057",
        "lat": 34.712288,
        "lng": 3.765454
      },
      {
        "name": "Messaad",
        "name_ar": "مسعد",
        "daira": "Messaad",
        "postal_code": "",
        "lat": 34.15429,
        "lng": 3.50309
      },
      {
        "name": "Moudjebara",
        "name_ar": "مجبارة",
        "daira": "Aïn El Ibel",
        "postal_code": "17058",
        "lat": 34.504001,
        "lng": 3.470436
      },
      {
        "name": "Oum Laadham",
        "name_ar": "أم العظام",
        "daira": "Selmana",
        "postal_code": "",
        "lat": 33.720277,
        "lng": 4.53056
      },
      {
        "name": "Sed Rahal",
        "name_ar": "سد الرحال",
        "daira": "Sed Rahal",
        "postal_code": "",
        "lat": 33.948333,
        "lng": 3.231111
      },
      {
        "name": "Selmana",
        "name_ar": "سلمانة",
        "daira": "Selmana",
        "postal_code": "",
        "lat": 34.164404,
        "lng": 3.562012
      },
      {
        "name": "Sidi Baizid",
        "name_ar": "سيدي بايزيد",
        "daira": "Dar Chioukh",
        "postal_code": "17064",
        "lat": 35.058055,
        "lng": 3.430556
      },
      {
        "name": "Sidi Laadjel",
        "name_ar": "سيدي لعجال",
        "daira": "Sidi Laadjel",
        "postal_code": "",
        "lat": 35.438055,
        "lng": 2.5
      },
      {
        "name": "Taadmit",
        "name_ar": "تعظميت",
        "daira": "Aïn El Ibel",
        "postal_code": "17037",
        "lat": 34.286667,
        "lng": 2.988611
      },
      {
        "name": "Zaafrane",
        "name_ar": "زعفران",
        "daira": "Hassi Bahbah",
        "postal_code": "17038",
        "lat": 34.850833,
        "lng": 2.856944
      },
      {
        "name": "Zaccar",
        "name_ar": "زكار",
        "daira": "Aïn El Ibel",
        "postal_code": "17065",
        "lat": 34.430832,
        "lng": 3.327222
      }
    ]
  },
  {
    "code": "18",
    "name": "Jijel",
    "name_ar": "جيجل",
    "lat": 36.81667,
    "lng": 5.75,
    "communes": [
      {
        "name": "Bordj T'har",
        "name_ar": "برج الطهر",
        "daira": "Chekfa",
        "postal_code": "18041",
        "lat": 36.7558,
        "lng": 6.029542
      },
      {
        "name": "Boudria Beniyadjis",
        "name_ar": "بودريعة بني ياجيس",
        "daira": "Djimla",
        "postal_code": "18025",
        "lat": 36.599166,
        "lng": 4.9739
      },
      {
        "name": "Bouraoui Belhadef",
        "name_ar": "بوراوي بلهادف",
        "daira": "El Ancer",
        "postal_code": "18023",
        "lat": 36.697724,
        "lng": 6.104334
      },
      {
        "name": "Boussif Ouled Askeur",
        "name_ar": "بوسيف أولاد عسكر",
        "daira": "Taher",
        "postal_code": "18036",
        "lat": 36.6383,
        "lng": 6.019167
      },
      {
        "name": "Chahna",
        "name_ar": "الشحنة",
        "daira": "Taher",
        "postal_code": "18027",
        "lat": 36.679374,
        "lng": 5.957203
      },
      {
        "name": "Chekfa",
        "name_ar": "الشقفة",
        "daira": "Chekfa",
        "postal_code": "18003",
        "lat": 36.7714,
        "lng": 5.9594
      },
      {
        "name": "Djemaa Beni Habibi",
        "name_ar": "الجمعة بني حبيبي",
        "daira": "El Ancer",
        "postal_code": "18029",
        "lat": 36.7091,
        "lng": 6.1294
      },
      {
        "name": "Djimla",
        "name_ar": "جيملة",
        "daira": "Djimla",
        "postal_code": "18031",
        "lat": 36.58,
        "lng": 5.884167
      },
      {
        "name": "El Ancer",
        "name_ar": "العنصر",
        "daira": "El Ancer",
        "postal_code": "18004",
        "lat": 36.7989,
        "lng": 6.15721
      },
      {
        "name": "El Aouana",
        "name_ar": "العوانة",
        "daira": "El Aouana",
        "postal_code": "18005",
        "lat": 36.772726,
        "lng": 5.61
      },
      {
        "name": "El Kennar Nouchfi",
        "name_ar": "القنار نشفي",
        "daira": "Chekfa",
        "postal_code": "18030",
        "lat": 36.82568,
        "lng": 5.962771
      },
      {
        "name": "El Milia",
        "name_ar": "الميلية",
        "daira": "El Milia",
        "postal_code": "18001",
        "lat": 36.750728,
        "lng": 6.2725
      },
      {
        "name": "Emir Abdelkader",
        "name_ar": "الامير عبد القادر",
        "daira": "Taher",
        "postal_code": "18010",
        "lat": 36.751944,
        "lng": 5.848611
      },
      {
        "name": "Erraguene Souissi",
        "name_ar": "أراقن سويسي",
        "daira": "Ziama Mansouriah",
        "postal_code": "",
        "lat": 36.58616,
        "lng": 5.58065
      },
      {
        "name": "Ghebala",
        "name_ar": "غبالة",
        "daira": "Settara",
        "postal_code": "18045",
        "lat": 36.628455,
        "lng": 6.3283
      },
      {
        "name": "Jijel",
        "name_ar": "جيجل",
        "daira": "Jijel",
        "postal_code": "18000",
        "lat": 36.82055,
        "lng": 5.7667
      },
      {
        "name": "Kaous",
        "name_ar": "قاوس",
        "daira": "Texenna",
        "postal_code": "18015",
        "lat": 36.7718,
        "lng": 5.813617
      },
      {
        "name": "Khiri Oued Adjoul",
        "name_ar": "خيري واد عجول",
        "daira": "El Ancer",
        "postal_code": "18024",
        "lat": 36.81,
        "lng": 6.14
      },
      {
        "name": "Oudjana",
        "name_ar": "وجانة",
        "daira": "Taher",
        "postal_code": "18047",
        "lat": 36.6067,
        "lng": 5.888154
      },
      {
        "name": "Ouled Rabah",
        "name_ar": "أولاد رابح",
        "daira": "Sidi Maarouf",
        "postal_code": "18046",
        "lat": 36.568,
        "lng": 6.1677
      },
      {
        "name": "Ouled Yahia Khadrouch",
        "name_ar": "أولاد يحيى خدروش",
        "daira": "El Milia",
        "postal_code": "18021",
        "lat": 36.717222,
        "lng": 6.200833
      },
      {
        "name": "Selma Benziada",
        "name_ar": "سلمى بن زيادة",
        "daira": "El Aouana",
        "postal_code": "18049",
        "lat": 36.627222,
        "lng": 5.6483
      },
      {
        "name": "Settara",
        "name_ar": "السطارة",
        "daira": "Settara",
        "postal_code": "18016",
        "lat": 36.719444,
        "lng": 6.335556
      },
      {
        "name": "Sidi Abdelaziz",
        "name_ar": "سيدي عبد العزيز",
        "daira": "Chekfa",
        "postal_code": "18017",
        "lat": 36.85,
        "lng": 6.05
      },
      {
        "name": "Sidi Marouf",
        "name_ar": "سيدي معروف",
        "daira": "Sidi Maarouf",
        "postal_code": "18018",
        "lat": 36.6475,
        "lng": 6.2725
      },
      {
        "name": "Taher",
        "name_ar": "الطاهير",
        "daira": "Taher",
        "postal_code": "18002",
        "lat": 36.763,
        "lng": 5.8979
      },
      {
        "name": "Texenna",
        "name_ar": "تاكسنة",
        "daira": "Texenna",
        "postal_code": "18006",
        "lat": 36.660556,
        "lng": 5.791
      },
      {
        "name": "Ziama Mansouriah",
        "name_ar": "زيامة منصورية",
        "daira": "Ziama Mansouriah",
        "postal_code": "18007",
        "lat": 36.6737,
        "lng": 5.48119
      }
    ]
  },
  {
    "code": "19",
    "name": "Sétif",
    "name_ar": "سطيف",
    "lat": 36.19,
    "lng": 5.41,
    "communes": [
      {
        "name": "Ain Abessa",
        "name_ar": "عين عباسة",
        "daira": "Aïn Arnat",
        "postal_code": "19016",
        "lat": 36.3,
        "lng": 5.295
      },
      {
        "name": "Ain Arnat",
        "name_ar": "عين أرنات",
        "daira": "Aïn Arnat",
        "postal_code": "19017",
        "lat": 36.1868,
        "lng": 5.31347
      },
      {
        "name": "Ain Azel",
        "name_ar": "عين أزال",
        "daira": "Aïn Azel",
        "postal_code": "19007",
        "lat": 35.818475,
        "lng": 5.5219
      },
      {
        "name": "Ain El Kebira",
        "name_ar": "عين الكبيرة",
        "daira": "Aïn El Kebira",
        "postal_code": "19008",
        "lat": 36.3647,
        "lng": 5.5019
      },
      {
        "name": "Ain Lahdjar",
        "name_ar": "عين الحجر",
        "daira": "Aïn Azel",
        "postal_code": "19018",
        "lat": 35.938611,
        "lng": 5.539167
      },
      {
        "name": "Ain Oulmene",
        "name_ar": "عين ولمان",
        "daira": "Aïn Oulmene",
        "postal_code": "19002",
        "lat": 35.916667,
        "lng": 5.29604
      },
      {
        "name": "Ain-Legradj",
        "name_ar": "عين لقراج",
        "daira": "Beni Ourtilane",
        "postal_code": "19082",
        "lat": 36.409667,
        "lng": 4.891
      },
      {
        "name": "Ain-Roua",
        "name_ar": "عين الروى",
        "daira": "Bougaa",
        "postal_code": "19019",
        "lat": 36.31299,
        "lng": 5.195355
      },
      {
        "name": "Ain-Sebt",
        "name_ar": "عين السبت",
        "daira": "Beni Aziz",
        "postal_code": "19033",
        "lat": 36.48339,
        "lng": 5.711
      },
      {
        "name": "Ait Naoual Mezada",
        "name_ar": "أيت نوال مزادة",
        "daira": "Bouandas",
        "postal_code": "19076",
        "lat": 36.54217,
        "lng": 5.09004
      },
      {
        "name": "Ait-Tizi",
        "name_ar": "ايت تيزي",
        "daira": "Bouandas",
        "postal_code": "19077",
        "lat": 36.1247,
        "lng": 5.2967
      },
      {
        "name": "Amoucha",
        "name_ar": "عموشة",
        "daira": "Amoucha",
        "postal_code": "19009",
        "lat": 36.38735,
        "lng": 5.4137
      },
      {
        "name": "Babor",
        "name_ar": "بابور",
        "daira": "Babor",
        "postal_code": "19020",
        "lat": 36.48994,
        "lng": 5.5399
      },
      {
        "name": "Bazer-Sakra",
        "name_ar": "بازر سكرة",
        "daira": "El Eulma",
        "postal_code": "19036",
        "lat": 36.11778,
        "lng": 5.70972
      },
      {
        "name": "Beidha Bordj",
        "name_ar": "بيضاء برج",
        "daira": "Aïn Azel",
        "postal_code": "19021",
        "lat": 35.891667,
        "lng": 5.66861
      },
      {
        "name": "Bellaa",
        "name_ar": "بلاعة",
        "daira": "Bir El Arch",
        "postal_code": "19022",
        "lat": 36.2025,
        "lng": 5.853611
      },
      {
        "name": "Beni Chebana",
        "name_ar": "بني شبانة",
        "daira": "Beni Ourtilane",
        "postal_code": "19031",
        "lat": 36.468333,
        "lng": 4.8683
      },
      {
        "name": "Beni Fouda",
        "name_ar": "بني فودة",
        "daira": "Djemila",
        "postal_code": "19023",
        "lat": 36.286111,
        "lng": 5.60722
      },
      {
        "name": "Beni Ourtilane",
        "name_ar": "بني ورتيلان",
        "daira": "Beni Ourtilane",
        "postal_code": "19011",
        "lat": 36.442222,
        "lng": 4.9
      },
      {
        "name": "Beni Oussine",
        "name_ar": "بني وسين",
        "daira": "Bougaa",
        "postal_code": "19037",
        "lat": 36.27222,
        "lng": 5.092008
      },
      {
        "name": "Beni-Aziz",
        "name_ar": "بني عزيز",
        "daira": "Beni Aziz",
        "postal_code": "19010",
        "lat": 36.464832,
        "lng": 5.656312
      },
      {
        "name": "Beni-Mouhli",
        "name_ar": "بني موحلي",
        "daira": "Beni Ourtilane",
        "postal_code": "19038",
        "lat": 36.50739,
        "lng": 4.91503
      },
      {
        "name": "Bir Haddada",
        "name_ar": "بئر حدادة",
        "daira": "Aïn Azel",
        "postal_code": "19039",
        "lat": 35.962777,
        "lng": 5.380213
      },
      {
        "name": "Bir-El-Arch",
        "name_ar": "بئر العرش",
        "daira": "Bir El Arch",
        "postal_code": "19024",
        "lat": 36.10161,
        "lng": 5.793201
      },
      {
        "name": "Bouandas",
        "name_ar": "بوعنداس",
        "daira": "Bouandas",
        "postal_code": "19012",
        "lat": 36.494722,
        "lng": 5.1019
      },
      {
        "name": "Bougaa",
        "name_ar": "بوقاعة",
        "daira": "Bougaa",
        "postal_code": "19003",
        "lat": 36.33293,
        "lng": 5.08843
      },
      {
        "name": "Bousselam",
        "name_ar": "بوسلام",
        "daira": "Bouandas",
        "postal_code": "19052",
        "lat": 36.498889,
        "lng": 5.0378
      },
      {
        "name": "Boutaleb",
        "name_ar": "بوطالب",
        "daira": "Salah Bey",
        "postal_code": "19092",
        "lat": 35.66024,
        "lng": 5.32103
      },
      {
        "name": "Dehamcha",
        "name_ar": "الدهامشة",
        "daira": "Aïn El Kebira",
        "postal_code": "19041",
        "lat": 36.3821,
        "lng": 5.5953
      },
      {
        "name": "Djemila",
        "name_ar": "جميلة",
        "daira": "Djemila",
        "postal_code": "19025",
        "lat": 36.31351,
        "lng": 5.73697
      },
      {
        "name": "Draa-Kebila",
        "name_ar": "ذراع قبيلة",
        "daira": "Hammam Guergour",
        "postal_code": "19029",
        "lat": 36.4629,
        "lng": 4.99551
      },
      {
        "name": "El Eulma",
        "name_ar": "العلمة",
        "daira": "El Eulma",
        "postal_code": "19001",
        "lat": 36.156449,
        "lng": 5.69016
      },
      {
        "name": "El Ouricia",
        "name_ar": "أوريسيا",
        "daira": "Aïn Arnat",
        "postal_code": "19047",
        "lat": 36.292452,
        "lng": 5.4
      },
      {
        "name": "El-Ouldja",
        "name_ar": "الولجة",
        "daira": "Bir El Arch",
        "postal_code": "19046",
        "lat": 36.06371,
        "lng": 5.95369
      },
      {
        "name": "Guellal",
        "name_ar": "قلال",
        "daira": "Aïn Oulmene",
        "postal_code": "19050",
        "lat": 36.0353,
        "lng": 5.328
      },
      {
        "name": "Guelta Zerka",
        "name_ar": "قلتة زرقاء",
        "daira": "El Eulma",
        "postal_code": "19122",
        "lat": 36.204592,
        "lng": 5.677351
      },
      {
        "name": "Guenzet",
        "name_ar": "قنزات",
        "daira": "Guenzet",
        "postal_code": "19026",
        "lat": 36.31667,
        "lng": 4.833333
      },
      {
        "name": "Guidjel",
        "name_ar": "قجال",
        "daira": "Guidjel",
        "postal_code": "19027",
        "lat": 36.19119,
        "lng": 5.52999
      },
      {
        "name": "Hamam Soukhna",
        "name_ar": "حمام السخنة",
        "daira": "Hammam Soukhna",
        "postal_code": "19059",
        "lat": 35.976944,
        "lng": 5.808889
      },
      {
        "name": "Hamma",
        "name_ar": "الحامة",
        "daira": "Salah Bey",
        "postal_code": "19106",
        "lat": 35.680556,
        "lng": 5.37277
      },
      {
        "name": "Hammam Guergour",
        "name_ar": "حمام قرقور",
        "daira": "Hammam Guergour",
        "postal_code": "19051",
        "lat": 36.32189,
        "lng": 5.053523
      },
      {
        "name": "Harbil",
        "name_ar": "حربيل",
        "daira": "Guenzet",
        "postal_code": "19032",
        "lat": 36.32488,
        "lng": 4.92641
      },
      {
        "name": "Kasr El Abtal",
        "name_ar": "قصر الابطال",
        "daira": "Aïn Oulmene",
        "postal_code": "19054",
        "lat": 35.974167,
        "lng": 5.2881
      },
      {
        "name": "Maaouia",
        "name_ar": "معاوية",
        "daira": "Beni Aziz",
        "postal_code": "19055",
        "lat": 36.38899,
        "lng": 5.70995
      },
      {
        "name": "Maouaklane",
        "name_ar": "ماوكلان",
        "daira": "Maoklane",
        "postal_code": "19028",
        "lat": 36.3968,
        "lng": 5.0752
      },
      {
        "name": "Mezloug",
        "name_ar": "مزلوق",
        "daira": "Aïn Arnat",
        "postal_code": "19056",
        "lat": 36.10778,
        "lng": 5.4
      },
      {
        "name": "Oued El Bared",
        "name_ar": "واد البارد",
        "daira": "Amoucha",
        "postal_code": "19115",
        "lat": 36.472317,
        "lng": 5.4022
      },
      {
        "name": "Ouled Addouane",
        "name_ar": "أولاد عدوان",
        "daira": "Aïn El Kebira",
        "postal_code": "19053",
        "lat": 36.3401,
        "lng": 5.336022
      },
      {
        "name": "Ouled Sabor",
        "name_ar": "أولاد صابر",
        "daira": "Guidjel",
        "postal_code": "19120",
        "lat": 36.16561,
        "lng": 5.524
      },
      {
        "name": "Ouled Si Ahmed",
        "name_ar": "أولاد سي أحمد",
        "daira": "Aïn Oulmene",
        "postal_code": "19121",
        "lat": 35.901111,
        "lng": 5.16406
      },
      {
        "name": "Ouled Tebben",
        "name_ar": "أولاد تبان",
        "daira": "Salah Bey",
        "postal_code": "19030",
        "lat": 35.7875,
        "lng": 5.122361
      },
      {
        "name": "Rosfa",
        "name_ar": "الرصفة",
        "daira": "Salah Bey",
        "postal_code": "19060",
        "lat": 35.810277,
        "lng": 5.265277
      },
      {
        "name": "Salah Bey",
        "name_ar": "صالح باي",
        "daira": "Salah Bey",
        "postal_code": "19013",
        "lat": 35.855,
        "lng": 5.291
      },
      {
        "name": "Serdj-El-Ghoul",
        "name_ar": "سرج الغول",
        "daira": "Babor",
        "postal_code": "19086",
        "lat": 36.478,
        "lng": 5.58
      },
      {
        "name": "Setif",
        "name_ar": "سطيف",
        "daira": "Sétif",
        "postal_code": "19000",
        "lat": 36.19112,
        "lng": 5.415087
      },
      {
        "name": "Tachouda",
        "name_ar": "تاشودة",
        "daira": "Bir El Arch",
        "postal_code": "19125",
        "lat": 36.266473,
        "lng": 5.713055
      },
      {
        "name": "Tala-Ifacene",
        "name_ar": "تالة إيفاسن",
        "daira": "Maoklane",
        "postal_code": "19069",
        "lat": 36.458333,
        "lng": 5.088889
      },
      {
        "name": "Taya",
        "name_ar": "الطاية",
        "daira": "Hammam Soukhna",
        "postal_code": "19067",
        "lat": 35.96,
        "lng": 5.9675
      },
      {
        "name": "Tella",
        "name_ar": "التلة",
        "daira": "Hammam Soukhna",
        "postal_code": "19087",
        "lat": 35.93794,
        "lng": 5.7179
      },
      {
        "name": "Tizi N'bechar",
        "name_ar": "تيزي نبشار",
        "daira": "Amoucha",
        "postal_code": "19068",
        "lat": 36.529,
        "lng": 5.36
      }
    ]
  },
  {
    "code": "20",
    "name": "Saïda",
    "name_ar": "سعيدة",
    "lat": 34.833,
    "lng": 0.15,
    "communes": [
      {
        "name": "Ain El Hadjar",
        "name_ar": "عين الحجر",
        "daira": "Aïn El Hadjar",
        "postal_code": "20001",
        "lat": 34.75846,
        "lng": 0.1444
      },
      {
        "name": "Ain Sekhouna",
        "name_ar": "عين السخونة",
        "daira": "El Hassasna",
        "postal_code": "20009",
        "lat": 34.50446,
        "lng": 0.84412
      },
      {
        "name": "Ain Soltane",
        "name_ar": "عين السلطان",
        "daira": "Ouled Brahim",
        "postal_code": "20029",
        "lat": 34.96647,
        "lng": 0.3075
      },
      {
        "name": "Doui Thabet",
        "name_ar": "دوي ثابت",
        "daira": "Youb",
        "postal_code": "20023",
        "lat": 34.89306,
        "lng": -0.0842
      },
      {
        "name": "El Hassasna",
        "name_ar": "الحساسنة",
        "daira": "El Hassasna",
        "postal_code": "20003",
        "lat": 34.824167,
        "lng": 0.1
      },
      {
        "name": "Hounet",
        "name_ar": "هونت",
        "daira": "Sidi Boubekeur",
        "postal_code": "20025",
        "lat": 35.1108,
        "lng": -0.15
      },
      {
        "name": "Maamora",
        "name_ar": "المعمورة",
        "daira": "El Hassasna",
        "postal_code": "20013",
        "lat": 34.681667,
        "lng": 0.15
      },
      {
        "name": "Moulay Larbi",
        "name_ar": "مولاي العربي",
        "daira": "Aïn El Hadjar",
        "postal_code": "20014",
        "lat": 34.648611,
        "lng": 0.0167
      },
      {
        "name": "Ouled Brahim",
        "name_ar": "أولاد إبراهيم",
        "daira": "Ouled Brahim",
        "postal_code": "20002",
        "lat": 34.99,
        "lng": 0.4772
      },
      {
        "name": "Ouled Khaled",
        "name_ar": "أولاد خالد",
        "daira": "Sidi Boubekeur",
        "postal_code": "20004",
        "lat": 34.876667,
        "lng": 0.152778
      },
      {
        "name": "Saida",
        "name_ar": "سعيدة",
        "daira": "Saïda",
        "postal_code": "20000",
        "lat": 34.833333,
        "lng": 0.15
      },
      {
        "name": "Sidi Ahmed",
        "name_ar": "سيدي احمد",
        "daira": "Aïn El Hadjar",
        "postal_code": "20012",
        "lat": 34.55,
        "lng": 0.259722
      },
      {
        "name": "Sidi Amar",
        "name_ar": "سيدي عمر",
        "daira": "Sidi Boubekeur",
        "postal_code": "20019",
        "lat": 35.025278,
        "lng": 0.1015
      },
      {
        "name": "Sidi Boubekeur",
        "name_ar": "سيدي بوبكر",
        "daira": "Sidi Boubekeur",
        "postal_code": "20007",
        "lat": 35.028889,
        "lng": 0.053659
      },
      {
        "name": "Tircine",
        "name_ar": "تيرسين",
        "daira": "Ouled Brahim",
        "postal_code": "20035",
        "lat": 34.901388,
        "lng": 0.5547
      },
      {
        "name": "Youb",
        "name_ar": "يوب",
        "daira": "Youb",
        "postal_code": "20008",
        "lat": 34.92186,
        "lng": -0.208133
      }
    ]
  },
  {
    "code": "21",
    "name": "Skikda",
    "name_ar": "سكيكدة",
    "lat": 36.86667,
    "lng": 6.9,
    "communes": [
      {
        "name": "Ain Bouziane",
        "name_ar": "عين بوزيان",
        "daira": "Sidi Mezghiche",
        "postal_code": "21031",
        "lat": 36.602407,
        "lng": 6.751389
      },
      {
        "name": "Ain Charchar",
        "name_ar": "عين شرشار",
        "daira": "Azzaba",
        "postal_code": "21006",
        "lat": 36.733676,
        "lng": 7.22349
      },
      {
        "name": "Ain Kechra",
        "name_ar": "عين قشرة",
        "daira": "Aïn Kechra",
        "postal_code": "21007",
        "lat": 36.7483,
        "lng": 6.434977
      },
      {
        "name": "Ain Zouit",
        "name_ar": "عين زويت",
        "daira": "El Hadaiek",
        "postal_code": "21051",
        "lat": 36.890278,
        "lng": 6.7856
      },
      {
        "name": "Azzaba",
        "name_ar": "عزابة",
        "daira": "Azzaba",
        "postal_code": "21001",
        "lat": 36.73944,
        "lng": 7.10528
      },
      {
        "name": "Bekkouche Lakhdar",
        "name_ar": "بكوش لخضر",
        "daira": "Ben Azzouz",
        "postal_code": "21009",
        "lat": 36.791944,
        "lng": 7.30625
      },
      {
        "name": "Ben Azzouz",
        "name_ar": "بن عزوز",
        "daira": "Ben Azzouz",
        "postal_code": "21010",
        "lat": 36.46,
        "lng": 7.057
      },
      {
        "name": "Beni Bechir",
        "name_ar": "بني بشير",
        "daira": "Ramdane Djamel",
        "postal_code": "21033",
        "lat": 36.783333,
        "lng": 6.933333
      },
      {
        "name": "Beni Oulbane",
        "name_ar": "بني ولبان",
        "daira": "Sidi Mezghiche",
        "postal_code": "21011",
        "lat": 36.683333,
        "lng": 6.6389
      },
      {
        "name": "Beni Zid",
        "name_ar": "بني زيد",
        "daira": "Collo",
        "postal_code": "21016",
        "lat": 36.808056,
        "lng": 6.5056
      },
      {
        "name": "Bin El Ouiden",
        "name_ar": "بين الويدان",
        "daira": "Tamalous",
        "postal_code": "21052",
        "lat": 36.8079,
        "lng": 6.5656
      },
      {
        "name": "Bouchetata",
        "name_ar": "بوشطاطة",
        "daira": "El Hadaiek",
        "postal_code": "21053",
        "lat": 36.7938,
        "lng": 6.79722
      },
      {
        "name": "Cheraia",
        "name_ar": "الشرايع",
        "daira": "Collo",
        "postal_code": "21036",
        "lat": 37.00194,
        "lng": 6.497225
      },
      {
        "name": "Collo",
        "name_ar": "القل",
        "daira": "Collo",
        "postal_code": "21002",
        "lat": 37.0072,
        "lng": 6.5609
      },
      {
        "name": "Djendel Saadi Mohamed",
        "name_ar": "جندل سعدي محمد",
        "daira": "Azzaba",
        "postal_code": "21037",
        "lat": 36.78,
        "lng": 7.1709
      },
      {
        "name": "El Arrouch",
        "name_ar": "الحروش",
        "daira": "El Harrouch",
        "postal_code": "21003",
        "lat": 36.6531,
        "lng": 6.64917
      },
      {
        "name": "El Ghedir",
        "name_ar": "الغدير",
        "daira": "Azzaba",
        "postal_code": "21057",
        "lat": 36.688333,
        "lng": 6.97778
      },
      {
        "name": "El Hadaiek",
        "name_ar": "الحدائق",
        "daira": "El Hadaiek",
        "postal_code": "21015",
        "lat": 36.825981,
        "lng": 6.887379
      },
      {
        "name": "El Marsa",
        "name_ar": "المرسى",
        "daira": "Ben Azzouz",
        "postal_code": "21058",
        "lat": 37.03,
        "lng": 7.2531
      },
      {
        "name": "Emjez Edchich",
        "name_ar": "مجاز الدشيش",
        "daira": "El Harrouch",
        "postal_code": "21017",
        "lat": 36.703333,
        "lng": 6.7458
      },
      {
        "name": "Es Sebt",
        "name_ar": "السبت",
        "daira": "Azzaba",
        "postal_code": "21018",
        "lat": 36.802,
        "lng": 7.077427
      },
      {
        "name": "Filfila",
        "name_ar": "فلفلة",
        "daira": "Skikda",
        "postal_code": "21042",
        "lat": 36.882804,
        "lng": 7.082116
      },
      {
        "name": "Hammadi Krouma",
        "name_ar": "حمادي كرومة",
        "daira": "Skikda",
        "postal_code": "21038",
        "lat": 36.844,
        "lng": 6.89262
      },
      {
        "name": "Kanoua",
        "name_ar": "قنواع",
        "daira": "Zitouna",
        "postal_code": "21062",
        "lat": 37.0375,
        "lng": 6.405556
      },
      {
        "name": "Kerkara",
        "name_ar": "الكركرة",
        "daira": "Tamalous",
        "postal_code": "21019",
        "lat": 36.929,
        "lng": 6.586
      },
      {
        "name": "Khenag Maoune",
        "name_ar": "خناق مايو",
        "daira": "Ouled Attia",
        "postal_code": "21063",
        "lat": 36.780278,
        "lng": 6.1386
      },
      {
        "name": "Oued Zhour",
        "name_ar": "وادي الزهور",
        "daira": "Ouled Attia",
        "postal_code": "21040",
        "lat": 36.92214,
        "lng": 6.315556
      },
      {
        "name": "Ouldja Boulbalout",
        "name_ar": "الولجة بولبلوط",
        "daira": "Aïn Kechra",
        "postal_code": "21059",
        "lat": 36.786111,
        "lng": 6.373055
      },
      {
        "name": "Ouled Attia",
        "name_ar": "أولاد عطية",
        "daira": "Ouled Attia",
        "postal_code": "21012",
        "lat": 36.994444,
        "lng": 6.341389
      },
      {
        "name": "Ouled Habbaba",
        "name_ar": "أولاد حبابة",
        "daira": "El Harrouch",
        "postal_code": "21043",
        "lat": 36.503333,
        "lng": 6.9575
      },
      {
        "name": "Oum Toub",
        "name_ar": "أم الطوب",
        "daira": "Oum Toub",
        "postal_code": "21020",
        "lat": 36.72611,
        "lng": 6.58
      },
      {
        "name": "Ramdane Djamel",
        "name_ar": "رمضان جمال",
        "daira": "Ramdane Djamel",
        "postal_code": "21004",
        "lat": 36.755252,
        "lng": 6.892719
      },
      {
        "name": "Salah Bouchaour",
        "name_ar": "صالح بو الشعور",
        "daira": "El Harrouch",
        "postal_code": "21022",
        "lat": 36.740543,
        "lng": 6.87296
      },
      {
        "name": "Sidi Mezghiche",
        "name_ar": "سيدي مزغيش",
        "daira": "Sidi Mezghiche",
        "postal_code": "21023",
        "lat": 36.683333,
        "lng": 6.7167
      },
      {
        "name": "Skikda",
        "name_ar": "سكيكدة",
        "daira": "Skikda",
        "postal_code": "21000",
        "lat": 36.87617,
        "lng": 6.9
      },
      {
        "name": "Tamalous",
        "name_ar": "تمالوس",
        "daira": "Tamalous",
        "postal_code": "21005",
        "lat": 36.835754,
        "lng": 6.6417
      },
      {
        "name": "Zerdezas",
        "name_ar": "زردازة",
        "daira": "El Harrouch",
        "postal_code": "21047",
        "lat": 36.597811,
        "lng": 6.896718
      },
      {
        "name": "Zitouna",
        "name_ar": "الزيتونة",
        "daira": "Zitouna",
        "postal_code": "21028",
        "lat": 36.988073,
        "lng": 6.46049
      }
    ]
  },
  {
    "code": "22",
    "name": "Sidi Bel Abbès",
    "name_ar": "سيدي بلعباس",
    "lat": 35.19389,
    "lng": -0.64139,
    "communes": [
      {
        "name": "Ain El Berd",
        "name_ar": "عين البرد",
        "daira": "Aïn El Berd",
        "postal_code": "22022",
        "lat": 35.363949,
        "lng": -0.51278
      },
      {
        "name": "Ain Kada",
        "name_ar": "عين قادة",
        "daira": "Sidi Ali Boussidi",
        "postal_code": "22035",
        "lat": 35.136949,
        "lng": -0.855872
      },
      {
        "name": "Ain Thrid",
        "name_ar": "عين الثريد",
        "daira": "Tessala",
        "postal_code": "22037",
        "lat": 35.284722,
        "lng": -0.675833
      },
      {
        "name": "Ain Tindamine",
        "name_ar": "عين تندمين",
        "daira": "Moulay Slissen",
        "postal_code": "22036",
        "lat": 34.689722,
        "lng": -0.720555
      },
      {
        "name": "Ain- Adden",
        "name_ar": "عين أدن",
        "daira": "Sfisef",
        "postal_code": "22034",
        "lat": 35.329444,
        "lng": -0.26139
      },
      {
        "name": "Amarnas",
        "name_ar": "العمارنة",
        "daira": "Sidi Lahcene",
        "postal_code": "22074",
        "lat": 35.135556,
        "lng": -0.62278
      },
      {
        "name": "Bedrabine El Mokrani",
        "name_ar": "بضرابين المقراني",
        "daira": "Ben Badis",
        "postal_code": "22038",
        "lat": 35.008889,
        "lng": -0.8503
      },
      {
        "name": "Belarbi",
        "name_ar": "بلعربي",
        "daira": "Mostefa Ben Brahim",
        "postal_code": "22023",
        "lat": 35.15,
        "lng": 0.15
      },
      {
        "name": "Ben Badis",
        "name_ar": "بن باديس",
        "daira": "Ben Badis",
        "postal_code": "22004",
        "lat": 34.95234,
        "lng": -0.91609
      },
      {
        "name": "Benachiba Chelia",
        "name_ar": "بن عشيبة شلية",
        "daira": "Tenira",
        "postal_code": "22040",
        "lat": 34.9634,
        "lng": -0.6145
      },
      {
        "name": "Bir El Hammam",
        "name_ar": "بئر الحمام",
        "daira": "Marhoum",
        "postal_code": "22041",
        "lat": 34.418889,
        "lng": -0.49923
      },
      {
        "name": "Boudjebaa El Bordj",
        "name_ar": "بوجبهة البرج",
        "daira": "Sfisef",
        "postal_code": "22043",
        "lat": 35.34988,
        "lng": -0.3247
      },
      {
        "name": "Boukhanefis",
        "name_ar": "بوخنفيس",
        "daira": "Sidi Ali Benyoub",
        "postal_code": "22008",
        "lat": 35.066111,
        "lng": -0.723333
      },
      {
        "name": "Chetouane Belaila",
        "name_ar": "شيطوان البلايلة",
        "daira": "Ben Badis",
        "postal_code": "22039",
        "lat": 34.95,
        "lng": -0.8364
      },
      {
        "name": "Dhaya",
        "name_ar": "الضاية",
        "daira": "Telagh",
        "postal_code": "22009",
        "lat": 34.67585,
        "lng": -0.6208
      },
      {
        "name": "El Hacaiba",
        "name_ar": "الحصيبة",
        "daira": "Moulay Slissen",
        "postal_code": "22047",
        "lat": 34.7,
        "lng": -0.7667
      },
      {
        "name": "Hassi Dahou",
        "name_ar": "حاسي دحو",
        "daira": "Tenira",
        "postal_code": "22042",
        "lat": 35.071944,
        "lng": -0.5456
      },
      {
        "name": "Hassi Zahana",
        "name_ar": "حاسي زهانة",
        "daira": "Ben Badis",
        "postal_code": "22010",
        "lat": 34.9876,
        "lng": -0.89
      },
      {
        "name": "Lamtar",
        "name_ar": "لمطار",
        "daira": "Sidi Ali Boussidi",
        "postal_code": "22024",
        "lat": 35.070555,
        "lng": -0.798056
      },
      {
        "name": "M'cid",
        "name_ar": "مسيد",
        "daira": "Sfisef",
        "postal_code": "22052",
        "lat": 35.116589,
        "lng": 0.15
      },
      {
        "name": "Makedra",
        "name_ar": "مكدرة",
        "daira": "Aïn El Berd",
        "postal_code": "22051",
        "lat": 35.440833,
        "lng": -0.4314
      },
      {
        "name": "Marhoum",
        "name_ar": "مرحوم",
        "daira": "Marhoum",
        "postal_code": "22011",
        "lat": 34.446751,
        "lng": -0.195025
      },
      {
        "name": "Merine",
        "name_ar": "مرين",
        "daira": "Merine",
        "postal_code": "22012",
        "lat": 34.780588,
        "lng": -0.451
      },
      {
        "name": "Mezaourou",
        "name_ar": "مزاورو",
        "daira": "Telagh",
        "postal_code": "22025",
        "lat": 34.817327,
        "lng": -0.623319
      },
      {
        "name": "Mostefa Ben Brahim",
        "name_ar": "مصطفى بن ابراهيم",
        "daira": "Mostefa Ben Brahim",
        "postal_code": "22013",
        "lat": 35.1925,
        "lng": -0.358
      },
      {
        "name": "Moulay Slissen",
        "name_ar": "مولاي سليسن",
        "daira": "Moulay Slissen",
        "postal_code": "22026",
        "lat": 34.8222,
        "lng": -0.76041
      },
      {
        "name": "Oued Sebaa",
        "name_ar": "وادي السبع",
        "daira": "Ras El Ma",
        "postal_code": "22054",
        "lat": 34.586667,
        "lng": -0.824167
      },
      {
        "name": "Oued Sefioun",
        "name_ar": "وادي سفيون",
        "daira": "Tenira",
        "postal_code": "22055",
        "lat": 34.996111,
        "lng": -0.093333
      },
      {
        "name": "Oued Taourira",
        "name_ar": "وادي تاوريرة",
        "daira": "Merine",
        "postal_code": "22056",
        "lat": 34.61972,
        "lng": -0.33889
      },
      {
        "name": "Ras El Ma",
        "name_ar": "راس الماء",
        "daira": "Ras El Ma",
        "postal_code": "22005",
        "lat": 34.497361,
        "lng": -0.805598
      },
      {
        "name": "Redjem Demouche",
        "name_ar": "رجم دموش",
        "daira": "Ras El Ma",
        "postal_code": "22058",
        "lat": 34.427222,
        "lng": -0.809722
      },
      {
        "name": "Sehala Thaoura",
        "name_ar": "السهالة الثورة",
        "daira": "Tessala",
        "postal_code": "22060",
        "lat": 35.222,
        "lng": -0.8317
      },
      {
        "name": "Sfisef",
        "name_ar": "سفيزف",
        "daira": "Sfisef",
        "postal_code": "22001",
        "lat": 35.23464,
        "lng": -0.24435
      },
      {
        "name": "Sidi Ali Benyoub",
        "name_ar": "سيدي علي بن يوب",
        "daira": "Sidi Ali Benyoub",
        "postal_code": "22028",
        "lat": 34.945556,
        "lng": -0.7194
      },
      {
        "name": "Sidi Ali Boussidi",
        "name_ar": "سيدي علي بوسيدي",
        "daira": "Sidi Ali Boussidi",
        "postal_code": "22014",
        "lat": 35.1,
        "lng": -0.833333
      },
      {
        "name": "Sidi Bel-Abbes",
        "name_ar": "سيدي بلعباس",
        "daira": "Sidi Bel Abbès",
        "postal_code": "22000",
        "lat": 35.202225,
        "lng": -0.629892
      },
      {
        "name": "Sidi Brahim",
        "name_ar": "سيدي ابراهيم",
        "daira": "Aïn El Berd",
        "postal_code": "22029",
        "lat": 35.260556,
        "lng": -0.5675
      },
      {
        "name": "Sidi Chaib",
        "name_ar": "سيدي شعيب",
        "daira": "Marhoum",
        "postal_code": "22061",
        "lat": 34.3411,
        "lng": -0.54861
      },
      {
        "name": "Sidi Dahou Zairs",
        "name_ar": "سيدي دحو الزاير",
        "daira": "Sidi Ali Boussidi",
        "postal_code": "22062",
        "lat": 35.11714,
        "lng": -0.91001
      },
      {
        "name": "Sidi Hamadouche",
        "name_ar": "سيدي حمادوش",
        "daira": "Aïn El Berd",
        "postal_code": "22019",
        "lat": 35.1375,
        "lng": -0.548889
      },
      {
        "name": "Sidi Khaled",
        "name_ar": "سيدي خالد",
        "daira": "Sidi Lahcene",
        "postal_code": "22031",
        "lat": 35.11349,
        "lng": -0.71969
      },
      {
        "name": "Sidi Lahcene",
        "name_ar": "سيدي لحسن",
        "daira": "Sidi Lahcene",
        "postal_code": "22020",
        "lat": 35.163284,
        "lng": -0.695915
      },
      {
        "name": "Sidi Yacoub",
        "name_ar": "سيدي يعقوب",
        "daira": "Sidi Lahcene",
        "postal_code": "22063",
        "lat": 35.13583,
        "lng": -0.786111
      },
      {
        "name": "Tabia",
        "name_ar": "طابية",
        "daira": "Sidi Ali Benyoub",
        "postal_code": "22032",
        "lat": 35.206,
        "lng": -0.73389
      },
      {
        "name": "Taoudmout",
        "name_ar": "تاودموت",
        "daira": "Merine",
        "postal_code": "22064",
        "lat": 34.587778,
        "lng": -0.1103
      },
      {
        "name": "Tefessour",
        "name_ar": "تفسور",
        "daira": "Merine",
        "postal_code": "22065",
        "lat": 35.035,
        "lng": -0.1
      },
      {
        "name": "Teghalimet",
        "name_ar": "تغاليمت",
        "daira": "Telagh",
        "postal_code": "22066",
        "lat": 34.882777,
        "lng": -0.55
      },
      {
        "name": "Telagh",
        "name_ar": "تلاغ",
        "daira": "Telagh",
        "postal_code": "22007",
        "lat": 34.794959,
        "lng": -0.5722
      },
      {
        "name": "Tenira",
        "name_ar": "تنيرة",
        "daira": "Tenira",
        "postal_code": "22021",
        "lat": 35.0197,
        "lng": -0.52897
      },
      {
        "name": "Tessala",
        "name_ar": "تسالة",
        "daira": "Tessala",
        "postal_code": "22033",
        "lat": 35.24356,
        "lng": -0.773163
      },
      {
        "name": "Tilmouni",
        "name_ar": "تلموني",
        "daira": "Mostefa Ben Brahim",
        "postal_code": "22044",
        "lat": 35.083333,
        "lng": -0.590518
      },
      {
        "name": "Zerouala",
        "name_ar": "زروالة",
        "daira": "Mostefa Ben Brahim",
        "postal_code": "22068",
        "lat": 35.242222,
        "lng": -0.522
      }
    ]
  },
  {
    "code": "23",
    "name": "Annaba",
    "name_ar": "عنابة",
    "lat": 36.9,
    "lng": 7.767,
    "communes": [
      {
        "name": "Ain El Berda",
        "name_ar": "عين الباردة",
        "daira": "Aïn Berda",
        "postal_code": "23006",
        "lat": 36.65,
        "lng": 7.58333
      },
      {
        "name": "Annaba",
        "name_ar": "عنابة",
        "daira": "Annaba",
        "postal_code": "23000",
        "lat": 36.9,
        "lng": 7.7667
      },
      {
        "name": "Berrahal",
        "name_ar": "برحال",
        "daira": "Berrahal",
        "postal_code": "23009",
        "lat": 36.833333,
        "lng": 7.45
      },
      {
        "name": "Chetaibi",
        "name_ar": "شطايبي",
        "daira": "Chetaïbi",
        "postal_code": "23014",
        "lat": 36.805556,
        "lng": 7.38028
      },
      {
        "name": "Cheurfa",
        "name_ar": "الشرفة",
        "daira": "Aïn Berda",
        "postal_code": "23018",
        "lat": 36.72361,
        "lng": 7.578898
      },
      {
        "name": "El Bouni",
        "name_ar": "البوني",
        "daira": "El Bouni",
        "postal_code": "23010",
        "lat": 36.853576,
        "lng": 7.663889
      },
      {
        "name": "El Eulma",
        "name_ar": "العلمة",
        "daira": "Aïn Berda",
        "postal_code": "",
        "lat": 36.73875,
        "lng": 7.46163
      },
      {
        "name": "El Hadjar",
        "name_ar": "الحجار",
        "daira": "El Hadjar",
        "postal_code": "23004",
        "lat": 36.80377,
        "lng": 7.737
      },
      {
        "name": "Oued El Aneb",
        "name_ar": "واد العنب",
        "daira": "Berrahal",
        "postal_code": "23021",
        "lat": 36.883333,
        "lng": 7.503067
      },
      {
        "name": "Seraidi",
        "name_ar": "سرايدي",
        "daira": "Annaba",
        "postal_code": "23015",
        "lat": 36.91129,
        "lng": 7.666667
      },
      {
        "name": "Sidi Amar",
        "name_ar": "سيدي عمار",
        "daira": "El Hadjar",
        "postal_code": "23005",
        "lat": 36.8175,
        "lng": 7.71641
      },
      {
        "name": "Treat",
        "name_ar": "التريعات",
        "daira": "Berrahal",
        "postal_code": "23022",
        "lat": 36.89747,
        "lng": 7.683333
      }
    ]
  },
  {
    "code": "24",
    "name": "Guelma",
    "name_ar": "قالمة",
    "lat": 36.45,
    "lng": 7.433,
    "communes": [
      {
        "name": "Ain Ben Beida",
        "name_ar": "عين بن بيضاء",
        "daira": "Bouchegouf",
        "postal_code": "24011",
        "lat": 36.61667,
        "lng": 7.7
      },
      {
        "name": "Ain Larbi",
        "name_ar": "عين العربي",
        "daira": "Houari Boumédiène",
        "postal_code": "24012",
        "lat": 36.265833,
        "lng": 7.3962
      },
      {
        "name": "Ain Makhlouf",
        "name_ar": "عين مخلوف",
        "daira": "Aïn Makhlouf",
        "postal_code": "24013",
        "lat": 36.243333,
        "lng": 7.250833
      },
      {
        "name": "Ain Regada",
        "name_ar": "عين رقادة",
        "daira": "Aïn Makhlouf",
        "postal_code": "24014",
        "lat": 36.259444,
        "lng": 7.0739
      },
      {
        "name": "Ain Sandel",
        "name_ar": "عين صندل",
        "daira": "Aïn Makhlouf",
        "postal_code": "24032",
        "lat": 36.244722,
        "lng": 7.5125
      },
      {
        "name": "Belkheir",
        "name_ar": "بلخير",
        "daira": "Guelma",
        "postal_code": "24015",
        "lat": 36.45879,
        "lng": 7.479
      },
      {
        "name": "Bendjarah",
        "name_ar": "بن جراح",
        "daira": "Guelma",
        "postal_code": "24034",
        "lat": 36.432222,
        "lng": 7.420833
      },
      {
        "name": "Beni Mezline",
        "name_ar": "بني مزلين",
        "daira": "Houari Boumédiène",
        "postal_code": "24041",
        "lat": 36.480833,
        "lng": 7.6031
      },
      {
        "name": "Bordj Sabath",
        "name_ar": "برج صباط",
        "daira": "Hammam N'Bails",
        "postal_code": "24017",
        "lat": 36.402899,
        "lng": 7.0485
      },
      {
        "name": "Bou Hachana",
        "name_ar": "بوحشانة",
        "daira": "Guelaât Bou Sbaâ",
        "postal_code": "24037",
        "lat": 36.306868,
        "lng": 7.507804
      },
      {
        "name": "Bou Hamdane",
        "name_ar": "بوحمدان",
        "daira": "Hammam Debagh",
        "postal_code": "24050",
        "lat": 36.46277,
        "lng": 7.116667
      },
      {
        "name": "Bouati Mahmoud",
        "name_ar": "بوعاتي محمود",
        "daira": "Héliopolis",
        "postal_code": "24018",
        "lat": 36.583333,
        "lng": 7.333333
      },
      {
        "name": "Bouchegouf",
        "name_ar": "بوشقوف",
        "daira": "Bouchegouf",
        "postal_code": "24002",
        "lat": 36.471927,
        "lng": 7.72972
      },
      {
        "name": "Boumahra Ahmed",
        "name_ar": "بومهرة أحمد",
        "daira": "Guelma",
        "postal_code": "24005",
        "lat": 36.458007,
        "lng": 7.51389
      },
      {
        "name": "Dahouara",
        "name_ar": "الدهوارة",
        "daira": "Hammam Debagh",
        "postal_code": "24031",
        "lat": 36.351667,
        "lng": 7.732778
      },
      {
        "name": "Djeballah Khemissi",
        "name_ar": "جبالة الخميسي",
        "daira": "Oued Zenati",
        "postal_code": "24039",
        "lat": 36.5667,
        "lng": 7.633333
      },
      {
        "name": "El Fedjoudj",
        "name_ar": "الفجوج",
        "daira": "Héliopolis",
        "postal_code": "24019",
        "lat": 36.504824,
        "lng": 7.399722
      },
      {
        "name": "Guelaat Bou Sbaa",
        "name_ar": "قلعة بوصبع",
        "daira": "Guelaât Bou Sbaâ",
        "postal_code": "24020",
        "lat": 36.54565,
        "lng": 7.47333
      },
      {
        "name": "Guelma",
        "name_ar": "قالمة",
        "daira": "Guelma",
        "postal_code": "24000",
        "lat": 36.466,
        "lng": 7.4206
      },
      {
        "name": "Hammam Debagh",
        "name_ar": "حمام دباغ",
        "daira": "Hammam Debagh",
        "postal_code": "24007",
        "lat": 36.461111,
        "lng": 7.266667
      },
      {
        "name": "Hammam N'bail",
        "name_ar": "حمام النبايل",
        "daira": "Hammam N'Bails",
        "postal_code": "24024",
        "lat": 36.464832,
        "lng": 7.6436
      },
      {
        "name": "Heliopolis",
        "name_ar": "هيليوبوليس",
        "daira": "Héliopolis",
        "postal_code": "24008",
        "lat": 36.50361,
        "lng": 7.4447
      },
      {
        "name": "Houari Boumedienne",
        "name_ar": "هواري بومدين",
        "daira": "Houari Boumédiène",
        "postal_code": "24025",
        "lat": 36.4154,
        "lng": 7.28611
      },
      {
        "name": "Khezaras",
        "name_ar": "لخزارة",
        "daira": "Khezarra",
        "postal_code": "24016",
        "lat": 36.369444,
        "lng": 7.529167
      },
      {
        "name": "Medjez Amar",
        "name_ar": "مجاز عمار",
        "daira": "Bouchegouf",
        "postal_code": "24043",
        "lat": 36.4454,
        "lng": 7.310556
      },
      {
        "name": "Medjez Sfa",
        "name_ar": "مجاز الصفاء",
        "daira": "Guelaât Bou Sbaâ",
        "postal_code": "24026",
        "lat": 36.43337,
        "lng": 7.782423
      },
      {
        "name": "Nechmaya",
        "name_ar": "نشماية",
        "daira": "Khezarra",
        "postal_code": "24027",
        "lat": 36.611389,
        "lng": 7.513333
      },
      {
        "name": "Oued Cheham",
        "name_ar": "وادي الشحم",
        "daira": "Oued Zenati",
        "postal_code": "24009",
        "lat": 36.38333,
        "lng": 7.76278
      },
      {
        "name": "Oued Ferragha",
        "name_ar": "وادي فراغة",
        "daira": "Hammam Debagh",
        "postal_code": "24038",
        "lat": 36.555833,
        "lng": 7.713055
      },
      {
        "name": "Oued Zenati",
        "name_ar": "وادي الزناتي",
        "daira": "Oued Zenati",
        "postal_code": "24001",
        "lat": 36.3153,
        "lng": 7.163889
      },
      {
        "name": "Ras El Agba",
        "name_ar": "رأس العقبة",
        "daira": "Oued Zenati",
        "postal_code": "24049",
        "lat": 36.372949,
        "lng": 7.222816
      },
      {
        "name": "Roknia",
        "name_ar": "الركنية",
        "daira": "Hammam Debagh",
        "postal_code": "24028",
        "lat": 36.5481,
        "lng": 7.22861
      },
      {
        "name": "Sellaoua Announa",
        "name_ar": "سلاوة عنونة",
        "daira": "Khezarra",
        "postal_code": "24029",
        "lat": 36.386944,
        "lng": 7.250556
      },
      {
        "name": "Tamlouka",
        "name_ar": "تاملوكة",
        "daira": "Aïn Makhlouf",
        "postal_code": "24010",
        "lat": 36.15,
        "lng": 7.14154
      }
    ]
  },
  {
    "code": "25",
    "name": "Constantine",
    "name_ar": "قسنطينة",
    "lat": 36.35,
    "lng": 6.6,
    "communes": [
      {
        "name": "Ain Abid",
        "name_ar": "عين عبيد",
        "daira": "Aïn Abid",
        "postal_code": "25015",
        "lat": 36.2325,
        "lng": 6.944046
      },
      {
        "name": "Ain Smara",
        "name_ar": "عين السمارة",
        "daira": "Aïn Smara",
        "postal_code": "25006",
        "lat": 36.2675,
        "lng": 6.50147
      },
      {
        "name": "Ben Badis",
        "name_ar": "ابن باديس",
        "daira": "Aïn Abid",
        "postal_code": "25030",
        "lat": 36.3173,
        "lng": 6.83195
      },
      {
        "name": "Beni Hamidane",
        "name_ar": "بني حميدان",
        "daira": "Zighoud Youcef",
        "postal_code": "25035",
        "lat": 36.505561,
        "lng": 6.549722
      },
      {
        "name": "Constantine",
        "name_ar": "قسنطينة",
        "daira": "Constantine",
        "postal_code": "25000",
        "lat": 36.365,
        "lng": 6.642433
      },
      {
        "name": "Didouche Mourad",
        "name_ar": "ديدوش مراد",
        "daira": "Hamma Bouziane",
        "postal_code": "25024",
        "lat": 36.4525,
        "lng": 6.63639
      },
      {
        "name": "El Khroub",
        "name_ar": "الخروب",
        "daira": "El Khroub",
        "postal_code": "25005",
        "lat": 36.26333,
        "lng": 6.69361
      },
      {
        "name": "Hamma Bouziane",
        "name_ar": "حامة بوزيان",
        "daira": "Hamma Bouziane",
        "postal_code": "25013",
        "lat": 36.41205,
        "lng": 6.59603
      },
      {
        "name": "Ibn Ziad",
        "name_ar": "ابن زياد",
        "daira": "Ibn Ziad",
        "postal_code": "25027",
        "lat": 36.379167,
        "lng": 6.4667
      },
      {
        "name": "Messaoud Boudjeriou",
        "name_ar": "بوجريو مسعود",
        "daira": "Ibn Ziad",
        "postal_code": "25032",
        "lat": 36.424444,
        "lng": 6.4725
      },
      {
        "name": "Ouled Rahmoun",
        "name_ar": "أولاد رحمون",
        "daira": "El Khroub",
        "postal_code": "25028",
        "lat": 36.17148,
        "lng": 6.6933
      },
      {
        "name": "Zighoud Youcef",
        "name_ar": "زيغود يوسف",
        "daira": "Zighoud Youcef",
        "postal_code": "25014",
        "lat": 36.53307,
        "lng": 6.71238
      }
    ]
  },
  {
    "code": "26",
    "name": "Médéa",
    "name_ar": "المدية",
    "lat": 36.2675,
    "lng": 2.75,
    "communes": [
      {
        "name": "Ain Boucif",
        "name_ar": "عين بوسيف",
        "daira": "Aïn Boucif",
        "postal_code": "",
        "lat": 35.89123,
        "lng": 3.1585
      },
      {
        "name": "Ain Ouksir",
        "name_ar": "عين اقصير",
        "daira": "Chellalet El Adhaoura",
        "postal_code": "",
        "lat": 35.818653,
        "lng": 3.470555
      },
      {
        "name": "Aissaouia",
        "name_ar": "العيساوية",
        "daira": "Tablat",
        "postal_code": "26022",
        "lat": 36.419167,
        "lng": 3.216111
      },
      {
        "name": "Aziz",
        "name_ar": "عزيز",
        "daira": "Aziz",
        "postal_code": "",
        "lat": 35.816667,
        "lng": 2.45
      },
      {
        "name": "Baata",
        "name_ar": "بعطة",
        "daira": "El Omaria",
        "postal_code": "26050",
        "lat": 36.346389,
        "lng": 3.110277
      },
      {
        "name": "Ben Chicao",
        "name_ar": "بن شكاو",
        "daira": "Ouzera",
        "postal_code": "26012",
        "lat": 36.19679,
        "lng": 2.8499
      },
      {
        "name": "Beni Slimane",
        "name_ar": "بني سليمان",
        "daira": "Beni Slimane",
        "postal_code": "26001",
        "lat": 36.22703,
        "lng": 3.30596
      },
      {
        "name": "Berrouaghia",
        "name_ar": "البرواقية",
        "daira": "Berrouaghia",
        "postal_code": "26002",
        "lat": 36.13516,
        "lng": 2.911
      },
      {
        "name": "Bir Ben Laabed",
        "name_ar": "بئر بن عابد",
        "daira": "El Guelb El Kebir",
        "postal_code": "26053",
        "lat": 36.0003,
        "lng": 3.394722
      },
      {
        "name": "Boghar",
        "name_ar": "بوغار",
        "daira": "Boghar",
        "postal_code": "",
        "lat": 35.911389,
        "lng": 2.71667
      },
      {
        "name": "Bouaiche",
        "name_ar": "بوعيش",
        "daira": "Chahbounia",
        "postal_code": "",
        "lat": 35.552778,
        "lng": 2.1731
      },
      {
        "name": "Bouaichoune",
        "name_ar": "بوعيشون",
        "daira": "Si Mahdjoub",
        "postal_code": "26055",
        "lat": 36.1625,
        "lng": 2.648709
      },
      {
        "name": "Bouchrahil",
        "name_ar": "بوشراحيل",
        "daira": "Sidi Naâmane",
        "postal_code": "26014",
        "lat": 36.252778,
        "lng": 3.15861
      },
      {
        "name": "Boughzoul",
        "name_ar": "بوغزول",
        "daira": "Chahbounia",
        "postal_code": "",
        "lat": 35.753312,
        "lng": 2.738167
      },
      {
        "name": "Bouskene",
        "name_ar": "بوسكن",
        "daira": "Beni Slimane",
        "postal_code": "26025",
        "lat": 36.191111,
        "lng": 3.2361
      },
      {
        "name": "Chabounia",
        "name_ar": "الشهبونية",
        "daira": "Chahbounia",
        "postal_code": "",
        "lat": 35.544722,
        "lng": 2.603333
      },
      {
        "name": "Chelalet El Adhaoura",
        "name_ar": "شلالة العذاورة",
        "daira": "Chellalet El Adhaoura",
        "postal_code": "",
        "lat": 35.94,
        "lng": 3.4139
      },
      {
        "name": "Cheniguel",
        "name_ar": "شنيقل",
        "daira": "Chellalet El Adhaoura",
        "postal_code": "",
        "lat": 35.922222,
        "lng": 3.5667
      },
      {
        "name": "Derrag",
        "name_ar": "دراق",
        "daira": "Aziz",
        "postal_code": "",
        "lat": 35.908611,
        "lng": 2.38778
      },
      {
        "name": "Djouab",
        "name_ar": "جواب",
        "daira": "Souagui",
        "postal_code": "26016",
        "lat": 36.13821,
        "lng": 3.42701
      },
      {
        "name": "Draa Esmar",
        "name_ar": "ذراع السمار",
        "daira": "Médéa",
        "postal_code": "26017",
        "lat": 36.27354,
        "lng": 2.71695
      },
      {
        "name": "El Azizia",
        "name_ar": "العزيزية",
        "daira": "El Azizia",
        "postal_code": "26018",
        "lat": 36.28656,
        "lng": 3.49412
      },
      {
        "name": "El Guelbelkebir",
        "name_ar": "القلب الكبير",
        "daira": "El Guelb El Kebir",
        "postal_code": "26030",
        "lat": 36.254999,
        "lng": 3.416579
      },
      {
        "name": "El Hamdania",
        "name_ar": "الحمدانية",
        "daira": "Ouzera",
        "postal_code": "26060",
        "lat": 36.336962,
        "lng": 2.877664
      },
      {
        "name": "El Haoudane",
        "name_ar": "الحوضان",
        "daira": "Ouzera",
        "postal_code": "",
        "lat": 36.336962,
        "lng": 2.877664
      },
      {
        "name": "El Omaria",
        "name_ar": "العمارية",
        "daira": "El Omaria",
        "postal_code": "26008",
        "lat": 36.266667,
        "lng": 3.03333
      },
      {
        "name": "El Ouinet",
        "name_ar": "العوينات",
        "daira": "Aïn Boucif",
        "postal_code": "",
        "lat": 35.3344,
        "lng": 3.035556
      },
      {
        "name": "Hannacha",
        "name_ar": "حناشة",
        "daira": "Ouamri",
        "postal_code": "26027",
        "lat": 36.19112,
        "lng": 3.52556
      },
      {
        "name": "Kef Lakhdar",
        "name_ar": "الكاف الاخضر",
        "daira": "Aïn Boucif",
        "postal_code": "",
        "lat": 35.923333,
        "lng": 3.2875
      },
      {
        "name": "Khams Djouamaa",
        "name_ar": "خمس جوامع",
        "daira": "Sidi Naâmane",
        "postal_code": "26062",
        "lat": 36.1914,
        "lng": 3.2367
      },
      {
        "name": "Ksar El Boukhari",
        "name_ar": "قصر البخاري",
        "daira": "Ksar El Boukhari",
        "postal_code": "",
        "lat": 35.88889,
        "lng": 2.74905
      },
      {
        "name": "M'fatha",
        "name_ar": "مفاتحة",
        "daira": "Ksar El Boukhari",
        "postal_code": "",
        "lat": 35.883184,
        "lng": 2.934688
      },
      {
        "name": "Maghraoua",
        "name_ar": "مغراوة",
        "daira": "El Azizia",
        "postal_code": "26063",
        "lat": 36.351287,
        "lng": 3.535277
      },
      {
        "name": "Medea",
        "name_ar": "المدية",
        "daira": "Médéa",
        "postal_code": "26000",
        "lat": 36.2675,
        "lng": 2.75
      },
      {
        "name": "Medjebar",
        "name_ar": "مجبر",
        "daira": "Seghouane",
        "postal_code": "26033",
        "lat": 35.950556,
        "lng": 3.46166
      },
      {
        "name": "Mezerana",
        "name_ar": "مزغنة",
        "daira": "Tablat",
        "postal_code": "26042",
        "lat": 36.360999,
        "lng": 3.358083
      },
      {
        "name": "Mihoub",
        "name_ar": "ميهوب",
        "daira": "El Azizia",
        "postal_code": "26032",
        "lat": 36.3527,
        "lng": 3.475833
      },
      {
        "name": "Ouamri",
        "name_ar": "عوامري",
        "daira": "Ouamri",
        "postal_code": "26034",
        "lat": 36.2333,
        "lng": 2.566667
      },
      {
        "name": "Oued Harbil",
        "name_ar": "وادي حربيل",
        "daira": "Ouamri",
        "postal_code": "26061",
        "lat": 36.233333,
        "lng": 2.6333
      },
      {
        "name": "Ouled Antar",
        "name_ar": "أولاد عنتر",
        "daira": "Boghar",
        "postal_code": "",
        "lat": 35.995177,
        "lng": 2.60231
      },
      {
        "name": "Ouled Bouachra",
        "name_ar": "أولاد بوعشرة",
        "daira": "Si Mahdjoub",
        "postal_code": "26064",
        "lat": 36.160382,
        "lng": 2.722206
      },
      {
        "name": "Ouled Brahim",
        "name_ar": "أولاد إبراهيم",
        "daira": "El Omaria",
        "postal_code": "26036",
        "lat": 36.244444,
        "lng": 2.933611
      },
      {
        "name": "Ouled Deid",
        "name_ar": "أولاد دايد",
        "daira": "Berrouaghia",
        "postal_code": "26044",
        "lat": 36.112778,
        "lng": 3.5167
      },
      {
        "name": "Ouled Emaaraf",
        "name_ar": "أولاد امعرف",
        "daira": "Aïn Boucif",
        "postal_code": "",
        "lat": 35.872222,
        "lng": 3.1585
      },
      {
        "name": "Ouled Hellal",
        "name_ar": "أولاد هلال",
        "daira": "Boghar",
        "postal_code": "",
        "lat": 35.93701,
        "lng": 2.49802
      },
      {
        "name": "Oum El Djellil",
        "name_ar": "أم الجليل",
        "daira": "Aziz",
        "postal_code": "",
        "lat": 35.8275,
        "lng": 2.6239
      },
      {
        "name": "Ouzera",
        "name_ar": "وزرة",
        "daira": "Ouzera",
        "postal_code": "26019",
        "lat": 36.25,
        "lng": 3.0551
      },
      {
        "name": "Rebaia",
        "name_ar": "الربعية",
        "daira": "Berrouaghia",
        "postal_code": "26039",
        "lat": 36.02783,
        "lng": 3.138055
      },
      {
        "name": "Saneg",
        "name_ar": "السانق",
        "daira": "Ksar El Boukhari",
        "postal_code": "",
        "lat": 35.8514,
        "lng": 3.253056
      },
      {
        "name": "Sedraya",
        "name_ar": "سدراية",
        "daira": "El Guelb El Kebir",
        "postal_code": "26068",
        "lat": 36.24294,
        "lng": 3.529039
      },
      {
        "name": "Seghouane",
        "name_ar": "سغوان",
        "daira": "Seghouane",
        "postal_code": "26041",
        "lat": 36.19112,
        "lng": 2.9
      },
      {
        "name": "Si Mahdjoub",
        "name_ar": "سي المحجوب",
        "daira": "Si Mahdjoub",
        "postal_code": "26045",
        "lat": 36.160382,
        "lng": 2.722206
      },
      {
        "name": "Sidi Demed",
        "name_ar": "سيدي دامد",
        "daira": "Aïn Boucif",
        "postal_code": "",
        "lat": 35.870642,
        "lng": 3.253148
      },
      {
        "name": "Sidi Naamane",
        "name_ar": "سيدي نعمان",
        "daira": "Sidi Naâmane",
        "postal_code": "26043",
        "lat": 36.215056,
        "lng": 3.123937
      },
      {
        "name": "Sidi Rabie",
        "name_ar": "سيدي الربيع",
        "daira": "Beni Slimane",
        "postal_code": "26070",
        "lat": 36.14766,
        "lng": 3.75
      },
      {
        "name": "Sidi Zahar",
        "name_ar": "سيدي زهار",
        "daira": "Souagui",
        "postal_code": "26072",
        "lat": 36.07811,
        "lng": 3.331755
      },
      {
        "name": "Sidi Ziane",
        "name_ar": "سيدي زيان",
        "daira": "Souagui",
        "postal_code": "26073",
        "lat": 36.009333,
        "lng": 3.2556
      },
      {
        "name": "Souagui",
        "name_ar": "السواقي",
        "daira": "Souagui",
        "postal_code": "26020",
        "lat": 36.1167,
        "lng": 3.26446
      },
      {
        "name": "Tablat",
        "name_ar": "تابلاط",
        "daira": "Tablat",
        "postal_code": "26004",
        "lat": 36.412113,
        "lng": 3.3101
      },
      {
        "name": "Tafraout",
        "name_ar": "تفراوت",
        "daira": "Chellalet El Adhaoura",
        "postal_code": "",
        "lat": 36.0877,
        "lng": 3.4308
      },
      {
        "name": "Tamesguida",
        "name_ar": "تمسقيدة",
        "daira": "Médéa",
        "postal_code": "26075",
        "lat": 36.323889,
        "lng": 2.6894
      },
      {
        "name": "Tizi Mahdi",
        "name_ar": "تيزي مهدي",
        "daira": "Ouzera",
        "postal_code": "26076",
        "lat": 36.20283,
        "lng": 2.77583
      },
      {
        "name": "Tletat Ed Douair",
        "name_ar": "ثلاث دوائر",
        "daira": "Seghouane",
        "postal_code": "26046",
        "lat": 35.9154,
        "lng": 2.963
      },
      {
        "name": "Zoubiria",
        "name_ar": "الزبيرية",
        "daira": "Seghouane",
        "postal_code": "26021",
        "lat": 36.066667,
        "lng": 2.9
      }
    ]
  },
  {
    "code": "27",
    "name": "Mostaganem",
    "name_ar": "مستغانم",
    "lat": 35.933,
    "lng": 0.083,
    "communes": [
      {
        "name": "Achaacha",
        "name_ar": "عشعاشة",
        "daira": "Achaacha",
        "postal_code": "27009",
        "lat": 36.2463,
        "lng": 0.63558
      },
      {
        "name": "Ain-Boudinar",
        "name_ar": "عين بودينار",
        "daira": "Kheireddine",
        "postal_code": "27031",
        "lat": 36.008977,
        "lng": 0.188136
      },
      {
        "name": "Ain-Nouissy",
        "name_ar": "عين نويسي",
        "daira": "Aïn Nouïssy",
        "postal_code": "27010",
        "lat": 35.803757,
        "lng": 0.05
      },
      {
        "name": "Ain-Sidi Cherif",
        "name_ar": "عين سيدي الشريف",
        "daira": "Mesra",
        "postal_code": "27024",
        "lat": 35.833056,
        "lng": 0.13605
      },
      {
        "name": "Ain-Tedles",
        "name_ar": "عين تادلس",
        "daira": "Aïn Tedles",
        "postal_code": "27001",
        "lat": 35.9947,
        "lng": 0.2949
      },
      {
        "name": "Benabdelmalek Ramdane",
        "name_ar": "بن عبد المالك رمضان",
        "daira": "Sidi Lakhdar",
        "postal_code": "27008",
        "lat": 36.102617,
        "lng": 0.2742
      },
      {
        "name": "Bouguirat",
        "name_ar": "بوقيراط",
        "daira": "Bouguirat",
        "postal_code": "27003",
        "lat": 35.750232,
        "lng": 0.256615
      },
      {
        "name": "Fornaka",
        "name_ar": "فرناقة",
        "daira": "Aïn Nouïssy",
        "postal_code": "27014",
        "lat": 35.75243,
        "lng": -0.0169
      },
      {
        "name": "Hadjadj",
        "name_ar": "حجاج",
        "daira": "Sidi Lakhdar",
        "postal_code": "27015",
        "lat": 36.097054,
        "lng": 0.333333
      },
      {
        "name": "Hassi Mameche",
        "name_ar": "حاسي ماماش",
        "daira": "Hassi Maameche",
        "postal_code": "27004",
        "lat": 35.8611,
        "lng": 0.102718
      },
      {
        "name": "Hassiane",
        "name_ar": "الحسيان (بني ياحي",
        "daira": "Aïn Nouïssy",
        "postal_code": "27033",
        "lat": 35.751394,
        "lng": 0.076042
      },
      {
        "name": "Khadra",
        "name_ar": "خضرة",
        "daira": "Achaacha",
        "postal_code": "27005",
        "lat": 36.253571,
        "lng": 0.5833
      },
      {
        "name": "Kheir-Eddine",
        "name_ar": "خير الدين",
        "daira": "Kheireddine",
        "postal_code": "27016",
        "lat": 35.947756,
        "lng": 0.17315
      },
      {
        "name": "Mansourah",
        "name_ar": "منصورة",
        "daira": "Mesra",
        "postal_code": "27036",
        "lat": 35.843611,
        "lng": 0.231667
      },
      {
        "name": "Mazagran",
        "name_ar": "مزغران",
        "daira": "Hassi Maameche",
        "postal_code": "27017",
        "lat": 35.901944,
        "lng": 0.726944
      },
      {
        "name": "Mesra",
        "name_ar": "ماسرة",
        "daira": "Mesra",
        "postal_code": "27018",
        "lat": 35.837222,
        "lng": 0.169722
      },
      {
        "name": "Mostaganem",
        "name_ar": "مستغانم",
        "daira": "Mostaganem",
        "postal_code": "27000",
        "lat": 35.924659,
        "lng": 0.09
      },
      {
        "name": "Nekmaria",
        "name_ar": "نكمارية",
        "daira": "Achaacha",
        "postal_code": "27026",
        "lat": 36.166667,
        "lng": 0.616667
      },
      {
        "name": "Oued El Kheir",
        "name_ar": "وادي الخير",
        "daira": "Aïn Tedles",
        "postal_code": "27020",
        "lat": 35.950278,
        "lng": 0.380833
      },
      {
        "name": "Ouled Boughalem",
        "name_ar": "أولاد بوغالم",
        "daira": "Achaacha",
        "postal_code": "27027",
        "lat": 36.320278,
        "lng": 0.672778
      },
      {
        "name": "Ouled-Maalah",
        "name_ar": "أولاد مع الله",
        "daira": "Sidi Ali",
        "postal_code": "27028",
        "lat": 36.006944,
        "lng": 0.591944
      },
      {
        "name": "Safsaf",
        "name_ar": "صفصاف",
        "daira": "Bouguirat",
        "postal_code": "27044",
        "lat": 36.075278,
        "lng": 0.428333
      },
      {
        "name": "Sayada",
        "name_ar": "صيادة",
        "daira": "Kheireddine",
        "postal_code": "27045",
        "lat": 35.947756,
        "lng": 0.129167
      },
      {
        "name": "Sidi Ali",
        "name_ar": "سيدي علي",
        "daira": "Sidi Ali",
        "postal_code": "27002",
        "lat": 36.096779,
        "lng": 0.414874
      },
      {
        "name": "Sidi Belaattar",
        "name_ar": "سيدي بلعطار",
        "daira": "Aïn Tedles",
        "postal_code": "27029",
        "lat": 36.026698,
        "lng": 0.26931
      },
      {
        "name": "Sidi-Lakhdar",
        "name_ar": "سيدي لخضر",
        "daira": "Sidi Lakhdar",
        "postal_code": "27007",
        "lat": 36.1428,
        "lng": 0.460556
      },
      {
        "name": "Sirat",
        "name_ar": "سيرات",
        "daira": "Bouguirat",
        "postal_code": "27021",
        "lat": 35.7804,
        "lng": 0.191667
      },
      {
        "name": "Souaflia",
        "name_ar": "السوافلية",
        "daira": "Bouguirat",
        "postal_code": "27046",
        "lat": 35.85,
        "lng": 0.333333
      },
      {
        "name": "Sour",
        "name_ar": "سور",
        "daira": "Aïn Tedles",
        "postal_code": "27022",
        "lat": 35.85,
        "lng": 0.341389
      },
      {
        "name": "Stidia",
        "name_ar": "ستيدية",
        "daira": "Hassi Maameche",
        "postal_code": "27023",
        "lat": 35.830723,
        "lng": 0
      },
      {
        "name": "Tazgait",
        "name_ar": "تزقايت",
        "daira": "Sidi Ali",
        "postal_code": "27047",
        "lat": 36.083333,
        "lng": 0.4675
      },
      {
        "name": "Touahria",
        "name_ar": "الطواهرية",
        "daira": "Mesra",
        "postal_code": "27013",
        "lat": 35.810556,
        "lng": 0.209444
      }
    ]
  },
  {
    "code": "28",
    "name": "M'Sila",
    "name_ar": "المسيلة",
    "lat": 35.70194,
    "lng": 4.54722,
    "communes": [
      {
        "name": "Ain El Hadjel",
        "name_ar": "عين الحجل",
        "daira": "Aïn El Hadjel",
        "postal_code": "28003",
        "lat": 35.67466,
        "lng": 3.882152
      },
      {
        "name": "Ain El Melh",
        "name_ar": "عين الملح",
        "daira": "Aïn El Melh",
        "postal_code": "",
        "lat": 34.847049,
        "lng": 4.163496
      },
      {
        "name": "Ain Fares",
        "name_ar": "عين فارس",
        "daira": "Aïn El Melh",
        "postal_code": "",
        "lat": 35.035833,
        "lng": 4.428333
      },
      {
        "name": "Ain Khadra",
        "name_ar": "عين الخضراء",
        "daira": "Magra",
        "postal_code": "28008",
        "lat": 35.539369,
        "lng": 4.971874
      },
      {
        "name": "Ain Rich",
        "name_ar": "عين الريش",
        "daira": "Aïn El Melh",
        "postal_code": "",
        "lat": 34.680794,
        "lng": 4.096956
      },
      {
        "name": "Belaiba",
        "name_ar": "بلعايبة",
        "daira": "Magra",
        "postal_code": "28026",
        "lat": 35.7,
        "lng": 5.074167
      },
      {
        "name": "Ben Srour",
        "name_ar": "بن سرور",
        "daira": "Ben Srour",
        "postal_code": "",
        "lat": 35.040443,
        "lng": 4.563379
      },
      {
        "name": "Beni Ilmane",
        "name_ar": "بني يلمان",
        "daira": "Sidi Aïssa",
        "postal_code": "28027",
        "lat": 35.949167,
        "lng": 4.11917
      },
      {
        "name": "Benzouh",
        "name_ar": "بن زوه",
        "daira": "Ouled Sidi Brahim",
        "postal_code": "",
        "lat": 35.438055,
        "lng": 4.383333
      },
      {
        "name": "Berhoum",
        "name_ar": "برهوم",
        "daira": "Magra",
        "postal_code": "28010",
        "lat": 35.654979,
        "lng": 5.328
      },
      {
        "name": "Bir Foda",
        "name_ar": "بئر فضة",
        "daira": "Aïn El Melh",
        "postal_code": "",
        "lat": 34.82,
        "lng": 3.899444
      },
      {
        "name": "Bou Saada",
        "name_ar": "بوسعادة",
        "daira": "Bou Saada",
        "postal_code": "",
        "lat": 35.219167,
        "lng": 4.17402
      },
      {
        "name": "Bouti Sayeh",
        "name_ar": "بوطي السايح",
        "daira": "Sidi Aïssa",
        "postal_code": "28042",
        "lat": 35.85,
        "lng": 3.694444
      },
      {
        "name": "Chellal",
        "name_ar": "شلال",
        "daira": "Chellal",
        "postal_code": "28014",
        "lat": 35.516667,
        "lng": 4.383333
      },
      {
        "name": "Dehahna",
        "name_ar": "دهاهنة",
        "daira": "Magra",
        "postal_code": "28048",
        "lat": 35.916667,
        "lng": 5.00884
      },
      {
        "name": "Djebel Messaad",
        "name_ar": "جبل مساعد",
        "daira": "Djebel Messaad",
        "postal_code": "",
        "lat": 34.991121,
        "lng": 4.092493
      },
      {
        "name": "El Hamel",
        "name_ar": "الهامل",
        "daira": "Bou Saada",
        "postal_code": "",
        "lat": 35.1283,
        "lng": 4.083333
      },
      {
        "name": "El Houamed",
        "name_ar": "الحوامد",
        "daira": "Khoubana",
        "postal_code": "",
        "lat": 35.291776,
        "lng": 4.53358
      },
      {
        "name": "Hammam Dalaa",
        "name_ar": "حمام الضلعة",
        "daira": "Hammam Dalaa",
        "postal_code": "28005",
        "lat": 35.85,
        "lng": 4.37445
      },
      {
        "name": "Khettouti Sed-El-Jir",
        "name_ar": "خطوطي سد الجير",
        "daira": "Chellal",
        "postal_code": "28056",
        "lat": 35.687602,
        "lng": 4.253845
      },
      {
        "name": "Khoubana",
        "name_ar": "خبانة",
        "daira": "Khoubana",
        "postal_code": "",
        "lat": 35.314444,
        "lng": 4.566944
      },
      {
        "name": "M'cif",
        "name_ar": "مسيف",
        "daira": "Khoubana",
        "postal_code": "",
        "lat": 35.3281,
        "lng": 4.8
      },
      {
        "name": "M'sila",
        "name_ar": "المسيلة",
        "daira": "M'Sila",
        "postal_code": "28000",
        "lat": 35.71,
        "lng": 4.5472
      },
      {
        "name": "M'tarfa",
        "name_ar": "المطارفة",
        "daira": "Ouled Derradj",
        "postal_code": "28058",
        "lat": 35.704444,
        "lng": 4.6175
      },
      {
        "name": "Maadid",
        "name_ar": "المعاضيد",
        "daira": "Ouled Derradj",
        "postal_code": "28011",
        "lat": 35.8667,
        "lng": 4.795556
      },
      {
        "name": "Maarif",
        "name_ar": "معاريف",
        "daira": "Chellal",
        "postal_code": "28041",
        "lat": 35.415278,
        "lng": 4.354167
      },
      {
        "name": "Magra",
        "name_ar": "مقرة",
        "daira": "Magra",
        "postal_code": "28006",
        "lat": 35.617778,
        "lng": 5.1074
      },
      {
        "name": "Medjedel",
        "name_ar": "امجدل",
        "daira": "Medjedel",
        "postal_code": "",
        "lat": 34.961111,
        "lng": 3.67939
      },
      {
        "name": "Menaa",
        "name_ar": "مناعة",
        "daira": "Medjedel",
        "postal_code": "",
        "lat": 35.144444,
        "lng": 3.694444
      },
      {
        "name": "Mohamed Boudiaf",
        "name_ar": "محمد بوضياف",
        "daira": "Ben Srour",
        "postal_code": "",
        "lat": 34.894167,
        "lng": 4.428611
      },
      {
        "name": "Ouanougha",
        "name_ar": "ونوغة",
        "daira": "Hammam Dalaa",
        "postal_code": "28017",
        "lat": 35.980833,
        "lng": 3.883
      },
      {
        "name": "Ouled Addi Guebala",
        "name_ar": "أولاد عدي لقبالة",
        "daira": "Ouled Derradj",
        "postal_code": "28021",
        "lat": 35.670556,
        "lng": 4.872809
      },
      {
        "name": "Ouled Derradj",
        "name_ar": "أولاد دراج",
        "daira": "Ouled Derradj",
        "postal_code": "28022",
        "lat": 35.69272,
        "lng": 4.783333
      },
      {
        "name": "Ouled Madhi",
        "name_ar": "أولاد ماضي",
        "daira": "Chellal",
        "postal_code": "28047",
        "lat": 35.576667,
        "lng": 4.508333
      },
      {
        "name": "Ouled Mansour",
        "name_ar": "أولاد منصور",
        "daira": "Hammam Dalaa",
        "postal_code": "28060",
        "lat": 35.729444,
        "lng": 4.37707
      },
      {
        "name": "Ouled Sidi Brahim",
        "name_ar": "أولاد سيدي ابراهيم",
        "daira": "Ouled Sidi Brahim",
        "postal_code": "",
        "lat": 35.299244,
        "lng": 4.169617
      },
      {
        "name": "Ouled Slimane",
        "name_ar": "أولاد سليمان",
        "daira": "Ben Srour",
        "postal_code": "",
        "lat": 34.91609,
        "lng": 4.736944
      },
      {
        "name": "Oulteme",
        "name_ar": "ولتام",
        "daira": "Bou Saada",
        "postal_code": "",
        "lat": 35.035082,
        "lng": 5.336022
      },
      {
        "name": "Sidi Aissa",
        "name_ar": "سيدي عيسى",
        "daira": "Sidi Aïssa",
        "postal_code": "28002",
        "lat": 35.886389,
        "lng": 3.77236
      },
      {
        "name": "Sidi Ameur",
        "name_ar": "سيدي عامر",
        "daira": "Sidi Ameur",
        "postal_code": "",
        "lat": 35.367,
        "lng": 3.9
      },
      {
        "name": "Sidi Hadjeres",
        "name_ar": "سيدي هجرس",
        "daira": "Aïn El Hadjel",
        "postal_code": "28036",
        "lat": 35.671944,
        "lng": 4.035278
      },
      {
        "name": "Sidi M'hamed",
        "name_ar": "سيدي محمد",
        "daira": "Aïn El Melh",
        "postal_code": "",
        "lat": 34.735833,
        "lng": 4.285833
      },
      {
        "name": "Slim",
        "name_ar": "سليم",
        "daira": "Djebel Messaad",
        "postal_code": "",
        "lat": 34.938889,
        "lng": 3.734722
      },
      {
        "name": "Souamaa",
        "name_ar": "السوامع",
        "daira": "Ouled Derradj",
        "postal_code": "28064",
        "lat": 35.6546,
        "lng": 4.668889
      },
      {
        "name": "Tamsa",
        "name_ar": "تامسة",
        "daira": "Sidi Ameur",
        "postal_code": "",
        "lat": 35.173611,
        "lng": 3.925556
      },
      {
        "name": "Tarmount",
        "name_ar": "تارمونت",
        "daira": "Hammam Dalaa",
        "postal_code": "28038",
        "lat": 35.688056,
        "lng": 4.174722
      },
      {
        "name": "Zarzour",
        "name_ar": "زرزور",
        "daira": "Ben Srour",
        "postal_code": "",
        "lat": 35.035833,
        "lng": 4.433333
      }
    ]
  },
  {
    "code": "29",
    "name": "Mascara",
    "name_ar": "معسكر",
    "lat": 35.4,
    "lng": 0.13333,
    "communes": [
      {
        "name": "Ain Fares",
        "name_ar": "عين فارس",
        "daira": "Aïn Fares",
        "postal_code": "29020",
        "lat": 35.4799,
        "lng": 0.2449
      },
      {
        "name": "Ain Fekan",
        "name_ar": "عين فكان",
        "daira": "Aïn Fekan",
        "postal_code": "29011",
        "lat": 35.2153,
        "lng": -0.0016
      },
      {
        "name": "Ain Ferah",
        "name_ar": "عين فراح",
        "daira": "Oued El Abtal",
        "postal_code": "29032",
        "lat": 35.381111,
        "lng": 0.785376
      },
      {
        "name": "Ain Frass",
        "name_ar": "عين أفرص",
        "daira": "Aïn Fekan",
        "postal_code": "29034",
        "lat": 35.195278,
        "lng": -0.1575
      },
      {
        "name": "Alaimia",
        "name_ar": "العلايمية",
        "daira": "Oggaz",
        "postal_code": "29036",
        "lat": 35.51011,
        "lng": -0.3225
      },
      {
        "name": "Aouf",
        "name_ar": "عوف",
        "daira": "Aouf",
        "postal_code": "29021",
        "lat": 35.1,
        "lng": 0.15
      },
      {
        "name": "Benian",
        "name_ar": "بنيان",
        "daira": "Aouf",
        "postal_code": "29038",
        "lat": 35.21222,
        "lng": 0.139722
      },
      {
        "name": "Bou Henni",
        "name_ar": "بوهني",
        "daira": "Sig",
        "postal_code": "29022",
        "lat": 35.560556,
        "lng": -0.084444
      },
      {
        "name": "Bouhanifia",
        "name_ar": "بوحنيفية",
        "daira": "Bou Hanifia",
        "postal_code": "29005",
        "lat": 35.316111,
        "lng": -0.048333
      },
      {
        "name": "Chorfa",
        "name_ar": "الشرفاء",
        "daira": "Sig",
        "postal_code": "29039",
        "lat": 35.431944,
        "lng": -0.245278
      },
      {
        "name": "El Bordj",
        "name_ar": "البرج",
        "daira": "El Bordj",
        "postal_code": "29012",
        "lat": 35.515833,
        "lng": 0.3017
      },
      {
        "name": "El Gaada",
        "name_ar": "القعدة",
        "daira": "Zahana",
        "postal_code": "29041",
        "lat": 35.533333,
        "lng": -0.183333
      },
      {
        "name": "El Ghomri",
        "name_ar": "الغمري",
        "daira": "Mohammadia",
        "postal_code": "29023",
        "lat": 35.688311,
        "lng": 0.206981
      },
      {
        "name": "El Gueitena",
        "name_ar": "القطنة",
        "daira": "Bou Hanifia",
        "postal_code": "29042",
        "lat": 35.252272,
        "lng": 0.0528
      },
      {
        "name": "El Hachem",
        "name_ar": "الحشم",
        "daira": "Hachem",
        "postal_code": "29013",
        "lat": 35.366667,
        "lng": 0.15
      },
      {
        "name": "El Keurt",
        "name_ar": "القرط",
        "daira": "Tizi",
        "postal_code": "29043",
        "lat": 35.381111,
        "lng": 0.091667
      },
      {
        "name": "El Mamounia",
        "name_ar": "المأمونية",
        "daira": "Aïn Fares",
        "postal_code": "29056",
        "lat": 35.433333,
        "lng": 0.2449
      },
      {
        "name": "El Menaouer",
        "name_ar": "المنور",
        "daira": "El Bordj",
        "postal_code": "29044",
        "lat": 35.394444,
        "lng": 0.371392
      },
      {
        "name": "Ferraguig",
        "name_ar": "فراقيق",
        "daira": "Mohammadia",
        "postal_code": "29046",
        "lat": 35.583333,
        "lng": 0.053659
      },
      {
        "name": "Froha",
        "name_ar": "فروحة",
        "daira": "Tizi",
        "postal_code": "29024",
        "lat": 35.302664,
        "lng": 0.128254
      },
      {
        "name": "Gharrous",
        "name_ar": "غروس",
        "daira": "Aouf",
        "postal_code": "29047",
        "lat": 35.195833,
        "lng": 0.400833
      },
      {
        "name": "Ghriss",
        "name_ar": "غريس",
        "daira": "Ghriss",
        "postal_code": "29006",
        "lat": 35.216944,
        "lng": 0.1614
      },
      {
        "name": "Guerdjoum",
        "name_ar": "قرجوم",
        "daira": "Oued Taria",
        "postal_code": "29050",
        "lat": 35.15,
        "lng": 0.053659
      },
      {
        "name": "Hacine",
        "name_ar": "حسين",
        "daira": "Bou Hanifia",
        "postal_code": "29014",
        "lat": 35.333333,
        "lng": 0.09833
      },
      {
        "name": "Khalouia",
        "name_ar": "خلوية",
        "daira": "El Bordj",
        "postal_code": "29025",
        "lat": 35.4614,
        "lng": 0.150556
      },
      {
        "name": "Makhda",
        "name_ar": "ماقضة",
        "daira": "Ghriss",
        "postal_code": "29055",
        "lat": 35.15,
        "lng": 0.15
      },
      {
        "name": "Maoussa",
        "name_ar": "ماوسة",
        "daira": "Ghriss",
        "postal_code": "29015",
        "lat": 35.31299,
        "lng": 0.2025
      },
      {
        "name": "Mascara",
        "name_ar": "معسكر",
        "daira": "Mascara",
        "postal_code": "29000",
        "lat": 35.4,
        "lng": 0.133333
      },
      {
        "name": "Matemore",
        "name_ar": "المطمور",
        "daira": "Ghriss",
        "postal_code": "29026",
        "lat": 35.361406,
        "lng": 0.053659
      },
      {
        "name": "Mocta-Douz",
        "name_ar": "مقطع الدوز",
        "daira": "Mohammadia",
        "postal_code": "29027",
        "lat": 35.606803,
        "lng": -0.04899
      },
      {
        "name": "Mohammadia",
        "name_ar": "المحمدية",
        "daira": "Mohammadia",
        "postal_code": "29002",
        "lat": 35.58839,
        "lng": 0.0667
      },
      {
        "name": "Nesmot",
        "name_ar": "نسمط",
        "daira": "Hachem",
        "postal_code": "29058",
        "lat": 35.21222,
        "lng": 0.245833
      },
      {
        "name": "Oggaz",
        "name_ar": "عقاز",
        "daira": "Oggaz",
        "postal_code": "29029",
        "lat": 35.566667,
        "lng": -0.25967
      },
      {
        "name": "Oued El Abtal",
        "name_ar": "وادي الأبطال",
        "daira": "Oued El Abtal",
        "postal_code": "29016",
        "lat": 35.455952,
        "lng": 0.688
      },
      {
        "name": "Oued Taria",
        "name_ar": "وادي التاغية",
        "daira": "Oued Taria",
        "postal_code": "29017",
        "lat": 35.11309,
        "lng": 0.091032
      },
      {
        "name": "Ras El Ain Amirouche",
        "name_ar": "رأس عين عميروش",
        "daira": "Oggaz",
        "postal_code": "29060",
        "lat": 35.5925,
        "lng": -0.2125
      },
      {
        "name": "Sedjerara",
        "name_ar": "سجرارة",
        "daira": "Mohammadia",
        "postal_code": "29062",
        "lat": 35.5397,
        "lng": 0.213889
      },
      {
        "name": "Sehailia",
        "name_ar": "السهايلية",
        "daira": "Tighennif",
        "postal_code": "29063",
        "lat": 35.316667,
        "lng": 0.15
      },
      {
        "name": "Sidi Abdeldjebar",
        "name_ar": "سيدي عبد الجبار",
        "daira": "Oued El Abtal",
        "postal_code": "29065",
        "lat": 35.258611,
        "lng": 0.523331
      },
      {
        "name": "Sidi Abdelmoumene",
        "name_ar": "سيدي عبد المومن",
        "daira": "Mohammadia",
        "postal_code": "29066",
        "lat": 35.652778,
        "lng": 0.013889
      },
      {
        "name": "Sidi Boussaid",
        "name_ar": "سيدي بوسعيد",
        "daira": "Ghriss",
        "postal_code": "29069",
        "lat": 35.250556,
        "lng": 0.296389
      },
      {
        "name": "Sidi Kada",
        "name_ar": "سيدي قادة",
        "daira": "Tighennif",
        "postal_code": "29030",
        "lat": 35.333333,
        "lng": 0.343889
      },
      {
        "name": "Sig",
        "name_ar": "سيق",
        "daira": "Sig",
        "postal_code": "29001",
        "lat": 35.5283,
        "lng": -0.192778
      },
      {
        "name": "Tighennif",
        "name_ar": "تيغنيف",
        "daira": "Tighennif",
        "postal_code": "29004",
        "lat": 35.414314,
        "lng": 0.329233
      },
      {
        "name": "Tizi",
        "name_ar": "تيزي",
        "daira": "Tizi",
        "postal_code": "29018",
        "lat": 35.31603,
        "lng": 0.154215
      },
      {
        "name": "Zahana",
        "name_ar": "زهانة",
        "daira": "Zahana",
        "postal_code": "29019",
        "lat": 35.483333,
        "lng": -0.15
      },
      {
        "name": "Zelamta",
        "name_ar": "زلامطة",
        "daira": "Hachem",
        "postal_code": "29057",
        "lat": 35.29108,
        "lng": 0.47622
      }
    ]
  },
  {
    "code": "30",
    "name": "Ouargla",
    "name_ar": "ورقلة",
    "lat": 31.95,
    "lng": 5.317,
    "communes": [
      {
        "name": "Ain Beida",
        "name_ar": "عين البيضاء",
        "daira": "Sidi Khouiled",
        "postal_code": "30019",
        "lat": 31.9377,
        "lng": 5.39954
      },
      {
        "name": "El Borma",
        "name_ar": "البرمة",
        "daira": "El Borma",
        "postal_code": "30025",
        "lat": 31.656389,
        "lng": 9.179167
      },
      {
        "name": "Hassi Ben Abdellah",
        "name_ar": "حاسي بن عبد الله",
        "daira": "Sidi Khouiled",
        "postal_code": "30052",
        "lat": 32.025833,
        "lng": 5.468611
      },
      {
        "name": "Hassi Messaoud",
        "name_ar": "حاسي مسعود",
        "daira": "Hassi Messaoud",
        "postal_code": "30001",
        "lat": 31.7019,
        "lng": 6.073
      },
      {
        "name": "N'goussa",
        "name_ar": "انقوسة",
        "daira": "N'Goussa",
        "postal_code": "30031",
        "lat": 32.141111,
        "lng": 5.3096
      },
      {
        "name": "Ouargla",
        "name_ar": "ورقلة",
        "daira": "Ouargla",
        "postal_code": "30000",
        "lat": 31.95,
        "lng": 5.3167
      },
      {
        "name": "Rouissat",
        "name_ar": "الرويسات",
        "daira": "Ouargla",
        "postal_code": "30013",
        "lat": 31.916667,
        "lng": 5.35
      },
      {
        "name": "Sidi Khouiled",
        "name_ar": "سيدي خويلد",
        "daira": "Sidi Khouiled",
        "postal_code": "30035",
        "lat": 31.979722,
        "lng": 5.418333
      }
    ]
  },
  {
    "code": "31",
    "name": "Oran",
    "name_ar": "وهران",
    "lat": 35.69694,
    "lng": -0.63306,
    "communes": [
      {
        "name": "Ain Biya",
        "name_ar": "عين البية",
        "daira": "Bethioua",
        "postal_code": "31040",
        "lat": 35.816667,
        "lng": -0.281675
      },
      {
        "name": "Ain Kerma",
        "name_ar": "عين الكرمة",
        "daira": "Boutlelis",
        "postal_code": "31059",
        "lat": 35.648979,
        "lng": -0.975702
      },
      {
        "name": "Ain Turk",
        "name_ar": "عين الترك",
        "daira": "Aïn El Turk",
        "postal_code": "31014",
        "lat": 35.74494,
        "lng": -0.7697
      },
      {
        "name": "Arzew",
        "name_ar": "أرزيو",
        "daira": "Arzew",
        "postal_code": "31004",
        "lat": 35.85048,
        "lng": -0.3167
      },
      {
        "name": "Ben Freha",
        "name_ar": "بن فريحة",
        "daira": "Gdyel",
        "postal_code": "31063",
        "lat": 35.693721,
        "lng": -0.418655
      },
      {
        "name": "Bethioua",
        "name_ar": "بطيوة",
        "daira": "Bethioua",
        "postal_code": "31015",
        "lat": 35.805837,
        "lng": -0.2596
      },
      {
        "name": "Bir El Djir",
        "name_ar": "بئر الجير",
        "daira": "Bir El Djir",
        "postal_code": "31023",
        "lat": 35.7368,
        "lng": -0.545
      },
      {
        "name": "Boufatis",
        "name_ar": "بوفاتيس",
        "daira": "Oued Tlelat",
        "postal_code": "31024",
        "lat": 35.6791,
        "lng": -0.481667
      },
      {
        "name": "Bousfer",
        "name_ar": "بوسفر",
        "daira": "Aïn El Turk",
        "postal_code": "31025",
        "lat": 35.710833,
        "lng": -0.810556
      },
      {
        "name": "Boutlelis",
        "name_ar": "بوتليليس",
        "daira": "Boutlelis",
        "postal_code": "31016",
        "lat": 35.573,
        "lng": -0.8342
      },
      {
        "name": "El Ancor",
        "name_ar": "العنصر",
        "daira": "Aïn El Turk",
        "postal_code": "31043",
        "lat": 35.7408,
        "lng": -0.866667
      },
      {
        "name": "El Braya",
        "name_ar": "البراية",
        "daira": "Oued Tlelat",
        "postal_code": "31070",
        "lat": 35.612222,
        "lng": -0.516667
      },
      {
        "name": "El Kerma",
        "name_ar": "الكرمة",
        "daira": "Es Senia",
        "postal_code": "31026",
        "lat": 35.618681,
        "lng": -0.578611
      },
      {
        "name": "Es Senia",
        "name_ar": "السانية",
        "daira": "Es Senia",
        "postal_code": "31005",
        "lat": 35.6478,
        "lng": -0.62418
      },
      {
        "name": "Gdyel",
        "name_ar": "قديل",
        "daira": "Gdyel",
        "postal_code": "31017",
        "lat": 35.805267,
        "lng": -0.423746
      },
      {
        "name": "Hassi Ben Okba",
        "name_ar": "حاسي بن عقبة",
        "daira": "Bir El Djir",
        "postal_code": "31049",
        "lat": 35.72964,
        "lng": -0.465833
      },
      {
        "name": "Hassi Bounif",
        "name_ar": "حاسي بونيف",
        "daira": "Bir El Djir",
        "postal_code": "31028",
        "lat": 35.679278,
        "lng": -0.5
      },
      {
        "name": "Hassi Mefsoukh",
        "name_ar": "حاسي مفسوخ",
        "daira": "Gdyel",
        "postal_code": "31050",
        "lat": 35.7861,
        "lng": -0.374167
      },
      {
        "name": "Marsat El Hadjadj",
        "name_ar": "مرسى الحجاج",
        "daira": "Bethioua",
        "postal_code": "31030",
        "lat": 35.783333,
        "lng": -0.166667
      },
      {
        "name": "Mers El Kebir",
        "name_ar": "المرسى الكبير",
        "daira": "Aïn El Turk",
        "postal_code": "31019",
        "lat": 35.728611,
        "lng": -0.706944
      },
      {
        "name": "Messerghin",
        "name_ar": "مسرغين",
        "daira": "Boutlelis",
        "postal_code": "31031",
        "lat": 35.645561,
        "lng": -0.772297
      },
      {
        "name": "Oran",
        "name_ar": "وهران",
        "daira": "Oran",
        "postal_code": "31000",
        "lat": 35.708333,
        "lng": -0.6331
      },
      {
        "name": "Oued Tlelat",
        "name_ar": "وادي تليلات",
        "daira": "Oued Tlelat",
        "postal_code": "31037",
        "lat": 35.551924,
        "lng": -0.45226
      },
      {
        "name": "Sidi Ben Yebka",
        "name_ar": "سيدي بن يبقى",
        "daira": "Arzew",
        "postal_code": "31058",
        "lat": 35.82972,
        "lng": -0.394722
      },
      {
        "name": "Sidi Chami",
        "name_ar": "سيدي الشحمي",
        "daira": "Es Senia",
        "postal_code": "31038",
        "lat": 35.62687,
        "lng": -0.5217
      },
      {
        "name": "Tafraoui",
        "name_ar": "طفراوي",
        "daira": "Oued Tlelat",
        "postal_code": "31077",
        "lat": 35.483333,
        "lng": -0.516667
      }
    ]
  },
  {
    "code": "32",
    "name": "El Bayadh",
    "name_ar": "البيض",
    "lat": 33.68028,
    "lng": 1.02028,
    "communes": [
      {
        "name": "Ain El Orak",
        "name_ar": "عين العراك",
        "daira": "El Abiodh Sidi Cheikh",
        "postal_code": "",
        "lat": 33.410057,
        "lng": 0.73853
      },
      {
        "name": "Arbaouat",
        "name_ar": "اربوات",
        "daira": "El Abiodh Sidi Cheikh",
        "postal_code": "",
        "lat": 33.088333,
        "lng": 0.5823
      },
      {
        "name": "Boualem",
        "name_ar": "بوعلام",
        "daira": "Boualem",
        "postal_code": "32006",
        "lat": 33.72903,
        "lng": 1.532968
      },
      {
        "name": "Bougtoub",
        "name_ar": "بوقطب",
        "daira": "Bougtoub",
        "postal_code": "32001",
        "lat": 34.143611,
        "lng": 0.033333
      },
      {
        "name": "Boussemghoun",
        "name_ar": "بوسمغون",
        "daira": "Boussemghoun",
        "postal_code": "",
        "lat": 32.8643,
        "lng": 0.0201
      },
      {
        "name": "Brezina",
        "name_ar": "بريزينة",
        "daira": "Brezina",
        "postal_code": "32002",
        "lat": 33.083333,
        "lng": 1.261
      },
      {
        "name": "Cheguig",
        "name_ar": "الشقيق",
        "daira": "Rogassa",
        "postal_code": "32022",
        "lat": 34.168889,
        "lng": 1.228056
      },
      {
        "name": "Chellala",
        "name_ar": "شلالة",
        "daira": "Chellala",
        "postal_code": "",
        "lat": 33.032707,
        "lng": 0.058682
      },
      {
        "name": "El Bayadh",
        "name_ar": "البيض",
        "daira": "El Bayadh",
        "postal_code": "32000",
        "lat": 33.721667,
        "lng": 1.020278
      },
      {
        "name": "El Bnoud",
        "name_ar": "البنود",
        "daira": "El Abiodh Sidi Cheikh",
        "postal_code": "",
        "lat": 32.312222,
        "lng": 0.244444
      },
      {
        "name": "El Kheiter",
        "name_ar": "الخيثر",
        "daira": "Bougtoub",
        "postal_code": "32011",
        "lat": 34.143333,
        "lng": 0.073333
      },
      {
        "name": "El Mehara",
        "name_ar": "المحرة",
        "daira": "Chellala",
        "postal_code": "",
        "lat": 33.311667,
        "lng": 0.364444
      },
      {
        "name": "Ghassoul",
        "name_ar": "الغاسول",
        "daira": "Brezina",
        "postal_code": "32017",
        "lat": 33.377222,
        "lng": 1.203056
      },
      {
        "name": "Kef El Ahmar",
        "name_ar": "الكاف الأحمر",
        "daira": "Rogassa",
        "postal_code": "32013",
        "lat": 34.15,
        "lng": 0.597544
      },
      {
        "name": "Krakda",
        "name_ar": "كراكدة",
        "daira": "Brezina",
        "postal_code": "32027",
        "lat": 33.319167,
        "lng": 0.957222
      },
      {
        "name": "Labiodh Sidi Cheikh",
        "name_ar": "الأبيض سيدي الشيخ",
        "daira": "El Abiodh Sidi Cheikh",
        "postal_code": "",
        "lat": 32.898611,
        "lng": 0.544444
      },
      {
        "name": "Rogassa",
        "name_ar": "رقاصة",
        "daira": "Rogassa",
        "postal_code": "32018",
        "lat": 34.01889,
        "lng": 0.927137
      },
      {
        "name": "Sidi Ameur",
        "name_ar": "سيدي عامر",
        "daira": "Boualem",
        "postal_code": "32029",
        "lat": 33.768333,
        "lng": 1.413611
      },
      {
        "name": "Sidi Slimane",
        "name_ar": "سيدي سليمان",
        "daira": "Boualem",
        "postal_code": "32031",
        "lat": 33.833333,
        "lng": 0.554708
      },
      {
        "name": "Sidi Tiffour",
        "name_ar": "سيدي طيفور",
        "daira": "Boualem",
        "postal_code": "32032",
        "lat": 33.717201,
        "lng": 1.682711
      },
      {
        "name": "Stitten",
        "name_ar": "ستيتن",
        "daira": "Boualem",
        "postal_code": "32033",
        "lat": 33.758056,
        "lng": 1.223333
      },
      {
        "name": "Tousmouline",
        "name_ar": "توسمولين",
        "daira": "Bougtoub",
        "postal_code": "32034",
        "lat": 33.651667,
        "lng": 0.266667
      }
    ]
  },
  {
    "code": "33",
    "name": "Illizi",
    "name_ar": "إليزي",
    "lat": 26.505,
    "lng": 8.482,
    "communes": [
      {
        "name": "Bordj Omar Driss",
        "name_ar": "برج عمر إدريس",
        "daira": "Bordj Omar Driss",
        "postal_code": "33003",
        "lat": 28.146389,
        "lng": 6.725909
      },
      {
        "name": "Debdeb",
        "name_ar": "دبداب",
        "daira": "Debdeb",
        "postal_code": "33004",
        "lat": 29.967108,
        "lng": 9.422727
      },
      {
        "name": "Illizi",
        "name_ar": "إيليزي",
        "daira": "Illizi",
        "postal_code": "33000",
        "lat": 26.483333,
        "lng": 8.483333
      },
      {
        "name": "In Amenas",
        "name_ar": "إن أمناس",
        "daira": "In Amenas",
        "postal_code": "33001",
        "lat": 28.040833,
        "lng": 9.635
      }
    ]
  },
  {
    "code": "34",
    "name": "Bordj Bou Arréridj",
    "name_ar": "برج بوعريريج",
    "lat": 36.067,
    "lng": 4.767,
    "communes": [
      {
        "name": "Ain Taghrout",
        "name_ar": "عين تاغروت",
        "daira": "Aïn Taghrout",
        "postal_code": "34010",
        "lat": 36.128889,
        "lng": 5.076667
      },
      {
        "name": "Ain Tesra",
        "name_ar": "عين تسرة",
        "daira": "Ras El Oued",
        "postal_code": "34027",
        "lat": 36.0125,
        "lng": 5.002222
      },
      {
        "name": "Belimour",
        "name_ar": "بليمور",
        "daira": "Bordj Ghedir",
        "postal_code": "34025",
        "lat": 36.027222,
        "lng": 4.833333
      },
      {
        "name": "Ben Daoud",
        "name_ar": "بن داود",
        "daira": "Mansoura",
        "postal_code": "34039",
        "lat": 36.19702,
        "lng": 4.4025
      },
      {
        "name": "Bir Kasdali",
        "name_ar": "بئر قاصد علي",
        "daira": "Bir Kasdali",
        "postal_code": "34011",
        "lat": 36.15,
        "lng": 5.033333
      },
      {
        "name": "Bordj Bou Arreridj",
        "name_ar": "برج بوعريرج",
        "daira": "Bordj Bou Arreridj",
        "postal_code": "34000",
        "lat": 36.070419,
        "lng": 4.766667
      },
      {
        "name": "Bordj Ghedir",
        "name_ar": "برج الغدير",
        "daira": "Bordj Ghedir",
        "postal_code": "34004",
        "lat": 35.899189,
        "lng": 4.899182
      },
      {
        "name": "Bordj Zemmoura",
        "name_ar": "برج زمورة",
        "daira": "Bordj Zemoura",
        "postal_code": "34005",
        "lat": 36.267731,
        "lng": 4.855833
      },
      {
        "name": "Colla",
        "name_ar": "القلة",
        "daira": "Djaafra",
        "postal_code": "34015",
        "lat": 36.10161,
        "lng": 4.6589
      },
      {
        "name": "Djaafra",
        "name_ar": "جعافرة",
        "daira": "Djaafra",
        "postal_code": "34016",
        "lat": 36.29227,
        "lng": 4.662837
      },
      {
        "name": "El Achir",
        "name_ar": "الياشير",
        "daira": "Medjana",
        "postal_code": "34006",
        "lat": 36.06386,
        "lng": 4.6167
      },
      {
        "name": "El Annasseur",
        "name_ar": "العناصر",
        "daira": "Bordj Ghedir",
        "postal_code": "34030",
        "lat": 36.064213,
        "lng": 4.833333
      },
      {
        "name": "El Euch",
        "name_ar": "العش",
        "daira": "El Hamadia",
        "postal_code": "",
        "lat": 36.06386,
        "lng": 4.6167
      },
      {
        "name": "El M'hir",
        "name_ar": "المهير",
        "daira": "Mansoura",
        "postal_code": "34019",
        "lat": 36.119384,
        "lng": 4.384073
      },
      {
        "name": "El Main",
        "name_ar": "الماين",
        "daira": "Djaafra",
        "postal_code": "34018",
        "lat": 36.425556,
        "lng": 4.716667
      },
      {
        "name": "Elhammadia",
        "name_ar": "الحمادية",
        "daira": "El Hamadia",
        "postal_code": "34017",
        "lat": 35.976944,
        "lng": 4.7475
      },
      {
        "name": "Ghailasa",
        "name_ar": "غيلاسة",
        "daira": "Bordj Ghedir",
        "postal_code": "34031",
        "lat": 35.981389,
        "lng": 4.9167
      },
      {
        "name": "Haraza",
        "name_ar": "حرازة",
        "daira": "Mansoura",
        "postal_code": "34047",
        "lat": 36.156389,
        "lng": 4.223333
      },
      {
        "name": "Hasnaoua",
        "name_ar": "حسناوة",
        "daira": "Medjana",
        "postal_code": "34014",
        "lat": 36.140833,
        "lng": 4.7957
      },
      {
        "name": "Khelil",
        "name_ar": "خليل",
        "daira": "Bir Kasdali",
        "postal_code": "34007",
        "lat": 36.175556,
        "lng": 5.029167
      },
      {
        "name": "Ksour",
        "name_ar": "القصور",
        "daira": "El Hamadia",
        "postal_code": "34048",
        "lat": 35.983333,
        "lng": 4.597778
      },
      {
        "name": "Mansoura",
        "name_ar": "المنصورة",
        "daira": "Mansoura",
        "postal_code": "34008",
        "lat": 36.08725,
        "lng": 4.46
      },
      {
        "name": "Medjana",
        "name_ar": "مجانة",
        "daira": "Medjana",
        "postal_code": "34009",
        "lat": 36.1319,
        "lng": 4.669
      },
      {
        "name": "Ouled Brahem",
        "name_ar": "أولاد أبراهم",
        "daira": "Ras El Oued",
        "postal_code": "34032",
        "lat": 35.873382,
        "lng": 5.074722
      },
      {
        "name": "Ouled Dahmane",
        "name_ar": "أولاد دحمان",
        "daira": "Bordj Zemoura",
        "postal_code": "34033",
        "lat": 36.3667,
        "lng": 4.77
      },
      {
        "name": "Ouled Sidi-Brahim",
        "name_ar": "أولاد سيدي ابراهيم",
        "daira": "Mansoura",
        "postal_code": "34052",
        "lat": 36.228056,
        "lng": 4.335556
      },
      {
        "name": "Rabta",
        "name_ar": "الرابطة",
        "daira": "El Hamadia",
        "postal_code": "34035",
        "lat": 35.922778,
        "lng": 4.78119
      },
      {
        "name": "Ras El Oued",
        "name_ar": "رأس الوادي",
        "daira": "Ras El Oued",
        "postal_code": "34001",
        "lat": 35.949722,
        "lng": 5.033333
      },
      {
        "name": "Sidi-Embarek",
        "name_ar": "سيدي أمبارك",
        "daira": "Bir Kasdali",
        "postal_code": "34020",
        "lat": 36.1039,
        "lng": 4.91188
      },
      {
        "name": "Taglait",
        "name_ar": "تقلعيت",
        "daira": "Bordj Ghedir",
        "postal_code": "34059",
        "lat": 35.771667,
        "lng": 4.999722
      },
      {
        "name": "Tassamert",
        "name_ar": "تسامرت",
        "daira": "Bordj Zemoura",
        "postal_code": "34026",
        "lat": 36.27131,
        "lng": 4.82184
      },
      {
        "name": "Tefreg",
        "name_ar": "تفرق",
        "daira": "Djaafra",
        "postal_code": "34053",
        "lat": 36.425556,
        "lng": 4.713889
      },
      {
        "name": "Teniet En Nasr",
        "name_ar": "ثنية النصر",
        "daira": "Medjana",
        "postal_code": "34021",
        "lat": 36.083333,
        "lng": 4.601111
      },
      {
        "name": "Tixter",
        "name_ar": "تيكستار",
        "daira": "Aïn Taghrout",
        "postal_code": "34022",
        "lat": 36.0475,
        "lng": 4.654722
      }
    ]
  },
  {
    "code": "35",
    "name": "Boumerdès",
    "name_ar": "بومرداس",
    "lat": 36.76034,
    "lng": 3.47236,
    "communes": [
      {
        "name": "Afir",
        "name_ar": "أعفير",
        "daira": "Dellys",
        "postal_code": "35022",
        "lat": 36.7675,
        "lng": 3.702778
      },
      {
        "name": "Ammal",
        "name_ar": "عمال",
        "daira": "Thenia",
        "postal_code": "35031",
        "lat": 36.633333,
        "lng": 3.586111
      },
      {
        "name": "Baghlia",
        "name_ar": "بغلية",
        "daira": "Baghlia",
        "postal_code": "35013",
        "lat": 36.81694,
        "lng": 3.875712
      },
      {
        "name": "Ben Choud",
        "name_ar": "بن شود",
        "daira": "Dellys",
        "postal_code": "35033",
        "lat": 36.862352,
        "lng": 3.880577
      },
      {
        "name": "Beni Amrane",
        "name_ar": "بني عمران",
        "daira": "Thenia",
        "postal_code": "35006",
        "lat": 36.66774,
        "lng": 3.591944
      },
      {
        "name": "Bordj Menaiel",
        "name_ar": "برج منايل",
        "daira": "Bordj Menaiel",
        "postal_code": "35001",
        "lat": 36.741667,
        "lng": 3.717567
      },
      {
        "name": "Boudouaou",
        "name_ar": "بودواو",
        "daira": "Boudouaou",
        "postal_code": "35003",
        "lat": 36.72735,
        "lng": 3.40995
      },
      {
        "name": "Boudouaou El Bahri",
        "name_ar": "بودواو البحري",
        "daira": "Boudouaou",
        "postal_code": "35037",
        "lat": 36.7732,
        "lng": 3.387271
      },
      {
        "name": "Boumerdes",
        "name_ar": "بومرداس",
        "daira": "Boumerdès",
        "postal_code": "35000",
        "lat": 36.766,
        "lng": 3.477
      },
      {
        "name": "Bouzegza Keddara",
        "name_ar": "بوزقزة قدارة",
        "daira": "Boudouaou",
        "postal_code": "35038",
        "lat": 36.625278,
        "lng": 3.479444
      },
      {
        "name": "Chabet El Ameur",
        "name_ar": "شعبة العامر",
        "daira": "Isser",
        "postal_code": "35008",
        "lat": 36.63709,
        "lng": 3.683333
      },
      {
        "name": "Corso",
        "name_ar": "قورصو",
        "daira": "Boumerdès",
        "postal_code": "35014",
        "lat": 36.75096,
        "lng": 3.468205
      },
      {
        "name": "Dellys",
        "name_ar": "دلس",
        "daira": "Dellys",
        "postal_code": "35004",
        "lat": 36.913272,
        "lng": 3.914094
      },
      {
        "name": "Djinet",
        "name_ar": "جنات",
        "daira": "Bordj Menaiel",
        "postal_code": "35024",
        "lat": 36.877991,
        "lng": 3.7205
      },
      {
        "name": "El Kharrouba",
        "name_ar": "الخروبة",
        "daira": "Boudouaou",
        "postal_code": "35048",
        "lat": 36.657681,
        "lng": 3.406389
      },
      {
        "name": "Hammedi",
        "name_ar": "حمادي",
        "daira": "Khemis El Khechna",
        "postal_code": "35015",
        "lat": 36.676944,
        "lng": 3.263392
      },
      {
        "name": "Isser",
        "name_ar": "يسر",
        "daira": "Isser",
        "postal_code": "35009",
        "lat": 36.706667,
        "lng": 3.671389
      },
      {
        "name": "Khemis El Khechna",
        "name_ar": "خميس الخشنة",
        "daira": "Khemis El Khechna",
        "postal_code": "35010",
        "lat": 36.65,
        "lng": 3.3308
      },
      {
        "name": "Larbatache",
        "name_ar": "الاربعطاش",
        "daira": "Khemis El Khechna",
        "postal_code": "35017",
        "lat": 36.636808,
        "lng": 3.371877
      },
      {
        "name": "Leghata",
        "name_ar": "لقاطة",
        "daira": "Bordj Menaiel",
        "postal_code": "35026",
        "lat": 36.746111,
        "lng": 3.683056
      },
      {
        "name": "Naciria",
        "name_ar": "الناصرية",
        "daira": "Naciria",
        "postal_code": "35018",
        "lat": 36.7475,
        "lng": 3.833333
      },
      {
        "name": "Ouled Aissa",
        "name_ar": "أولاد عيسى",
        "daira": "Naciria",
        "postal_code": "35050",
        "lat": 36.806667,
        "lng": 3.81431
      },
      {
        "name": "Ouled Hedadj",
        "name_ar": "أولاد هداج",
        "daira": "Boudouaou",
        "postal_code": "35045",
        "lat": 36.713054,
        "lng": 3.35
      },
      {
        "name": "Ouled Moussa",
        "name_ar": "أولاد موسى",
        "daira": "Khemis El Khechna",
        "postal_code": "35011",
        "lat": 36.685741,
        "lng": 3.389289
      },
      {
        "name": "Si Mustapha",
        "name_ar": "سي مصطفى",
        "daira": "Isser",
        "postal_code": "35028",
        "lat": 36.7247,
        "lng": 3.615306
      },
      {
        "name": "Sidi Daoud",
        "name_ar": "سيدي داود",
        "daira": "Baghlia",
        "postal_code": "35019",
        "lat": 36.85,
        "lng": 3.85
      },
      {
        "name": "Souk El Had",
        "name_ar": "سوق الحد",
        "daira": "Thenia",
        "postal_code": "35020",
        "lat": 36.721404,
        "lng": 3.583333
      },
      {
        "name": "Taourga",
        "name_ar": "تاورقة",
        "daira": "Baghlia",
        "postal_code": "35029",
        "lat": 36.7939,
        "lng": 3.95034
      },
      {
        "name": "Thenia",
        "name_ar": "الثنية",
        "daira": "Thenia",
        "postal_code": "35005",
        "lat": 36.7254,
        "lng": 3.553889
      },
      {
        "name": "Tidjelabine",
        "name_ar": "تيجلابين",
        "daira": "Boumerdès",
        "postal_code": "35021",
        "lat": 36.7305,
        "lng": 3.49482
      },
      {
        "name": "Timezrit",
        "name_ar": "تيمزريت",
        "daira": "Isser",
        "postal_code": "35027",
        "lat": 36.673333,
        "lng": 3.806389
      },
      {
        "name": "Zemmouri",
        "name_ar": "زموري",
        "daira": "Bordj Menaiel",
        "postal_code": "35012",
        "lat": 36.783333,
        "lng": 3.6036
      }
    ]
  },
  {
    "code": "36",
    "name": "El Tarf",
    "name_ar": "الطارف",
    "lat": 36.767,
    "lng": 8.317,
    "communes": [
      {
        "name": "Ain El Assel",
        "name_ar": "عين العسل",
        "daira": "El Tarf",
        "postal_code": "36010",
        "lat": 36.79475,
        "lng": 8.429389
      },
      {
        "name": "Ain Kerma",
        "name_ar": "عين الكرمة",
        "daira": "Bouhadjar",
        "postal_code": "36011",
        "lat": 36.564454,
        "lng": 8.201111
      },
      {
        "name": "Asfour",
        "name_ar": "عصفور",
        "daira": "Besbes",
        "postal_code": "36012",
        "lat": 36.674167,
        "lng": 7.742806
      },
      {
        "name": "Ben M Hidi",
        "name_ar": "بن مهيدي",
        "daira": "Ben Mehidi",
        "postal_code": "36003",
        "lat": 36.775015,
        "lng": 7.905595
      },
      {
        "name": "Berrihane",
        "name_ar": "بريحان",
        "daira": "Ben Mehidi",
        "postal_code": "36027",
        "lat": 36.837222,
        "lng": 8.068343
      },
      {
        "name": "Besbes",
        "name_ar": "البسباس",
        "daira": "Besbes",
        "postal_code": "36004",
        "lat": 36.702222,
        "lng": 7.847222
      },
      {
        "name": "Bougous",
        "name_ar": "بوقوس",
        "daira": "El Tarf",
        "postal_code": "36029",
        "lat": 36.758056,
        "lng": 8.369444
      },
      {
        "name": "Bouhadjar",
        "name_ar": "بوحجار",
        "daira": "Bouhadjar",
        "postal_code": "36005",
        "lat": 36.503417,
        "lng": 8.110556
      },
      {
        "name": "Bouteldja",
        "name_ar": "بوثلجة",
        "daira": "Bouteldja",
        "postal_code": "36006",
        "lat": 36.85,
        "lng": 8.202423
      },
      {
        "name": "Chebaita Mokhtar",
        "name_ar": "شبيطة مختار",
        "daira": "Drean",
        "postal_code": "36013",
        "lat": 36.755843,
        "lng": 7.741667
      },
      {
        "name": "Chefia",
        "name_ar": "الشافية",
        "daira": "Bouteldja",
        "postal_code": "36032",
        "lat": 36.611111,
        "lng": 8.163277
      },
      {
        "name": "Chihani",
        "name_ar": "شحاني",
        "daira": "Drean",
        "postal_code": "36014",
        "lat": 36.646944,
        "lng": 7.775556
      },
      {
        "name": "Drean",
        "name_ar": "الذرعـان",
        "daira": "Drean",
        "postal_code": "36001",
        "lat": 36.683333,
        "lng": 7.75
      },
      {
        "name": "Echatt",
        "name_ar": "الشط",
        "daira": "Ben Mehidi",
        "postal_code": "36007",
        "lat": 36.830278,
        "lng": 7.872
      },
      {
        "name": "El Aioun",
        "name_ar": "العيون",
        "daira": "El Kala",
        "postal_code": "36018",
        "lat": 36.827222,
        "lng": 8.6
      },
      {
        "name": "El Kala",
        "name_ar": "القالة",
        "daira": "El Kala",
        "postal_code": "36002",
        "lat": 36.8956,
        "lng": 8.4433
      },
      {
        "name": "El Tarf",
        "name_ar": "الطارف",
        "daira": "El Tarf",
        "postal_code": "36000",
        "lat": 36.766719,
        "lng": 8.317
      },
      {
        "name": "Hammam Beni Salah",
        "name_ar": "حمام بني صالح",
        "daira": "Bouhadjar",
        "postal_code": "36036",
        "lat": 36.519722,
        "lng": 7.981084
      },
      {
        "name": "Lac Des Oiseaux",
        "name_ar": "بحيرة الطيور",
        "daira": "Bouteldja",
        "postal_code": "36019",
        "lat": 36.775556,
        "lng": 8.118056
      },
      {
        "name": "Oued Zitoun",
        "name_ar": "وادي الزيتون",
        "daira": "Bouhadjar",
        "postal_code": "36044",
        "lat": 36.466111,
        "lng": 8.0575
      },
      {
        "name": "Raml Souk",
        "name_ar": "رمل السوق",
        "daira": "El Kala",
        "postal_code": "36021",
        "lat": 36.786111,
        "lng": 8.535556
      },
      {
        "name": "Souarekh",
        "name_ar": "السوارخ",
        "daira": "El Kala",
        "postal_code": "36020",
        "lat": 36.881944,
        "lng": 8.564167
      },
      {
        "name": "Zerizer",
        "name_ar": "زريزر",
        "daira": "Besbes",
        "postal_code": "36015",
        "lat": 36.727222,
        "lng": 7.894722
      },
      {
        "name": "Zitouna",
        "name_ar": "الزيتونة",
        "daira": "El Tarf",
        "postal_code": "36023",
        "lat": 36.668056,
        "lng": 8.2346
      }
    ]
  },
  {
    "code": "37",
    "name": "Tindouf",
    "name_ar": "تندوف",
    "lat": 27.67528,
    "lng": -8.12861,
    "communes": [
      {
        "name": "Oum El Assel",
        "name_ar": "أم العسل",
        "daira": "Tindouf",
        "postal_code": "37003",
        "lat": 28.6125,
        "lng": -6.978889
      },
      {
        "name": "Tindouf",
        "name_ar": "تندوف",
        "daira": "Tindouf",
        "postal_code": "37000",
        "lat": 27.670556,
        "lng": -8.12724
      }
    ]
  },
  {
    "code": "38",
    "name": "Tissemsilt",
    "name_ar": "تيسمسيلت",
    "lat": 35.60778,
    "lng": 1.81111,
    "communes": [
      {
        "name": "Ammari",
        "name_ar": "عماري",
        "daira": "Ammari",
        "postal_code": "38012",
        "lat": 35.5771,
        "lng": 1.6623
      },
      {
        "name": "Beni Chaib",
        "name_ar": "بني شعيب",
        "daira": "Bordj Bou Naama",
        "postal_code": "38019",
        "lat": 35.820278,
        "lng": 1.799531
      },
      {
        "name": "Beni Lahcene",
        "name_ar": "بني لحسن",
        "daira": "Bordj Bou Naama",
        "postal_code": "38020",
        "lat": 35.8517,
        "lng": 1.624722
      },
      {
        "name": "Bordj Bounaama",
        "name_ar": "برج بونعامة",
        "daira": "Bordj Bou Naama",
        "postal_code": "38001",
        "lat": 35.850502,
        "lng": 1.617085
      },
      {
        "name": "Bordj El Emir Abdelkader",
        "name_ar": "برج الأمير عبد القادر",
        "daira": "Bordj El Emir Abdelkader",
        "postal_code": "38004",
        "lat": 35.865298,
        "lng": 2.267434
      },
      {
        "name": "Boucaid",
        "name_ar": "بوقائد",
        "daira": "Lazharia",
        "postal_code": "38005",
        "lat": 35.890278,
        "lng": 1.61978
      },
      {
        "name": "Khemisti",
        "name_ar": "خميستي",
        "daira": "Khemisti",
        "postal_code": "38006",
        "lat": 35.6667,
        "lng": 1.95
      },
      {
        "name": "Larbaa",
        "name_ar": "الأربعاء",
        "daira": "Lazharia",
        "postal_code": "38022",
        "lat": 35.937222,
        "lng": 1.475277
      },
      {
        "name": "Lardjem",
        "name_ar": "لرجام",
        "daira": "Lardjem",
        "postal_code": "38002",
        "lat": 35.7495,
        "lng": 1.5485
      },
      {
        "name": "Layoune",
        "name_ar": "العيون",
        "daira": "Khemisti",
        "postal_code": "38007",
        "lat": 35.6967,
        "lng": 1.99664
      },
      {
        "name": "Lazharia",
        "name_ar": "الأزهرية",
        "daira": "Lazharia",
        "postal_code": "38008",
        "lat": 35.937222,
        "lng": 1.56
      },
      {
        "name": "Maacem",
        "name_ar": "المعاصم",
        "daira": "Ammari",
        "postal_code": "38023",
        "lat": 35.659722,
        "lng": 1.603611
      },
      {
        "name": "Melaab",
        "name_ar": "الملعب",
        "daira": "Lardjem",
        "postal_code": "38013",
        "lat": 35.7495,
        "lng": 1.3325
      },
      {
        "name": "Ouled Bessam",
        "name_ar": "أولاد بسام",
        "daira": "Tissemsilt",
        "postal_code": "38014",
        "lat": 35.686389,
        "lng": 1.864167
      },
      {
        "name": "Sidi Abed",
        "name_ar": "سيدي عابد",
        "daira": "Ammari",
        "postal_code": "38025",
        "lat": 35.745278,
        "lng": 1.705
      },
      {
        "name": "Sidi Boutouchent",
        "name_ar": "سيدي بوتوشنت",
        "daira": "Theniet El Had",
        "postal_code": "38026",
        "lat": 35.825278,
        "lng": 1.951389
      },
      {
        "name": "Sidi Lantri",
        "name_ar": "سيدي العنتري",
        "daira": "Lardjem",
        "postal_code": "38027",
        "lat": 35.70139,
        "lng": 1.40223
      },
      {
        "name": "Sidi Slimane",
        "name_ar": "سيدي سليمان",
        "daira": "Bordj Bou Naama",
        "postal_code": "38028",
        "lat": 35.86,
        "lng": 1.833333
      },
      {
        "name": "Tamellahet",
        "name_ar": "تملاحت",
        "daira": "Lardjem",
        "postal_code": "38029",
        "lat": 35.711111,
        "lng": 1.631944
      },
      {
        "name": "Theniet El Had",
        "name_ar": "ثنية الاحد",
        "daira": "Theniet El Had",
        "postal_code": "38003",
        "lat": 35.87111,
        "lng": 2.016708
      },
      {
        "name": "Tissemsilt",
        "name_ar": "تيسمسيلت",
        "daira": "Tissemsilt",
        "postal_code": "38000",
        "lat": 35.60722,
        "lng": 1.8108
      },
      {
        "name": "Youssoufia",
        "name_ar": "اليوسفية",
        "daira": "Bordj El Emir Abdelkader",
        "postal_code": "38031",
        "lat": 35.948056,
        "lng": 2.112778
      }
    ]
  },
  {
    "code": "39",
    "name": "El Oued",
    "name_ar": "الوادي",
    "lat": 33.36111,
    "lng": 6.86056,
    "communes": [
      {
        "name": "Bayadha",
        "name_ar": "البياضة",
        "daira": "Bayadha",
        "postal_code": "39007",
        "lat": 33.334444,
        "lng": 6.888573
      },
      {
        "name": "Ben Guecha",
        "name_ar": "بن قشة",
        "daira": "Taleb Larbi",
        "postal_code": "39048",
        "lat": 33.355153,
        "lng": 7.1517
      },
      {
        "name": "Debila",
        "name_ar": "الدبيلة",
        "daira": "Debila",
        "postal_code": "39003",
        "lat": 33.51667,
        "lng": 6.95
      },
      {
        "name": "Douar El Maa",
        "name_ar": "دوار الماء",
        "daira": "Taleb Larbi",
        "postal_code": "39024",
        "lat": 33.372222,
        "lng": 7.686111
      },
      {
        "name": "El Ogla",
        "name_ar": "العقلة",
        "daira": "Robbah",
        "postal_code": "39055",
        "lat": 33.246667,
        "lng": 6.95
      },
      {
        "name": "El-Oued",
        "name_ar": "الوادي",
        "daira": "El Oued",
        "postal_code": "39000",
        "lat": 33.361111,
        "lng": 6.860556
      },
      {
        "name": "Guemar",
        "name_ar": "قمار",
        "daira": "Guemar",
        "postal_code": "39002",
        "lat": 33.5,
        "lng": 6.797791
      },
      {
        "name": "Hamraia",
        "name_ar": "الحمراية",
        "daira": "Reguiba",
        "postal_code": "39061",
        "lat": 34.110833,
        "lng": 6.230556
      },
      {
        "name": "Hassani Abdelkrim",
        "name_ar": "حساني عبد الكريم",
        "daira": "Debila",
        "postal_code": "39029",
        "lat": 33.477222,
        "lng": 6.895
      },
      {
        "name": "Hassi Khalifa",
        "name_ar": "حاسي خليفة",
        "daira": "Hassi Khalifa",
        "postal_code": "39013",
        "lat": 33.562222,
        "lng": 6.990278
      },
      {
        "name": "Kouinine",
        "name_ar": "كوينين",
        "daira": "El Oued",
        "postal_code": "39014",
        "lat": 33.403785,
        "lng": 6.826454
      },
      {
        "name": "Magrane",
        "name_ar": "المقرن",
        "daira": "Magrane",
        "postal_code": "39015",
        "lat": 33.499805,
        "lng": 6.930278
      },
      {
        "name": "Mih Ouansa",
        "name_ar": "اميه وانسة",
        "daira": "Mih Ouansa",
        "postal_code": "39030",
        "lat": 33.158611,
        "lng": 6.716944
      },
      {
        "name": "Nakhla",
        "name_ar": "النخلة",
        "daira": "Robbah",
        "postal_code": "39031",
        "lat": 33.280633,
        "lng": 6.878889
      },
      {
        "name": "Oued El Alenda",
        "name_ar": "وادي العلندة",
        "daira": "Mih Ouansa",
        "postal_code": "39033",
        "lat": 33.228889,
        "lng": 6.757222
      },
      {
        "name": "Ourmes",
        "name_ar": "ورماس",
        "daira": "Guemar",
        "postal_code": "39035",
        "lat": 33.541667,
        "lng": 6.416667
      },
      {
        "name": "Reguiba",
        "name_ar": "الرقيبة",
        "daira": "Reguiba",
        "postal_code": "39016",
        "lat": 33.56391,
        "lng": 6.703
      },
      {
        "name": "Robbah",
        "name_ar": "الرباح",
        "daira": "Robbah",
        "postal_code": "39017",
        "lat": 33.281111,
        "lng": 6.416671
      },
      {
        "name": "Sidi Aoun",
        "name_ar": "سيدي عون",
        "daira": "Magrane",
        "postal_code": "39037",
        "lat": 33.54212,
        "lng": 6.905
      },
      {
        "name": "Taghzout",
        "name_ar": "تغزوت",
        "daira": "Guemar",
        "postal_code": "39040",
        "lat": 32.966667,
        "lng": 6.7978
      },
      {
        "name": "Taleb Larbi",
        "name_ar": "الطالب العربي",
        "daira": "Taleb Larbi",
        "postal_code": "39019",
        "lat": 33.7275,
        "lng": 7.517222
      },
      {
        "name": "Trifaoui",
        "name_ar": "الطريفاوي",
        "daira": "Hassi Khalifa",
        "postal_code": "39044",
        "lat": 33.42298,
        "lng": 6.93452
      }
    ]
  },
  {
    "code": "40",
    "name": "Khenchela",
    "name_ar": "خنشلة",
    "lat": 35.417,
    "lng": 7.133,
    "communes": [
      {
        "name": "Ain Touila",
        "name_ar": "عين الطويلة",
        "daira": "Aïn Touila",
        "postal_code": "40005",
        "lat": 35.443611,
        "lng": 7.466667
      },
      {
        "name": "Babar",
        "name_ar": "بابار",
        "daira": "Babar",
        "postal_code": "40006",
        "lat": 35.169178,
        "lng": 7.104722
      },
      {
        "name": "Baghai",
        "name_ar": "بغاي",
        "daira": "El Hamma",
        "postal_code": "40014",
        "lat": 35.521944,
        "lng": 7.114444
      },
      {
        "name": "Bouhmama",
        "name_ar": "بوحمامة",
        "daira": "Bouhmama",
        "postal_code": "40007",
        "lat": 35.320278,
        "lng": 6.746635
      },
      {
        "name": "Chechar",
        "name_ar": "ششار",
        "daira": "Chechar",
        "postal_code": "40008",
        "lat": 35.158333,
        "lng": 7.01667
      },
      {
        "name": "Chelia",
        "name_ar": "شلية",
        "daira": "Bouhmama",
        "postal_code": "40030",
        "lat": 35.364444,
        "lng": 6.63671
      },
      {
        "name": "Djellal",
        "name_ar": "جلال",
        "daira": "Chechar",
        "postal_code": "40015",
        "lat": 34.91925,
        "lng": 6.9
      },
      {
        "name": "El Hamma",
        "name_ar": "الحامة",
        "daira": "El Hamma",
        "postal_code": "40016",
        "lat": 35.466667,
        "lng": 7.0825
      },
      {
        "name": "El Mahmal",
        "name_ar": "المحمل",
        "daira": "Ouled Rechache",
        "postal_code": "40012",
        "lat": 35.37381,
        "lng": 7.21319
      },
      {
        "name": "El Oueldja",
        "name_ar": "الولجة",
        "daira": "Chechar",
        "postal_code": "40032",
        "lat": 34.915833,
        "lng": 6.680556
      },
      {
        "name": "Ensigha",
        "name_ar": "انسيغة",
        "daira": "El Hamma",
        "postal_code": "40043",
        "lat": 35.397222,
        "lng": 7.143056
      },
      {
        "name": "Kais",
        "name_ar": "قايس",
        "daira": "Kais",
        "postal_code": "40001",
        "lat": 35.494639,
        "lng": 6.924305
      },
      {
        "name": "Khenchela",
        "name_ar": "خنشلة",
        "daira": "Khenchela",
        "postal_code": "40000",
        "lat": 35.4358,
        "lng": 7.1433
      },
      {
        "name": "Khirane",
        "name_ar": "خيران",
        "daira": "Chechar",
        "postal_code": "40037",
        "lat": 34.6667,
        "lng": 6.7593
      },
      {
        "name": "M'sara",
        "name_ar": "مصارة",
        "daira": "Bouhmama",
        "postal_code": "40039",
        "lat": 35.321667,
        "lng": 7.143333
      },
      {
        "name": "M'toussa",
        "name_ar": "متوسة",
        "daira": "Aïn Touila",
        "postal_code": "40021",
        "lat": 35.599444,
        "lng": 7.24497
      },
      {
        "name": "Ouled Rechache",
        "name_ar": "أولاد رشاش",
        "daira": "Ouled Rechache",
        "postal_code": "40013",
        "lat": 35.3,
        "lng": 7.353056
      },
      {
        "name": "Remila",
        "name_ar": "الرميلة",
        "daira": "Kais",
        "postal_code": "40041",
        "lat": 35.569444,
        "lng": 6.9
      },
      {
        "name": "Tamza",
        "name_ar": "طامزة",
        "daira": "El Hamma",
        "postal_code": "40024",
        "lat": 35.31491,
        "lng": 7
      },
      {
        "name": "Taouzianat",
        "name_ar": "تاوزيانت",
        "daira": "Kais",
        "postal_code": "40011",
        "lat": 35.511111,
        "lng": 6.355152
      },
      {
        "name": "Yabous",
        "name_ar": "يابوس",
        "daira": "Bouhmama",
        "postal_code": "40023",
        "lat": 35.405278,
        "lng": 6.6418
      }
    ]
  },
  {
    "code": "41",
    "name": "Souk Ahras",
    "name_ar": "سوق أهراس",
    "lat": 36.28639,
    "lng": 7.95111,
    "communes": [
      {
        "name": "Ain Soltane",
        "name_ar": "عين سلطان",
        "daira": "Sedrata",
        "postal_code": "41026",
        "lat": 36.178334,
        "lng": 7.369167
      },
      {
        "name": "Ain Zana",
        "name_ar": "عين الزانة",
        "daira": "Ouled Driss",
        "postal_code": "41027",
        "lat": 36.400556,
        "lng": 8.191111
      },
      {
        "name": "Bir Bouhouche",
        "name_ar": "بئر بوحوش",
        "daira": "Bir Bou Haouch",
        "postal_code": "41011",
        "lat": 36.165611,
        "lng": 7.4667
      },
      {
        "name": "Drea",
        "name_ar": "الدريعة",
        "daira": "Taoura",
        "postal_code": "41015",
        "lat": 36.1167,
        "lng": 7.883333
      },
      {
        "name": "Haddada",
        "name_ar": "الحدادة",
        "daira": "Heddada",
        "postal_code": "41012",
        "lat": 36.230833,
        "lng": 8.2725
      },
      {
        "name": "Hanencha",
        "name_ar": "الحنانشة",
        "daira": "Mechroha",
        "postal_code": "41016",
        "lat": 36.19119,
        "lng": 7.887778
      },
      {
        "name": "Khedara",
        "name_ar": "الخضارة",
        "daira": "Heddada",
        "postal_code": "41013",
        "lat": 36.195556,
        "lng": 8.243057
      },
      {
        "name": "Khemissa",
        "name_ar": "خميسة",
        "daira": "Sedrata",
        "postal_code": "41031",
        "lat": 36.193056,
        "lng": 7.658889
      },
      {
        "name": "M'daourouche",
        "name_ar": "مداوروش",
        "daira": "M'daourouch",
        "postal_code": "41001",
        "lat": 36.1218,
        "lng": 7.819722
      },
      {
        "name": "Machroha",
        "name_ar": "المشروحة",
        "daira": "Mechroha",
        "postal_code": "41010",
        "lat": 36.357222,
        "lng": 7.933333
      },
      {
        "name": "Merahna",
        "name_ar": "المراهنة",
        "daira": "Merahna",
        "postal_code": "41004",
        "lat": 36.1975,
        "lng": 8.155
      },
      {
        "name": "Oued Kebrit",
        "name_ar": "وادي الكبريت",
        "daira": "Oum El Adhaim",
        "postal_code": "",
        "lat": 35.933333,
        "lng": 7.917071
      },
      {
        "name": "Ouillen",
        "name_ar": "ويلان",
        "daira": "Merahna",
        "postal_code": "41032",
        "lat": 36.195,
        "lng": 8.064722
      },
      {
        "name": "Ouled Driss",
        "name_ar": "أولاد إدريس",
        "daira": "Ouled Driss",
        "postal_code": "41005",
        "lat": 36.35,
        "lng": 8.0167
      },
      {
        "name": "Ouled Moumen",
        "name_ar": "أولاد مومن",
        "daira": "Heddada",
        "postal_code": "41034",
        "lat": 36.383446,
        "lng": 8.315833
      },
      {
        "name": "Oum El Adhaim",
        "name_ar": "أم العظايم",
        "daira": "Oum El Adhaim",
        "postal_code": "41019",
        "lat": 36.033889,
        "lng": 7.6025
      },
      {
        "name": "Ragouba",
        "name_ar": "الراقوبة",
        "daira": "M'daourouch",
        "postal_code": "41033",
        "lat": 36.125,
        "lng": 7.666667
      },
      {
        "name": "Safel El Ouiden",
        "name_ar": "سافل الويدان",
        "daira": "Bir Bou Haouch",
        "postal_code": "41035",
        "lat": 35.929167,
        "lng": 7.490278
      },
      {
        "name": "Sedrata",
        "name_ar": "سدراتة",
        "daira": "Sedrata",
        "postal_code": "41002",
        "lat": 36.129,
        "lng": 7.534
      },
      {
        "name": "Sidi Fredj",
        "name_ar": "سيدي فرج",
        "daira": "Merahna",
        "postal_code": "41030",
        "lat": 36.153712,
        "lng": 8.195275
      },
      {
        "name": "Souk Ahras",
        "name_ar": "سوق أهراس",
        "daira": "Souk Ahras",
        "postal_code": "41000",
        "lat": 36.286389,
        "lng": 7.950833
      },
      {
        "name": "Taoura",
        "name_ar": "تاورة",
        "daira": "Taoura",
        "postal_code": "41009",
        "lat": 36.17,
        "lng": 8.04028
      },
      {
        "name": "Terraguelt",
        "name_ar": "ترقالت",
        "daira": "Oum El Adhaim",
        "postal_code": "41037",
        "lat": 35.895278,
        "lng": 7.854045
      },
      {
        "name": "Tiffech",
        "name_ar": "تيفاش",
        "daira": "M'daourouch",
        "postal_code": "41038",
        "lat": 36.191667,
        "lng": 7.786111
      },
      {
        "name": "Zaarouria",
        "name_ar": "الزعرورية",
        "daira": "Taoura",
        "postal_code": "41025",
        "lat": 36.227222,
        "lng": 7.957778
      },
      {
        "name": "Zouabi",
        "name_ar": "الزوابي",
        "daira": "Bir Bou Haouch",
        "postal_code": "41039",
        "lat": 36.195556,
        "lng": 7.441111
      }
    ]
  },
  {
    "code": "42",
    "name": "Tipaza",
    "name_ar": "تيبازة",
    "lat": 36.59194,
    "lng": 2.44944,
    "communes": [
      {
        "name": "Aghbal",
        "name_ar": "أغبال",
        "daira": "Gouraya",
        "postal_code": "42035",
        "lat": 36.502778,
        "lng": 1.845833
      },
      {
        "name": "Ahmer El Ain",
        "name_ar": "أحمر العين",
        "daira": "Ahmar El Ain",
        "postal_code": "42005",
        "lat": 36.47688,
        "lng": 2.569334
      },
      {
        "name": "Ain Tagourait",
        "name_ar": "عين تاقورايت",
        "daira": "Bou Ismail",
        "postal_code": "42023",
        "lat": 36.586886,
        "lng": 2.584206
      },
      {
        "name": "Attatba",
        "name_ar": "الحطاطبة",
        "daira": "Kolea",
        "postal_code": "42008",
        "lat": 36.57278,
        "lng": 2.67694
      },
      {
        "name": "Beni Mileuk",
        "name_ar": "بني ميلك",
        "daira": "Damous",
        "postal_code": "",
        "lat": 36.444444,
        "lng": 1.716667
      },
      {
        "name": "Bou Haroun",
        "name_ar": "بوهارون",
        "daira": "Bou Ismail",
        "postal_code": "42009",
        "lat": 36.62503,
        "lng": 2.6548
      },
      {
        "name": "Bou Ismail",
        "name_ar": "بواسماعيل",
        "daira": "Bou Ismail",
        "postal_code": "42004",
        "lat": 36.64262,
        "lng": 2.689936
      },
      {
        "name": "Bourkika",
        "name_ar": "بورقيقة",
        "daira": "Ahmar El Ain",
        "postal_code": "42011",
        "lat": 36.485859,
        "lng": 2.4764
      },
      {
        "name": "Chaiba",
        "name_ar": "الشعيبة",
        "daira": "Kolea",
        "postal_code": "42012",
        "lat": 36.6251,
        "lng": 2.729167
      },
      {
        "name": "Cherchell",
        "name_ar": "شرشال",
        "daira": "Cherchell",
        "postal_code": "42002",
        "lat": 36.605,
        "lng": 2.19083
      },
      {
        "name": "Damous",
        "name_ar": "الداموس",
        "daira": "Damous",
        "postal_code": "42014",
        "lat": 36.520024,
        "lng": 1.704167
      },
      {
        "name": "Douaouda",
        "name_ar": "دواودة",
        "daira": "Fouka",
        "postal_code": "42015",
        "lat": 36.67374,
        "lng": 2.783333
      },
      {
        "name": "Fouka",
        "name_ar": "فوكة",
        "daira": "Fouka",
        "postal_code": "42006",
        "lat": 36.6667,
        "lng": 2.742117
      },
      {
        "name": "Gouraya",
        "name_ar": "قوراية",
        "daira": "Gouraya",
        "postal_code": "42007",
        "lat": 36.5675,
        "lng": 1.905
      },
      {
        "name": "Hadjout",
        "name_ar": "حجوط",
        "daira": "Hadjout",
        "postal_code": "42001",
        "lat": 36.51257,
        "lng": 2.414289
      },
      {
        "name": "Hadjret Ennous",
        "name_ar": "حجرة النص",
        "daira": "Cherchell",
        "postal_code": "42029",
        "lat": 36.573333,
        "lng": 2.051944
      },
      {
        "name": "Khemisti",
        "name_ar": "خميستي",
        "daira": "Bou Ismail",
        "postal_code": "42016",
        "lat": 36.625833,
        "lng": 2.680833
      },
      {
        "name": "Kolea",
        "name_ar": "القليعة",
        "daira": "Kolea",
        "postal_code": "42003",
        "lat": 36.6389,
        "lng": 2.768
      },
      {
        "name": "Larhat",
        "name_ar": "الأرهاط",
        "daira": "Damous",
        "postal_code": "42017",
        "lat": 36.558,
        "lng": 1.801389
      },
      {
        "name": "Menaceur",
        "name_ar": "مناصر",
        "daira": "Sidi Amar",
        "postal_code": "42018",
        "lat": 36.492,
        "lng": 2.240556
      },
      {
        "name": "Merad",
        "name_ar": "مراد",
        "daira": "Hadjout",
        "postal_code": "42019",
        "lat": 36.47477,
        "lng": 2.42625
      },
      {
        "name": "Messelmoun",
        "name_ar": "مسلمون",
        "daira": "Gouraya",
        "postal_code": "42036",
        "lat": 36.563056,
        "lng": 2.0025
      },
      {
        "name": "Nador",
        "name_ar": "الناظور",
        "daira": "Sidi Amar",
        "postal_code": "42038",
        "lat": 36.569722,
        "lng": 2.312303
      },
      {
        "name": "Sidi Ghiles",
        "name_ar": "سيدي غيلاس",
        "daira": "Cherchell",
        "postal_code": "42021",
        "lat": 36.558301,
        "lng": 2.115569
      },
      {
        "name": "Sidi Rached",
        "name_ar": "سيدي راشد",
        "daira": "Ahmar El Ain",
        "postal_code": "42040",
        "lat": 36.5625,
        "lng": 2.533333
      },
      {
        "name": "Sidi Semiane",
        "name_ar": "سيدي سميان",
        "daira": "Cherchell",
        "postal_code": "42041",
        "lat": 36.508611,
        "lng": 2.063889
      },
      {
        "name": "Sidi-Amar",
        "name_ar": "سيدي عامر",
        "daira": "Sidi Amar",
        "postal_code": "42020",
        "lat": 36.53306,
        "lng": 2.306389
      },
      {
        "name": "Tipaza",
        "name_ar": "تيبازة",
        "daira": "Tipaza",
        "postal_code": "42000",
        "lat": 36.591944,
        "lng": 2.443
      }
    ]
  },
  {
    "code": "43",
    "name": "Mila",
    "name_ar": "ميلة",
    "lat": 36.45,
    "lng": 6.27,
    "communes": [
      {
        "name": "Ahmed Rachedi",
        "name_ar": "أحمد راشدي",
        "daira": "Oued Endja",
        "postal_code": "43013",
        "lat": 36.390556,
        "lng": 6.125
      },
      {
        "name": "Ain Beida Harriche",
        "name_ar": "عين البيضاء أحريش",
        "daira": "Aïn Beida Harriche",
        "postal_code": "43014",
        "lat": 36.395968,
        "lng": 5.893333
      },
      {
        "name": "Ain Mellouk",
        "name_ar": "عين الملوك",
        "daira": "Chelghoum Laid",
        "postal_code": "43015",
        "lat": 36.2755,
        "lng": 6.1785
      },
      {
        "name": "Ain Tine",
        "name_ar": "عين التين",
        "daira": "Mila",
        "postal_code": "43016",
        "lat": 36.438056,
        "lng": 6.467823
      },
      {
        "name": "Amira Arres",
        "name_ar": "اعميرة اراس",
        "daira": "Terrai Bainen",
        "postal_code": "43017",
        "lat": 36.5375,
        "lng": 6.065278
      },
      {
        "name": "Benyahia Abderrahmane",
        "name_ar": "بن يحي عبد الرحمن",
        "daira": "Tadjenanet",
        "postal_code": "43020",
        "lat": 36.232937,
        "lng": 6.0045
      },
      {
        "name": "Bouhatem",
        "name_ar": "بوحاتم",
        "daira": "Bouhatem",
        "postal_code": "43022",
        "lat": 36.303889,
        "lng": 6.014167
      },
      {
        "name": "Chelghoum Laid",
        "name_ar": "شلغوم العيد",
        "daira": "Chelghoum Laid",
        "postal_code": "43001",
        "lat": 36.162982,
        "lng": 6.616667
      },
      {
        "name": "Chigara",
        "name_ar": "الشيقارة",
        "daira": "Sidi Merouane",
        "postal_code": "43025",
        "lat": 36.560082,
        "lng": 6.221668
      },
      {
        "name": "Derrahi Bousselah",
        "name_ar": "دراحي بوصلاح",
        "daira": "Bouhatem",
        "postal_code": "43046",
        "lat": 36.3125,
        "lng": 5.958056
      },
      {
        "name": "El Ayadi Barbes",
        "name_ar": "العياضي برباس",
        "daira": "Aïn Beida Harriche",
        "postal_code": "43050",
        "lat": 36.440278,
        "lng": 5.913076
      },
      {
        "name": "El Mechira",
        "name_ar": "مشيرة",
        "daira": "Teleghma",
        "postal_code": "43026",
        "lat": 36.010247,
        "lng": 6.231267
      },
      {
        "name": "Ferdjioua",
        "name_ar": "فرجيوة",
        "daira": "Ferdjioua",
        "postal_code": "43002",
        "lat": 36.407381,
        "lng": 5.94196
      },
      {
        "name": "Grarem Gouga",
        "name_ar": "القرارم قوقة",
        "daira": "Grarem Gouga",
        "postal_code": "43004",
        "lat": 36.5167,
        "lng": 6.33333
      },
      {
        "name": "Hamala",
        "name_ar": "حمالة",
        "daira": "Grarem Gouga",
        "postal_code": "43052",
        "lat": 36.56667,
        "lng": 6.34
      },
      {
        "name": "Mila",
        "name_ar": "ميلة",
        "daira": "Mila",
        "postal_code": "43000",
        "lat": 36.4503,
        "lng": 6.2644
      },
      {
        "name": "Minar Zarza",
        "name_ar": "مينار زارزة",
        "daira": "Tassadane Haddada",
        "postal_code": "43036",
        "lat": 36.537748,
        "lng": 5.930404
      },
      {
        "name": "Oued Athmenia",
        "name_ar": "وادي العثمانية",
        "daira": "Chelghoum Laid",
        "postal_code": "43005",
        "lat": 36.249722,
        "lng": 6.343878
      },
      {
        "name": "Oued Endja",
        "name_ar": "وادي النجاء",
        "daira": "Oued Endja",
        "postal_code": "43006",
        "lat": 36.5,
        "lng": 6.120833
      },
      {
        "name": "Oued Seguen",
        "name_ar": "وادي سقان",
        "daira": "Teleghma",
        "postal_code": "43031",
        "lat": 36.170991,
        "lng": 6.419985
      },
      {
        "name": "Ouled Khalouf",
        "name_ar": "أولاد اخلوف",
        "daira": "Tadjenanet",
        "postal_code": "43032",
        "lat": 36.055556,
        "lng": 6.125
      },
      {
        "name": "Rouached",
        "name_ar": "الرواشد",
        "daira": "Rouached",
        "postal_code": "43009",
        "lat": 36.457741,
        "lng": 6.04267
      },
      {
        "name": "Sidi Khelifa",
        "name_ar": "سيدي خليفة",
        "daira": "Mila",
        "postal_code": "43060",
        "lat": 36.34969,
        "lng": 6.300383
      },
      {
        "name": "Sidi Merouane",
        "name_ar": "سيدي مروان",
        "daira": "Sidi Merouane",
        "postal_code": "43010",
        "lat": 36.521667,
        "lng": 6.2625
      },
      {
        "name": "Tadjenanet",
        "name_ar": "تاجنانت",
        "daira": "Tadjenanet",
        "postal_code": "43007",
        "lat": 36.12129,
        "lng": 5.9867
      },
      {
        "name": "Tassadane Haddada",
        "name_ar": "تسدان حدادة",
        "daira": "Tassadane Haddada",
        "postal_code": "43033",
        "lat": 36.52269,
        "lng": 5.878729
      },
      {
        "name": "Tassala Lematai",
        "name_ar": "تسالة لمطاعي",
        "daira": "Terrai Bainen",
        "postal_code": "",
        "lat": 36.495833,
        "lng": 6.32488
      },
      {
        "name": "Teleghma",
        "name_ar": "التلاغمة",
        "daira": "Teleghma",
        "postal_code": "43008",
        "lat": 36.11802,
        "lng": 6.364167
      },
      {
        "name": "Terrai Bainen",
        "name_ar": "ترعي باينان",
        "daira": "Terrai Bainen",
        "postal_code": "43018",
        "lat": 36.5481,
        "lng": 6.1418
      },
      {
        "name": "Tiberguent",
        "name_ar": "تيبرقنت",
        "daira": "Rouached",
        "postal_code": "43035",
        "lat": 36.466762,
        "lng": 6.0396
      },
      {
        "name": "Yahia Beniguecha",
        "name_ar": "يحي بني قشة",
        "daira": "Ferdjioua",
        "postal_code": "43019",
        "lat": 36.235278,
        "lng": 5.592778
      },
      {
        "name": "Zeghaia",
        "name_ar": "زغاية",
        "daira": "Oued Endja",
        "postal_code": "43012",
        "lat": 36.468056,
        "lng": 6.1725
      }
    ]
  },
  {
    "code": "44",
    "name": "Aïn Defla",
    "name_ar": "عين الدفلى",
    "lat": 36.2652,
    "lng": 1.9703,
    "communes": [
      {
        "name": "Ain-Benian",
        "name_ar": "عين البنيان",
        "daira": "Aïn Defla",
        "postal_code": "44035",
        "lat": 36.353611,
        "lng": 2.427814
      },
      {
        "name": "Ain-Bouyahia",
        "name_ar": "عين بويحيى",
        "daira": "Aïn Defla",
        "postal_code": "44032",
        "lat": 36.315039,
        "lng": 1.773357
      },
      {
        "name": "Ain-Defla",
        "name_ar": "عين الدفلى",
        "daira": "Aïn Defla",
        "postal_code": "44000",
        "lat": 36.2652,
        "lng": 1.9703
      },
      {
        "name": "Ain-Lechiakh",
        "name_ar": "عين الاشياخ",
        "daira": "Aïn Lechiakh",
        "postal_code": "44018",
        "lat": 36.156944,
        "lng": 2.404167
      },
      {
        "name": "Ain-Soltane",
        "name_ar": "عين السلطان",
        "daira": "Aïn Defla",
        "postal_code": "44019",
        "lat": 36.248323,
        "lng": 2.297323
      },
      {
        "name": "Ain-Torki",
        "name_ar": "عين التركي",
        "daira": "Aïn Defla",
        "postal_code": "44020",
        "lat": 36.332778,
        "lng": 2.301389
      },
      {
        "name": "Arib",
        "name_ar": "عريب",
        "daira": "Djendel",
        "postal_code": "44008",
        "lat": 36.291944,
        "lng": 2.133611
      },
      {
        "name": "Bathia",
        "name_ar": "بطحية",
        "daira": "Bathia",
        "postal_code": "44041",
        "lat": 36.033333,
        "lng": 1.783097
      },
      {
        "name": "Belaas",
        "name_ar": "بلعاص",
        "daira": "El Attaf",
        "postal_code": "44038",
        "lat": 36.10778,
        "lng": 1.8512
      },
      {
        "name": "Ben Allal",
        "name_ar": "بن علال",
        "daira": "Rouina",
        "postal_code": "44040",
        "lat": 36.311111,
        "lng": 2.164
      },
      {
        "name": "Bir-Ould-Khelifa",
        "name_ar": "بئر ولد خليفة",
        "daira": "Hammam Righa",
        "postal_code": "",
        "lat": 36.183333,
        "lng": 2.233333
      },
      {
        "name": "Birbouche",
        "name_ar": "بربوش",
        "daira": "El Attaf",
        "postal_code": "44042",
        "lat": 36.216667,
        "lng": 2.253056
      },
      {
        "name": "Bordj-Emir-Khaled",
        "name_ar": "برج الأمير خالد",
        "daira": "Bordj Emir Khaled",
        "postal_code": "44021",
        "lat": 36.1222,
        "lng": 2.2056
      },
      {
        "name": "Boumedfaa",
        "name_ar": "بومدفع",
        "daira": "Boumedfaa",
        "postal_code": "44004",
        "lat": 36.370278,
        "lng": 2.47639
      },
      {
        "name": "Bourached",
        "name_ar": "بوراشد",
        "daira": "Djendel",
        "postal_code": "44044",
        "lat": 36.1765,
        "lng": 1.9341
      },
      {
        "name": "Djelida",
        "name_ar": "جليدة",
        "daira": "Djelida",
        "postal_code": "44009",
        "lat": 36.2,
        "lng": 2.083333
      },
      {
        "name": "Djemaa Ouled Cheikh",
        "name_ar": "جمعة أولاد الشيخ",
        "daira": "El Amra",
        "postal_code": "44047",
        "lat": 36.0786,
        "lng": 2.005
      },
      {
        "name": "Djendel",
        "name_ar": "جندل",
        "daira": "Djendel",
        "postal_code": "44005",
        "lat": 36.218611,
        "lng": 2.4137
      },
      {
        "name": "El-Abadia",
        "name_ar": "العبادية",
        "daira": "El Abadia",
        "postal_code": "44006",
        "lat": 36.270603,
        "lng": 1.685443
      },
      {
        "name": "El-Amra",
        "name_ar": "العامرة",
        "daira": "El Amra",
        "postal_code": "44010",
        "lat": 36.30693,
        "lng": 1.84816
      },
      {
        "name": "El-Attaf",
        "name_ar": "العطاف",
        "daira": "El Attaf",
        "postal_code": "44002",
        "lat": 36.22393,
        "lng": 1.672
      },
      {
        "name": "El-Maine",
        "name_ar": "الماين",
        "daira": "Miliana",
        "postal_code": "44051",
        "lat": 36.145,
        "lng": 1.758333
      },
      {
        "name": "Hammam-Righa",
        "name_ar": "حمام ريغة",
        "daira": "Hammam Righa",
        "postal_code": "44023",
        "lat": 36.391534,
        "lng": 2.395618
      },
      {
        "name": "Hassania",
        "name_ar": "الحسانية",
        "daira": "Khemis Miliana",
        "postal_code": "44022",
        "lat": 36.033333,
        "lng": 1.933611
      },
      {
        "name": "Hoceinia",
        "name_ar": "الحسينية",
        "daira": "Miliana",
        "postal_code": "44048",
        "lat": 36.316667,
        "lng": 2.4
      },
      {
        "name": "Khemis-Miliana",
        "name_ar": "خميس مليانة",
        "daira": "Khemis Miliana",
        "postal_code": "44001",
        "lat": 36.261,
        "lng": 2.220167
      },
      {
        "name": "Mekhatria",
        "name_ar": "المخاطرية",
        "daira": "Rouina",
        "postal_code": "44050",
        "lat": 36.344656,
        "lng": 2.146111
      },
      {
        "name": "Miliana",
        "name_ar": "مليانة",
        "daira": "Miliana",
        "postal_code": "44003",
        "lat": 36.3055,
        "lng": 2.232591
      },
      {
        "name": "Oued Chorfa",
        "name_ar": "وادي الشرفاء",
        "daira": "Hammam Righa",
        "postal_code": "44024",
        "lat": 36.2,
        "lng": 2.516667
      },
      {
        "name": "Oued Djemaa",
        "name_ar": "واد الجمعة",
        "daira": "Boumedfaa",
        "postal_code": "44052",
        "lat": 36.066667,
        "lng": 2.3
      },
      {
        "name": "Rouina",
        "name_ar": "الروينة",
        "daira": "Rouina",
        "postal_code": "44017",
        "lat": 36.25,
        "lng": 1.816667
      },
      {
        "name": "Sidi-Lakhdar",
        "name_ar": "سيدي الأخضر",
        "daira": "Khemis Miliana",
        "postal_code": "44027",
        "lat": 36.265278,
        "lng": 2.161667
      },
      {
        "name": "Tacheta Zegagha",
        "name_ar": "تاشتة زقاغة",
        "daira": "El Amra",
        "postal_code": "44028",
        "lat": 36.355833,
        "lng": 1.888889
      },
      {
        "name": "Tarik-Ibn-Ziad",
        "name_ar": "طارق بن زياد",
        "daira": "Aïn Lechiakh",
        "postal_code": "44029",
        "lat": 36.147222,
        "lng": 2.15
      },
      {
        "name": "Tiberkanine",
        "name_ar": "تبركانين",
        "daira": "Aïn Lechiakh",
        "postal_code": "44030",
        "lat": 36.216667,
        "lng": 1.627222
      },
      {
        "name": "Zeddine",
        "name_ar": "زدين",
        "daira": "Rouina",
        "postal_code": "44031",
        "lat": 36.163889,
        "lng": 1.85
      }
    ]
  },
  {
    "code": "45",
    "name": "Naâma",
    "name_ar": "النعامة",
    "lat": 33.26222,
    "lng": -0.31444,
    "communes": [
      {
        "name": "Ain Ben Khelil",
        "name_ar": "عين بن خليل",
        "daira": "Mecheria",
        "postal_code": "45008",
        "lat": 33.290278,
        "lng": -0.763889
      },
      {
        "name": "Ain Sefra",
        "name_ar": "عين الصفراء",
        "daira": "Aïn Sefra",
        "postal_code": "45001",
        "lat": 32.75,
        "lng": -0.5833
      },
      {
        "name": "Asla",
        "name_ar": "عسلة",
        "daira": "Assela",
        "postal_code": "45012",
        "lat": 33.016667,
        "lng": -0.083333
      },
      {
        "name": "Djenienne Bourezg",
        "name_ar": "جنين بورزق",
        "daira": "Moghrar",
        "postal_code": "",
        "lat": 32.370932,
        "lng": -0.80472
      },
      {
        "name": "El Biodh",
        "name_ar": "البيوض",
        "daira": "Mecheria",
        "postal_code": "45004",
        "lat": 33.763613,
        "lng": -0.133333
      },
      {
        "name": "Kasdir",
        "name_ar": "القصدير",
        "daira": "Makman Ben Amer",
        "postal_code": "45007",
        "lat": 33.709722,
        "lng": -1.358333
      },
      {
        "name": "Makmen Ben Amar",
        "name_ar": "مكمن بن عمار",
        "daira": "Makman Ben Amer",
        "postal_code": "45005",
        "lat": 33.718906,
        "lng": -0.727148
      },
      {
        "name": "Mecheria",
        "name_ar": "المشرية",
        "daira": "Mecheria",
        "postal_code": "45002",
        "lat": 33.54453,
        "lng": -0.2812
      },
      {
        "name": "Moghrar",
        "name_ar": "مغرار",
        "daira": "Moghrar",
        "postal_code": "45019",
        "lat": 32.51229,
        "lng": -0.58816
      },
      {
        "name": "Naama",
        "name_ar": "النعامة",
        "daira": "Naama",
        "postal_code": "45000",
        "lat": 33.2667,
        "lng": -0.3167
      },
      {
        "name": "Sfissifa",
        "name_ar": "سفيسيفة",
        "daira": "Sfissifa",
        "postal_code": "45021",
        "lat": 32.733333,
        "lng": -0.868889
      },
      {
        "name": "Tiout",
        "name_ar": "تيوت",
        "daira": "Aïn Sefra",
        "postal_code": "45030",
        "lat": 32.7667,
        "lng": -0.416667
      }
    ]
  },
  {
    "code": "46",
    "name": "Aïn Témouchent",
    "name_ar": "عين تموشنت",
    "lat": 35.3,
    "lng": -1.133,
    "communes": [
      {
        "name": "Aghlal",
        "name_ar": "أغلال",
        "daira": "Aïn Kihal",
        "postal_code": "46016",
        "lat": 35.2,
        "lng": -1.069167
      },
      {
        "name": "Ain El Arbaa",
        "name_ar": "عين الأربعاء",
        "daira": "Aïn El Arbaa",
        "postal_code": "46009",
        "lat": 35.4075,
        "lng": -0.881667
      },
      {
        "name": "Ain Kihal",
        "name_ar": "عين الكيحل",
        "daira": "Aïn Kihal",
        "postal_code": "46008",
        "lat": 35.204444,
        "lng": -1.196111
      },
      {
        "name": "Ain Temouchent",
        "name_ar": "عين تموشنت",
        "daira": "Aïn Témouchent",
        "postal_code": "46000",
        "lat": 35.297,
        "lng": -1.133333
      },
      {
        "name": "Ain Tolba",
        "name_ar": "عين الطلبة",
        "daira": "Aïn Kihal",
        "postal_code": "46010",
        "lat": 35.24893,
        "lng": -1.25049
      },
      {
        "name": "Aoubellil",
        "name_ar": "عقب الليل",
        "daira": "Aïn Kihal",
        "postal_code": "46017",
        "lat": 35.1373,
        "lng": -0.992575
      },
      {
        "name": "Beni Saf",
        "name_ar": "بني صاف",
        "daira": "Beni Saf",
        "postal_code": "46001",
        "lat": 35.300474,
        "lng": -1.382036
      },
      {
        "name": "Bouzedjar",
        "name_ar": "بوزجار",
        "daira": "El Amria",
        "postal_code": "46033",
        "lat": 35.57456,
        "lng": -1.10424
      },
      {
        "name": "Chaabat El Ham",
        "name_ar": "شعبة اللحم",
        "daira": "El Malah",
        "postal_code": "",
        "lat": 35.33619,
        "lng": -1.1015
      },
      {
        "name": "Chentouf",
        "name_ar": "شنتوف",
        "daira": "Hammam Bou Hadjar",
        "postal_code": "46020",
        "lat": 35.291771,
        "lng": -1.029444
      },
      {
        "name": "El Amria",
        "name_ar": "العامرية",
        "daira": "El Amria",
        "postal_code": "46006",
        "lat": 35.524726,
        "lng": -1.016
      },
      {
        "name": "El Maleh",
        "name_ar": "المالح",
        "daira": "El Malah",
        "postal_code": "",
        "lat": 35.388333,
        "lng": -1.094444
      },
      {
        "name": "El Messaid",
        "name_ar": "المساعيد",
        "daira": "El Amria",
        "postal_code": "46036",
        "lat": 35.541944,
        "lng": -1.122054
      },
      {
        "name": "Emir Abdelkader",
        "name_ar": "الأمير عبد القادر",
        "daira": "Beni Saf",
        "postal_code": "",
        "lat": 35.224,
        "lng": -1.403
      },
      {
        "name": "Hammam Bou Hadjar",
        "name_ar": "حمام بوحجر",
        "daira": "Hammam Bou Hadjar",
        "postal_code": "46005",
        "lat": 35.37889,
        "lng": -0.970488
      },
      {
        "name": "Hassasna",
        "name_ar": "الحساسنة",
        "daira": "Hammam Bou Hadjar",
        "postal_code": "46021",
        "lat": 35.272222,
        "lng": -0.987222
      },
      {
        "name": "Hassi El Ghella",
        "name_ar": "حاسي الغلة",
        "daira": "El Amria",
        "postal_code": "46012",
        "lat": 35.45,
        "lng": -1.05
      },
      {
        "name": "Oued Berkeche",
        "name_ar": "وادي برقش",
        "daira": "Hammam Bou Hadjar",
        "postal_code": "46022",
        "lat": 35.222222,
        "lng": -0.983611
      },
      {
        "name": "Oued Sebbah",
        "name_ar": "وادي الصباح",
        "daira": "Aïn El Arbaa",
        "postal_code": "46023",
        "lat": 35.3725,
        "lng": -0.811389
      },
      {
        "name": "Ouled Boudjemaa",
        "name_ar": "أولاد بوجمعة",
        "daira": "El Amria",
        "postal_code": "46043",
        "lat": 35.47306,
        "lng": -1.192667
      },
      {
        "name": "Ouled Kihal",
        "name_ar": "أولاد الكيحل",
        "daira": "El Malah",
        "postal_code": "46045",
        "lat": 35.37,
        "lng": -1.2356
      },
      {
        "name": "Oulhaca El Gheraba",
        "name_ar": "ولهاصة الغرابة",
        "daira": "Oulhaca El Gheraba",
        "postal_code": "46014",
        "lat": 35.233056,
        "lng": -1.504444
      },
      {
        "name": "Sidi Ben Adda",
        "name_ar": "سيدي بن عدة",
        "daira": "Aïn Témouchent",
        "postal_code": "46013",
        "lat": 35.3,
        "lng": -1.183333
      },
      {
        "name": "Sidi Boumediene",
        "name_ar": "سيدي بومدين",
        "daira": "Aïn El Arbaa",
        "postal_code": "46051",
        "lat": 35.354167,
        "lng": -0.893056
      },
      {
        "name": "Sidi Ouriache",
        "name_ar": "سيدي ورياش",
        "daira": "Oulhaca El Gheraba",
        "postal_code": "",
        "lat": 35.186255,
        "lng": -1.50876
      },
      {
        "name": "Sidi Safi",
        "name_ar": "سيدي صافي",
        "daira": "Beni Saf",
        "postal_code": "46025",
        "lat": 35.28123,
        "lng": -1.313333
      },
      {
        "name": "Tamzoura",
        "name_ar": "تامزورة",
        "daira": "Aïn El Arbaa",
        "postal_code": "46026",
        "lat": 35.40889,
        "lng": -0.65936
      },
      {
        "name": "Terga",
        "name_ar": "تارقة",
        "daira": "El Malah",
        "postal_code": "46015",
        "lat": 35.416667,
        "lng": -1.1792
      }
    ]
  },
  {
    "code": "47",
    "name": "Ghardaïa",
    "name_ar": "غرداية",
    "lat": 32.483,
    "lng": 3.667,
    "communes": [
      {
        "name": "Berriane",
        "name_ar": "بريان",
        "daira": "Berriane",
        "postal_code": "47003",
        "lat": 32.82648,
        "lng": 3.766667
      },
      {
        "name": "Bounoura",
        "name_ar": "بونورة",
        "daira": "Bounoura",
        "postal_code": "47010",
        "lat": 32.4825,
        "lng": 3.70771
      },
      {
        "name": "Dhayet Bendhahoua",
        "name_ar": "ضاية بن ضحوة",
        "daira": "Daia Ben Dahoua",
        "postal_code": "",
        "lat": 32.536944,
        "lng": 3.605556
      },
      {
        "name": "El Atteuf",
        "name_ar": "العطف",
        "daira": "Bounoura",
        "postal_code": "47012",
        "lat": 32.47665,
        "lng": 3.74788
      },
      {
        "name": "El Guerrara",
        "name_ar": "القرارة",
        "daira": "El Guerrara",
        "postal_code": "47004",
        "lat": 32.790278,
        "lng": 4.488287
      },
      {
        "name": "Ghardaia",
        "name_ar": "غرداية",
        "daira": "Ghardaia",
        "postal_code": "47000",
        "lat": 32.4833,
        "lng": 3.6667
      },
      {
        "name": "Mansoura",
        "name_ar": "المنصورة",
        "daira": "Mansoura",
        "postal_code": "47023",
        "lat": 31.979444,
        "lng": 3.745973
      },
      {
        "name": "Metlili",
        "name_ar": "متليلي",
        "daira": "Metlili",
        "postal_code": "47002",
        "lat": 32.26667,
        "lng": 3.63333
      },
      {
        "name": "Sebseb",
        "name_ar": "سبسب",
        "daira": "Metlili",
        "postal_code": "47025",
        "lat": 32.158333,
        "lng": 3.5889
      },
      {
        "name": "Zelfana",
        "name_ar": "زلفانة",
        "daira": "Zelfana",
        "postal_code": "47007",
        "lat": 32.4,
        "lng": 4.2167
      }
    ]
  },
  {
    "code": "48",
    "name": "Relizane",
    "name_ar": "غليزان",
    "lat": 35.73333,
    "lng": 0.55,
    "communes": [
      {
        "name": "Ain Rahma",
        "name_ar": "عين الرحمة",
        "daira": "Yellel",
        "postal_code": "48033",
        "lat": 35.624722,
        "lng": 0.392778
      },
      {
        "name": "Ain-Tarek",
        "name_ar": "عين طارق",
        "daira": "Aïn Tarek",
        "postal_code": "48015",
        "lat": 35.781388,
        "lng": 1.130223
      },
      {
        "name": "Ammi Moussa",
        "name_ar": "عمي موسى",
        "daira": "Ammi Moussa",
        "postal_code": "48004",
        "lat": 35.868,
        "lng": 1.108127
      },
      {
        "name": "Belaassel Bouzagza",
        "name_ar": "بلعسل بوزقزة",
        "daira": "El Matmar",
        "postal_code": "48036",
        "lat": 35.8247,
        "lng": 0.577778
      },
      {
        "name": "Bendaoud",
        "name_ar": "بن داود",
        "daira": "Relizane",
        "postal_code": "48037",
        "lat": 35.719167,
        "lng": 0.520278
      },
      {
        "name": "Beni Dergoun",
        "name_ar": "بني درقن",
        "daira": "Zemmora",
        "postal_code": "48039",
        "lat": 35.793342,
        "lng": 0.801239
      },
      {
        "name": "Beni Zentis",
        "name_ar": "بني زنطيس",
        "daira": "Sidi M'Hamed Ben Ali",
        "postal_code": "48041",
        "lat": 36.111389,
        "lng": 0.663611
      },
      {
        "name": "Dar Ben Abdelah",
        "name_ar": "دار بن عبد الله",
        "daira": "Zemmora",
        "postal_code": "48044",
        "lat": 35.701,
        "lng": 0.68719
      },
      {
        "name": "Djidiouia",
        "name_ar": "جديوية",
        "daira": "Djidioua",
        "postal_code": "48005",
        "lat": 35.93,
        "lng": 0.816667
      },
      {
        "name": "El H'madna",
        "name_ar": "الحمادنة",
        "daira": "El Hamadna",
        "postal_code": "48017",
        "lat": 35.9,
        "lng": 0.774675
      },
      {
        "name": "El Hassi",
        "name_ar": "الحاسي",
        "daira": "Ammi Moussa",
        "postal_code": "48046",
        "lat": 35.7425,
        "lng": 1.11143
      },
      {
        "name": "El Ouldja",
        "name_ar": "الولجة",
        "daira": "Ammi Moussa",
        "postal_code": "48048",
        "lat": 35.9108,
        "lng": 0.816667
      },
      {
        "name": "El-Guettar",
        "name_ar": "القطار",
        "daira": "Mazouna",
        "postal_code": "48016",
        "lat": 36.19112,
        "lng": 0.816009
      },
      {
        "name": "El-Matmar",
        "name_ar": "المطمر",
        "daira": "El Matmar",
        "postal_code": "48009",
        "lat": 35.732361,
        "lng": 0.461147
      },
      {
        "name": "Had Echkalla",
        "name_ar": "حد الشكالة",
        "daira": "Aïn Tarek",
        "postal_code": "",
        "lat": 35.679167,
        "lng": 1.147222
      },
      {
        "name": "Hamri",
        "name_ar": "حمري",
        "daira": "Djidioua",
        "postal_code": "48051",
        "lat": 35.7425,
        "lng": 0.830556
      },
      {
        "name": "Kalaa",
        "name_ar": "القلعة",
        "daira": "Yellel",
        "postal_code": "48018",
        "lat": 35.580556,
        "lng": 0.353611
      },
      {
        "name": "Lahlef",
        "name_ar": "لحلاف",
        "daira": "Oued Rhiou",
        "postal_code": "48020",
        "lat": 35.892806,
        "lng": 0.983333
      },
      {
        "name": "Mazouna",
        "name_ar": "مازونة",
        "daira": "Mazouna",
        "postal_code": "48002",
        "lat": 36.126274,
        "lng": 0.880193
      },
      {
        "name": "Mediouna",
        "name_ar": "مديونة",
        "daira": "Sidi M'Hamed Ben Ali",
        "postal_code": "48011",
        "lat": 36.124454,
        "lng": 0.747251
      },
      {
        "name": "Mendes",
        "name_ar": "منداس",
        "daira": "Mendes",
        "postal_code": "48012",
        "lat": 35.6625,
        "lng": 0.861944
      },
      {
        "name": "Merdja Sidi Abed",
        "name_ar": "مرجة سيدي عابد",
        "daira": "Oued Rhiou",
        "postal_code": "48056",
        "lat": 36.00333,
        "lng": 1.010278
      },
      {
        "name": "Ouarizane",
        "name_ar": "واريزان",
        "daira": "Oued Rhiou",
        "postal_code": "48013",
        "lat": 36.05,
        "lng": 0.899078
      },
      {
        "name": "Oued El Djemaa",
        "name_ar": "وادي الجمعة",
        "daira": "El Hamadna",
        "postal_code": "48021",
        "lat": 35.797222,
        "lng": 0.616769
      },
      {
        "name": "Oued Essalem",
        "name_ar": "وادي السلام",
        "daira": "Mendes",
        "postal_code": "48022",
        "lat": 35.583333,
        "lng": 0.924611
      },
      {
        "name": "Oued-Rhiou",
        "name_ar": "وادي رهيو",
        "daira": "Oued Rhiou",
        "postal_code": "48001",
        "lat": 35.961111,
        "lng": 0.9167
      },
      {
        "name": "Ouled Aiche",
        "name_ar": "أولاد يعيش",
        "daira": "Ammi Moussa",
        "postal_code": "48019",
        "lat": 35.8266,
        "lng": 0.961111
      },
      {
        "name": "Ouled Sidi Mihoub",
        "name_ar": "أولاد سيدي الميهوب",
        "daira": "Djidioua",
        "postal_code": "48061",
        "lat": 35.973889,
        "lng": 0.691667
      },
      {
        "name": "Ramka",
        "name_ar": "الرمكة",
        "daira": "Ramka",
        "postal_code": "48024",
        "lat": 35.866667,
        "lng": 1.283333
      },
      {
        "name": "Relizane",
        "name_ar": "غليزان",
        "daira": "Relizane",
        "postal_code": "48000",
        "lat": 35.7333,
        "lng": 0.558879
      },
      {
        "name": "Sidi Khettab",
        "name_ar": "سيدي خطاب",
        "daira": "El Matmar",
        "postal_code": "48029",
        "lat": 35.9111,
        "lng": 0.51
      },
      {
        "name": "Sidi Lazreg",
        "name_ar": "سيدي لزرق",
        "daira": "Mendes",
        "postal_code": "48065",
        "lat": 35.6462,
        "lng": 0.775
      },
      {
        "name": "Sidi M'hamed Benali",
        "name_ar": "سيدي أمحمد بن علي",
        "daira": "Sidi M'Hamed Ben Ali",
        "postal_code": "48003",
        "lat": 36.144722,
        "lng": 0.843056
      },
      {
        "name": "Sidi M'hamed Benaouda",
        "name_ar": "سيدي امحمد بن عودة",
        "daira": "El Matmar",
        "postal_code": "48030",
        "lat": 35.60409,
        "lng": 0.58874
      },
      {
        "name": "Sidi Saada",
        "name_ar": "سيدي سعادة",
        "daira": "Yellel",
        "postal_code": "48067",
        "lat": 35.677778,
        "lng": 0.342222
      },
      {
        "name": "Souk El Had",
        "name_ar": "سوق الحد",
        "daira": "Ramka",
        "postal_code": "48068",
        "lat": 35.916667,
        "lng": 1.248056
      },
      {
        "name": "Yellel",
        "name_ar": "يلل",
        "daira": "Yellel",
        "postal_code": "48006",
        "lat": 35.716667,
        "lng": 0.353611
      },
      {
        "name": "Zemmoura",
        "name_ar": "زمورة",
        "daira": "Zemmora",
        "postal_code": "48008",
        "lat": 35.7225,
        "lng": 0.75
      }
    ]
  },
  {
    "code": "49",
    "name": "El M'Ghair",
    "name_ar": "المغير",
    "lat": 33.95056,
    "lng": 5.92417,
    "communes": [
      {
        "name": "Djamaa",
        "name_ar": "جامعة",
        "daira": "Djamaa",
        "postal_code": "57004",
        "lat": 33.53388,
        "lng": 6.0667
      },
      {
        "name": "El-M'ghaier",
        "name_ar": "المغير",
        "daira": "El M'Ghair",
        "postal_code": "57005",
        "lat": 33.953,
        "lng": 5.9242
      },
      {
        "name": "M'rara",
        "name_ar": "المرارة",
        "daira": "Djamaa",
        "postal_code": "57067",
        "lat": 33.476667,
        "lng": 6.2725
      },
      {
        "name": "Oum Touyour",
        "name_ar": "أم الطيور",
        "daira": "El M'Ghair",
        "postal_code": "57034",
        "lat": 34.153333,
        "lng": 5.833333
      },
      {
        "name": "Sidi Amrane",
        "name_ar": "سيدي عمران",
        "daira": "Djamaa",
        "postal_code": "57018",
        "lat": 33.49885,
        "lng": 6.011753
      },
      {
        "name": "Sidi Khelil",
        "name_ar": "سيدي خليل",
        "daira": "El M'Ghair",
        "postal_code": "57038",
        "lat": 33.8369,
        "lng": 5.958889
      },
      {
        "name": "Still",
        "name_ar": "سطيل",
        "daira": "El M'Ghair",
        "postal_code": "57039",
        "lat": 34.191111,
        "lng": 5.9293
      },
      {
        "name": "Tenedla",
        "name_ar": "تندلة",
        "daira": "Djamaa",
        "postal_code": "57042",
        "lat": 33.675278,
        "lng": 6.033889
      }
    ]
  },
  {
    "code": "50",
    "name": "El Meniaa",
    "name_ar": "المنيعة",
    "lat": 30.583,
    "lng": 2.883,
    "communes": [
      {
        "name": "El Meniaa",
        "name_ar": "المنيعة",
        "daira": "El Meniaa",
        "postal_code": "",
        "lat": 30.57556,
        "lng": 2.885833
      },
      {
        "name": "Hassi Fehal",
        "name_ar": "حاسي الفحل",
        "daira": "El Meniaa",
        "postal_code": "58021",
        "lat": 31.605278,
        "lng": 3.676268
      },
      {
        "name": "Hassi Gara",
        "name_ar": "حاسي القارة",
        "daira": "El Meniaa",
        "postal_code": "",
        "lat": 30.552222,
        "lng": 2.915
      }
    ]
  },
  {
    "code": "51",
    "name": "Ouled Djellal",
    "name_ar": "أولاد جلال",
    "lat": 34.417,
    "lng": 5.067,
    "communes": [
      {
        "name": "Besbes",
        "name_ar": "بسباس",
        "daira": "Sidi Khaled",
        "postal_code": "51044",
        "lat": 34.15,
        "lng": 4.983333
      },
      {
        "name": "Chaiba",
        "name_ar": "الشعيبة",
        "daira": "Ouled Djellal",
        "postal_code": "",
        "lat": 34.8408,
        "lng": 4.92218
      },
      {
        "name": "Doucen",
        "name_ar": "الدوسن",
        "daira": "Ouled Djellal",
        "postal_code": "51007",
        "lat": 34.595739,
        "lng": 5.102266
      },
      {
        "name": "Ouled Djellal",
        "name_ar": "أولاد جلال",
        "daira": "Ouled Djellal",
        "postal_code": "51002",
        "lat": 34.42541,
        "lng": 5.064434
      },
      {
        "name": "Ras El Miad",
        "name_ar": "رأس الميعاد",
        "daira": "Sidi Khaled",
        "postal_code": "51062",
        "lat": 34.185603,
        "lng": 4.4514
      },
      {
        "name": "Sidi Khaled",
        "name_ar": "سيدي خالد",
        "daira": "Sidi Khaled",
        "postal_code": "51004",
        "lat": 34.387,
        "lng": 4.983333
      }
    ]
  },
  {
    "code": "52",
    "name": "Bordj Baji Mokhtar",
    "name_ar": "بني عباس",
    "lat": 30.08,
    "lng": -2.1,
    "communes": [
      {
        "name": "Bordj Badji Mokhtar",
        "name_ar": "برج باجي مختار",
        "daira": "Bordj Badji Mokhtar",
        "postal_code": "50010",
        "lat": 21.329244,
        "lng": 0.954167
      },
      {
        "name": "Timiaouine",
        "name_ar": "تيمياوين",
        "daira": "Bordj Badji Mokhtar",
        "postal_code": "50042",
        "lat": 20.437222,
        "lng": 1.79861
      }
    ]
  },
  {
    "code": "53",
    "name": "Béni Abbès",
    "name_ar": "بني عباس",
    "lat": 30.08,
    "lng": -2.1,
    "communes": [
      {
        "name": "Beni-Abbes",
        "name_ar": "بني عباس",
        "daira": "Beni Abbes",
        "postal_code": "52002",
        "lat": 30.08,
        "lng": -2.17
      },
      {
        "name": "Beni-Ikhlef",
        "name_ar": "بن يخلف",
        "daira": "El Ouata",
        "postal_code": "52025",
        "lat": 29.575,
        "lng": -1.609167
      },
      {
        "name": "El Ouata",
        "name_ar": "الواتة",
        "daira": "El Ouata",
        "postal_code": "52020",
        "lat": 29.86224,
        "lng": -1.82751
      },
      {
        "name": "Igli",
        "name_ar": "إقلي",
        "daira": "Igli",
        "postal_code": "52021",
        "lat": 30.266667,
        "lng": -2.27784
      },
      {
        "name": "Kerzaz",
        "name_ar": "كرزاز",
        "daira": "Kerzaz",
        "postal_code": "52022",
        "lat": 29.45,
        "lng": -1.416667
      },
      {
        "name": "Ksabi",
        "name_ar": "القصابي",
        "daira": "Ouled Khoudir",
        "postal_code": "52039",
        "lat": 28.85,
        "lng": 1.2267
      },
      {
        "name": "Ouled-Khodeir",
        "name_ar": "أولاد خضير",
        "daira": "Ouled Khoudir",
        "postal_code": "52028",
        "lat": 29.248889,
        "lng": -1.05748
      },
      {
        "name": "Tabelbala",
        "name_ar": "تبلبالة",
        "daira": "Tabelbala",
        "postal_code": "",
        "lat": 29.41005,
        "lng": -3.25261
      },
      {
        "name": "Tamtert",
        "name_ar": "تامترت",
        "daira": "Beni Abbes",
        "postal_code": "52046",
        "lat": 29.910278,
        "lng": -1.890278
      },
      {
        "name": "Timoudi",
        "name_ar": "تيمودي",
        "daira": "Kerzaz",
        "postal_code": "52031",
        "lat": 29.406111,
        "lng": -1.428333
      }
    ]
  },
  {
    "code": "54",
    "name": "Timimoun",
    "name_ar": "تيميمون",
    "lat": 29.25,
    "lng": 0.228592,
    "communes": [
      {
        "name": "Aougrout",
        "name_ar": "أوقروت",
        "daira": "Aougrout",
        "postal_code": "49012",
        "lat": 28.75,
        "lng": 0.335278
      },
      {
        "name": "Charouine",
        "name_ar": "شروين",
        "daira": "Charouine",
        "postal_code": "49014",
        "lat": 29.018611,
        "lng": -0.257778
      },
      {
        "name": "Deldoul",
        "name_ar": "دلدول",
        "daira": "Aougrout",
        "postal_code": "49036",
        "lat": 28.702778,
        "lng": 0.15
      },
      {
        "name": "Ksar Kaddour",
        "name_ar": "قصر قدور",
        "daira": "Tinerkouk",
        "postal_code": "49035",
        "lat": 29.578491,
        "lng": 0.373973
      },
      {
        "name": "Metarfa",
        "name_ar": "المطارفة",
        "daira": "Aougrout",
        "postal_code": "49038",
        "lat": 28.589167,
        "lng": -0.149722
      },
      {
        "name": "Ouled Aissa",
        "name_ar": "أولاد عيسى",
        "daira": "Charouine",
        "postal_code": "49051",
        "lat": 29.418333,
        "lng": -0.089167
      },
      {
        "name": "Ouled Said",
        "name_ar": "أولاد السعيد",
        "daira": "Timimoun",
        "postal_code": "49039",
        "lat": 29.231944,
        "lng": 0.238756
      },
      {
        "name": "Talmine",
        "name_ar": "طالمين",
        "daira": "Charouine",
        "postal_code": "49034",
        "lat": 29.0167,
        "lng": -0.4975
      },
      {
        "name": "Timimoun",
        "name_ar": "تيميمون",
        "daira": "Timimoun",
        "postal_code": "49001",
        "lat": 29.25,
        "lng": 0.228592
      },
      {
        "name": "Tinerkouk",
        "name_ar": "تنركوك",
        "daira": "Tinerkouk",
        "postal_code": "49061",
        "lat": 29,
        "lng": 0.1567
      }
    ]
  },
  {
    "code": "55",
    "name": "Touggourt",
    "name_ar": "توقرت",
    "lat": 33.1,
    "lng": 6.067,
    "communes": [
      {
        "name": "Benaceur",
        "name_ar": "بن ناصر",
        "daira": "Taibet",
        "postal_code": "55020",
        "lat": 32.844111,
        "lng": 6.441111
      },
      {
        "name": "Blidet Amor",
        "name_ar": "بلدة اعمر",
        "daira": "Tamacine",
        "postal_code": "",
        "lat": 32.951389,
        "lng": 5.980556
      },
      {
        "name": "El Alia",
        "name_ar": "العالية",
        "daira": "Ouargla",
        "postal_code": "55023",
        "lat": 32.699965,
        "lng": 5.425556
      },
      {
        "name": "El-Hadjira",
        "name_ar": "الحجيرة",
        "daira": "El Hadjira",
        "postal_code": "55006",
        "lat": 32.613046,
        "lng": 5.51259
      },
      {
        "name": "M'naguer",
        "name_ar": "المنقر",
        "daira": "Taibet",
        "postal_code": "55029",
        "lat": 33.126389,
        "lng": 6.351944
      },
      {
        "name": "Megarine",
        "name_ar": "المقارين",
        "daira": "Megarine",
        "postal_code": "55009",
        "lat": 33.183333,
        "lng": 6.083333
      },
      {
        "name": "Nezla",
        "name_ar": "النزلة",
        "daira": "Touggourt",
        "postal_code": "55004",
        "lat": 33.10527,
        "lng": 6.050833
      },
      {
        "name": "Sidi Slimane",
        "name_ar": "سيدي سليمان",
        "daira": "Megarine",
        "postal_code": "55037",
        "lat": 33.28886,
        "lng": 6.09254
      },
      {
        "name": "Taibet",
        "name_ar": "الطيبات",
        "daira": "Taibet",
        "postal_code": "55015",
        "lat": 33.082949,
        "lng": 6.39975
      },
      {
        "name": "Tebesbest",
        "name_ar": "تبسبست",
        "daira": "Touggourt",
        "postal_code": "55016",
        "lat": 33.12,
        "lng": 6.08333
      },
      {
        "name": "Temacine",
        "name_ar": "تماسين",
        "daira": "Tamacine",
        "postal_code": "55003",
        "lat": 33.021944,
        "lng": 6.022778
      },
      {
        "name": "Touggourt",
        "name_ar": "تقرت",
        "daira": "Touggourt",
        "postal_code": "55002",
        "lat": 33.1,
        "lng": 6.05796
      },
      {
        "name": "Zaouia El Abidia",
        "name_ar": "الزاوية العابدية",
        "daira": "Touggourt",
        "postal_code": "55018",
        "lat": 33.1375,
        "lng": 6.082222
      }
    ]
  },
  {
    "code": "56",
    "name": "Djanet",
    "name_ar": "جانت",
    "lat": 24.555,
    "lng": 9.48528,
    "communes": [
      {
        "name": "Bordj El Haouass",
        "name_ar": "برج الحواس",
        "daira": "Djanet",
        "postal_code": "",
        "lat": 24.882778,
        "lng": 8.434444
      },
      {
        "name": "Djanet",
        "name_ar": "جانت",
        "daira": "Djanet",
        "postal_code": "56002",
        "lat": 24.552707,
        "lng": 9.484194
      }
    ]
  },
  {
    "code": "57",
    "name": "In Salah",
    "name_ar": "عين صالح",
    "lat": 27.195,
    "lng": 2.48333,
    "communes": [
      {
        "name": "Ain Salah",
        "name_ar": "عين صالح",
        "daira": "In Salah",
        "postal_code": "53001",
        "lat": 27.1935,
        "lng": 2.483333
      },
      {
        "name": "Foggaret Ezzoua",
        "name_ar": "فقارة الزوى",
        "daira": "In Salah",
        "postal_code": "53016",
        "lat": 27.363333,
        "lng": 2.8475
      },
      {
        "name": "Inghar",
        "name_ar": "إينغر",
        "daira": "In Ghar",
        "postal_code": "53004",
        "lat": 27.2,
        "lng": 2.511111
      }
    ]
  },
  {
    "code": "58",
    "name": "In Guezzam",
    "name_ar": "عين قزام",
    "lat": 19.56861,
    "lng": 5.77222,
    "communes": [
      {
        "name": "Ain Guezzam",
        "name_ar": "عين قزام",
        "daira": "In Guezzam",
        "postal_code": "54005",
        "lat": 19.569671,
        "lng": 5.76806
      },
      {
        "name": "Tin Zouatine",
        "name_ar": "تين زواتين",
        "daira": "Tin Zaouatine",
        "postal_code": "54011",
        "lat": 19.953333,
        "lng": 2.966667
      }
    ]
  }
];

export function getWilayasList(): WilayaInfo[] {
  return ALGERIA_WILAYAS_DATABASE;
}

export function getCommunesForWilaya(wilayaIdentifier: string): CommuneInfo[] {
  if (!wilayaIdentifier) return [];
  const clean = wilayaIdentifier.trim();
  const codeMatch = clean.match(/^(\d{1,2})/);
  const codeStr = codeMatch ? codeMatch[1].padStart(2, "0") : null;

  const found = ALGERIA_WILAYAS_DATABASE.find(
    (w) => w.code === codeStr || w.name.toLowerCase() === clean.toLowerCase() || `${w.code} - ${w.name}`.toLowerCase() === clean.toLowerCase()
  );

  return found ? found.communes : [];
}

export function findWilayaCoords(wilayaIdentifier: string): { lat: number; lng: number } | null {
  if (!wilayaIdentifier) return null;
  const clean = wilayaIdentifier.trim();
  const codeMatch = clean.match(/^(\d{1,2})/);
  const codeStr = codeMatch ? codeMatch[1].padStart(2, "0") : null;

  const found = ALGERIA_WILAYAS_DATABASE.find(
    (w) => w.code === codeStr || w.name.toLowerCase() === clean.toLowerCase() || `${w.code} - ${w.name}`.toLowerCase() === clean.toLowerCase()
  );

  return found ? { lat: found.lat, lng: found.lng } : null;
}

function normalizeGeoString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]/g, '');
}

export function findCommuneCoords(
  wilayaIdentifier: string,
  communeName: string
): { lat: number; lng: number } | null {
  if (!communeName) return null;
  const communes = getCommunesForWilaya(wilayaIdentifier);
  const targetRaw = communeName.trim();
  const targetNorm = normalizeGeoString(targetRaw);
  const targetConsonants = targetNorm.replace(/[aeiouy]/g, '');

  // 1. Exact match (Latin or Arabic)
  const exact = communes.find(
    (c) =>
      c.name.toLowerCase() === targetRaw.toLowerCase() ||
      (c.name_ar && c.name_ar.trim() === targetRaw)
  );
  if (exact) return { lat: exact.lat, lng: exact.lng };

  // 2. Accent-insensitive & symbol-insensitive match
  const normMatch = communes.find((c) => {
    const cNorm = normalizeGeoString(c.name);
    return cNorm === targetNorm;
  });
  if (normMatch) return { lat: normMatch.lat, lng: normMatch.lng };

  // 3. Substring match
  const partial = communes.find((c) => {
    const cNorm = normalizeGeoString(c.name);
    return cNorm.includes(targetNorm) || targetNorm.includes(cNorm);
  });
  if (partial) return { lat: partial.lat, lng: partial.lng };

  // 4. Consonant match (handles transliteration differences like cherga vs cheraga)
  if (targetConsonants.length >= 3) {
    const consonantMatch = communes.find((c) => {
      const cConsonants = normalizeGeoString(c.name).replace(/[aeiouy]/g, '');
      return cConsonants === targetConsonants || cConsonants.startsWith(targetConsonants);
    });
    if (consonantMatch) return { lat: consonantMatch.lat, lng: consonantMatch.lng };
  }

  return null;
}

export function findClosestLocation(
  lat: number,
  lng: number
): { wilaya: string; wilayaCode: string; commune: string; lat: number; lng: number } {
  let closestWilaya = ALGERIA_WILAYAS_DATABASE[0];
  let closestCommune: CommuneInfo = ALGERIA_WILAYAS_DATABASE[0].communes[0];
  let minDistance = Infinity;

  for (const w of ALGERIA_WILAYAS_DATABASE) {
    for (const c of w.communes) {
      const d = Math.hypot(c.lat - lat, c.lng - lng);
      if (d < minDistance) {
        minDistance = d;
        closestWilaya = w;
        closestCommune = c;
      }
    }
  }

  return {
    wilaya: closestWilaya.name,
    wilayaCode: closestWilaya.code,
    commune: closestCommune.name,
    lat: closestCommune.lat,
    lng: closestCommune.lng,
  };
}

