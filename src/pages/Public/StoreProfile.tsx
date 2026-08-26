import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, SearchX, Star, Package, ChevronLeft, Store, Truck, Undo2, Building2, Info, UserPlus, UserCheck, Users, Camera, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, limit, setDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { ProductCard } from '../../components/Product/ProductCard';
import { Product } from "../../domains/product/product.types";
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { apiGet } from '../../lib/api';
import { FALLBACK_SHOPS } from '../../data/fallbackShops';

import { Spinner } from '../../components/ui/Spinner';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { ImageAdjusterModal } from '../../components/ui/ImageAdjusterModal';
import { OptimizedImage } from '../../components/ui/OptimizedImage';
import { AnimatePresence } from 'motion/react';
import { ALGERIA_REGIONS } from '../../data/algeriaRegions';
import { maskSensitiveData, hasExternalChannel } from '../../utils/masking';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

export interface PublicStoreInfo {
  id: string;
  sellerId: string;
  shopName: string;
  shopDescription?: string;
  wilaya: string;
  legalStatus?: string;
  avgPreparationTime?: string;
  returnPolicy?: string;
  followersCount?: number;
  rating?: number | null;
  status?: string;
  logoUrl?: string;
  bannerUrl?: string;
  shopSlug?: string;
  coverImage?: string;
  displayName?: string;
  description?: string;
  avatarUrl?: string;
  coverUrl?: string;
  uid?: string;
  userUid?: string;
  error?: string;
  photoURL?: string;
  photoUrl?: string;
  avatar?: string;
  banner?: string;
  storeBanner?: string;
  sellerBanner?: string;
  bannerImage?: string;
  brand?: string;
}

export const StoreProfile: React.FC = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'fr';
  const isRTL = currentLang === 'ar';
  
  const d = (key: string) => {
    const dict: Record<string, Record<string, string>> = {
      fr: {
        legalStatus: "Statut Légal",
        prepTime: "Préparation Moyenne",
        returnPolicy: "Politiques & Retours",
        notExist: "Boutique Introuvable",
        notExistDesc: "Ce vendeur n'existe pas ou la boutique a été fermée.",
        backToCatalog: "Retour au Catalogue",
        articles: "Articles",
        newSeller: "Nouveau Vendeur",
        welcome: "Bienvenue dans ma boutique sur Olma.",
        featured: "Mis en avant",
        allArticles: "Tous les articles",
        loadMore: "Voir plus d'articles",
        loading: "Chargement...",
        emptyStore: "Boutique Vide",
        emptyDesc: "Ce vendeur n'a pas encore ajouté d'articles actifs.",
        subscribers: "Abonnés",
        editCover: "Modifier la couverture",
        uploadingCover: "Mise en ligne de la couverture...",
        editProfile: "Modifier la photo",
        uploadingProfile: "Mise en ligne du profil..."
      },
      en: {
        legalStatus: "Legal Status",
        prepTime: "Average Prep Time",
        returnPolicy: "Policies & Returns",
        notExist: "Store Not Found",
        notExistDesc: "This seller does not exist or the store has been closed.",
        backToCatalog: "Back to Catalog",
        articles: "Items",
        newSeller: "New Seller",
        welcome: "Welcome to my store on Olma.",
        featured: "Featured",
        allArticles: "All items",
        loadMore: "Load more items",
        loading: "Loading...",
        emptyStore: "Empty Store",
        emptyDesc: "This seller hasn't added any active items yet.",
        subscribers: "Subscribers",
        editCover: "Edit Cover",
        uploadingCover: "Uploading cover...",
        editProfile: "Edit Profile Info",
        uploadingProfile: "Uploading profile..."
      },
      ar: {
        legalStatus: "الوضع القانوني",
        prepTime: "متوسط وقت التحضير",
        returnPolicy: "السياسات والإرجاع",
        notExist: "المتجر غير موجود",
        notExistDesc: "هذا البائع غير موجود أو تم إغلاق المتجر.",
        backToCatalog: "العودة إلى الكتالوج",
        articles: "منتجات",
        newSeller: "بائع جديد",
        welcome: "مرحبا بكم في متجري على Olma.",
        featured: "مميز",
        allArticles: "جميع المنتجات",
        loadMore: "عرض المزيد من المنتجات",
        loading: "جاري التحميل...",
        emptyStore: "متجر فارغ",
        emptyDesc: "لم يضف هذا البائع أي منتجات نشطة بعد.",
        subscribers: "متابعون",
        editCover: "تعديل الغلاف",
        uploadingCover: "جاري رفع الغلاف...",
        editProfile: "تعديل الصورة",
        uploadingProfile: "جاري رفع الصورة..."
      }
    };
    return dict[currentLang]?.[key] || dict["fr"][key];
  };

  const [storeInfo, setStoreInfo] = useState<PublicStoreInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Follow logic
  const { currentUser, userProfile } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Local Pagination state
  const INITIAL_LIMIT = typeof window !== 'undefined' ? (window.innerWidth >= 1024 ? 10 : window.innerWidth >= 768 ? 8 : 6) : 6;
  const LOAD_MORE_LIMIT = 6;
  const [displayLimit, setDisplayLimit] = useState(INITIAL_LIMIT);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // Edit "About" state for Owner
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);
  const [editForm, setEditForm] = useState({
    shopName: '',
    shopDescription: '',
    wilaya: '',
    legalStatus: '',
    avgPreparationTime: '',
    returnPolicy: ''
  });

  // Direct upload capability for owner
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const isOwner = Boolean(
    currentUser?.uid && (
      currentUser.uid === sellerId ||
      (storeInfo && (
        currentUser.uid === storeInfo.id ||
        currentUser.uid === storeInfo.sellerId ||
        currentUser.uid === storeInfo.uid ||
        currentUser.uid === storeInfo.userUid
      ))
    )
  );

  // Image adjust state
  const [adjustingImage, setAdjustingImage] = useState<{ file: File; type: 'logo' | 'banner'; src: string } | null>(null);

  // Redesign state: active tab, category search & key-searching
  const [activeTab, setActiveTab] = useState<'products' | 'about'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(isRTL ? "الحجم الأقصى للملف هو 5 ميجابايت" : "Taille maximale 5 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAdjustingImage({
        file,
        type: 'logo',
        src: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBannerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(isRTL ? "الحجم الأقصى لغلاف الصفحة هو 5 ميجابايت" : "Taille de couverture maximale 5 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAdjustingImage({
        file,
        type: 'banner',
        src: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveAdjustedImage = async (blob: Blob) => {
    if (!adjustingImage || !sellerId) return;
    const { type } = adjustingImage;
    setAdjustingImage(null);

    const isLogo = type === 'logo';
    if (isLogo) {
      setUploadingLogo(true);
    } else {
      setUploadingBanner(true);
    }

    const toastId = toast.loading(isRTL ? "جاري رفع الصورة المعدلة..." : "Envoi de l'image ajustée...");

    try {
      const { ref: storageRef, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('../../lib/firebase');

      const fileExtension = 'jpg';
      const fileRef = storageRef(storage, `shops/${sellerId}/${type}_${Date.now()}.${fileExtension}`);
      
      // Upload the generated Blob with content type header
      try {
        await uploadBytes(fileRef, blob, { contentType: 'image/jpeg' });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        toast.error("Firebase Storage Error: " + errorMsg, { id: toastId });
        return;
      }
      
      const url = await getDownloadURL(fileRef);

      // Save to Firebase Firestore
      const updateData: Record<string, string> = {};
      if (isLogo) {
        updateData.logoUrl = url;
        updateData.photoURL = url;
        updateData.avatarUrl = url;
      } else {
        updateData.bannerUrl = url;
        updateData.coverUrl = url;
        updateData.coverImage = url;
      }

      try {
        await updateDoc(doc(db, "users", sellerId), updateData);
      } catch (err) {
        console.warn("Firestore users update warning:", err);
      }

      try {
        await setDoc(doc(db, "publicProfiles", sellerId), updateData, { merge: true });
      } catch (err) {
        console.warn("Firestore publicProfiles error:", err);
      }

      // Update State
      setStoreInfo(prev => prev ? ({ ...prev, ...updateData }) : null);
      toast.success(
        isRTL 
          ? "تم تحديث الصورة بنجاح !" 
          : "Photo mise à jour avec succès !", 
        { id: toastId }
      );
    } catch (err) {
      console.error(err);
      toast.error(isRTL ? "حدث خطأ أثناء الرفع." : "Échec du chargement.", { id: toastId });
    } finally {
      if (isLogo) {
        setUploadingLogo(false);
      } else {
        setUploadingBanner(false);
      }
    }
  };

  useEffect(() => {
    const fetchStoreAndProducts = async () => {
      if (!sellerId) return;
      setLoading(true);
      try {
        let data: PublicStoreInfo | null = null;
        const decodedSellerId = decodeURIComponent(sellerId);

        // 1. Try fetching publicProfile document (and user document if active user is owner/admin)
        let pubData: Record<string, unknown> | null = null;
        let userData: Record<string, unknown> | null = null;
        try {
          const isSelfOrAdmin = currentUser?.uid === sellerId || userProfile?.role === 'admin';
          const [pubSnap, userSnap] = await Promise.all([
            getDoc(doc(db, "publicProfiles", sellerId)).catch(() => null),
            isSelfOrAdmin ? getDoc(doc(db, "users", sellerId)).catch(() => null) : Promise.resolve(null)
          ]);
          if (pubSnap && pubSnap.exists()) pubData = pubSnap.data() as Record<string, unknown>;
          if (userSnap && 'exists' in userSnap && userSnap.exists()) userData = userSnap.data() as Record<string, unknown>;
        } catch (e) {
          console.warn("[StoreProfile] Firestore profile fetch error:", e);
        }

        if (pubData || userData) {
          const merged = { ...(userData || {}), ...(pubData || {}) } as Record<string, string | number | boolean | null | undefined>;
          const logoUrl = (pubData?.logoUrl || pubData?.photoURL || pubData?.avatarUrl ||
                          userData?.logoUrl || userData?.photoURL || userData?.avatarUrl || userData?.photoUrl || "") as string;

          const bannerUrl = (pubData?.bannerUrl || pubData?.coverUrl || pubData?.coverImage ||
                            userData?.bannerUrl || userData?.coverUrl || userData?.coverImage || userData?.bannerImage || "") as string;

          data = {
            id: sellerId,
            sellerId: sellerId,
            shopName: (merged.shopName || merged.displayName || ("Boutique " + (merged.displayName || "Vendeur"))) as string,
            shopDescription: (merged.shopDescription || merged.description || "Bienvenue dans ma boutique sur Olmart.") as string,
            wilaya: (merged.wilaya || "16 - Alger") as string,
            legalStatus: (merged.legalStatus || "Artisan / Commerçant") as string,
            avgPreparationTime: (merged.avgPreparationTime || "24h") as string,
            returnPolicy: (merged.returnPolicy || "Retours acceptés sous 7 jours.") as string,
            followersCount: (merged.followersCount || 0) as number,
            rating: merged.rating !== undefined ? merged.rating as number | null : null,
            status: (merged.status || "ACTIVE") as string,
            ...merged,
            logoUrl,
            bannerUrl
          };
        }

        // 2. Try API endpoints (Server Admin SDK bypasses rules safely)
        if (!data) {
          try {
            const apiRes = await apiGet<{ success: boolean; shop?: PublicStoreInfo }>(`/api/v1/public/shops/${encodeURIComponent(sellerId)}`);
            if (apiRes && apiRes.success && apiRes.shop) {
              data = apiRes.shop;
            } else {
              const apiRes2 = await apiGet<PublicStoreInfo>(`/api/v1/stores/${encodeURIComponent(sellerId)}`);
              if (apiRes2 && !apiRes2.error) {
                data = apiRes2;
              }
            }
          } catch (e) {
            console.warn("[StoreProfile] API shop fetch error:", e);
          }
        }

        // 3. Query publicProfiles collection by shopSlug, shopName or displayName on client
        if (!data) {
          try {
            const qSlug = query(collection(db, "publicProfiles"), where("shopSlug", "==", sellerId), limit(1));
            const snapSlug = await getDocs(qSlug);
            if (!snapSlug.empty) {
              const pDoc = snapSlug.docs[0];
              const pData = pDoc.data();
              data = {
                id: pDoc.id,
                sellerId: pDoc.id,
                shopName: pData.shopName || pData.displayName || "Boutique Vendeur",
                shopDescription: pData.shopDescription || pData.description || "Bienvenue dans ma boutique sur Olmart.",
                logoUrl: pData.logoUrl || pData.photoURL || "",
                bannerUrl: pData.bannerUrl || pData.coverUrl || "",
                wilaya: pData.wilaya || "16 - Alger",
                ...pData
              };
            }
          } catch (e) {
            console.warn("[StoreProfile] PublicProfiles slug query error:", e);
          }
        }

        if (!data) {
          try {
            const qName = query(collection(db, "publicProfiles"), where("shopName", "==", decodedSellerId), limit(1));
            const snapName = await getDocs(qName);
            if (!snapName.empty) {
              const pDoc = snapName.docs[0];
              const pData = pDoc.data();
              data = { id: pDoc.id, sellerId: pDoc.id, shopName: pData.shopName || pData.displayName || "Boutique Vendeur", wilaya: pData.wilaya || "16 - Alger", ...pData };
            } else {
              const qDisplay = query(collection(db, "publicProfiles"), where("displayName", "==", decodedSellerId), limit(1));
              const snapDisplay = await getDocs(qDisplay);
              if (!snapDisplay.empty) {
                const pDoc = snapDisplay.docs[0];
                const pData = pDoc.data();
                data = { id: pDoc.id, sellerId: pDoc.id, shopName: pData.shopName || pData.displayName || "Boutique Vendeur", wilaya: pData.wilaya || "16 - Alger", ...pData };
              }
            }
          } catch (e) {
            console.warn("[StoreProfile] PublicProfiles name query error:", e);
          }
        }

        // 6. Try FALLBACK_SHOPS data
        if (!data) {
          const fb = FALLBACK_SHOPS.find(s => 
            s.sellerId === sellerId || 
            s.id === sellerId || 
            s.shopName.toLowerCase() === decodedSellerId.toLowerCase()
          );
          if (fb) {
            data = {
              ...fb,
              shopDescription: fb.description || "Bienvenue dans notre boutique partenaire.",
            };
          }
        }

        // --- Build target seller identifiers for product lookup ---
        const targetSellerIds = Array.from(new Set([
          sellerId,
          decodedSellerId,
          data?.id,
          data?.sellerId,
          data?.uid,
          data?.userUid
        ].filter(Boolean) as string[]));

        const targetSellerNames = Array.from(new Set([
          data?.shopName,
          data?.displayName,
          data?.brand,
          decodedSellerId
        ].filter(Boolean) as string[]));

        // 7. Fetch products for this seller across multiple strategies
        const productMap = new Map<string, Product>();

        // Strategy A: Primary Public Shop Products API (Admin SDK backend)
        for (const tid of targetSellerIds) {
          try {
            const pubProdRes = await apiGet<{ success?: boolean; products?: Product[] }>(
              `/api/v1/public/shops/${encodeURIComponent(tid)}/products`
            ).catch(() => null);
            if (pubProdRes && Array.isArray(pubProdRes.products) && pubProdRes.products.length > 0) {
              pubProdRes.products.forEach(p => {
                if (p && p.id) productMap.set(p.id, p);
              });
            }
          } catch (e) {
            console.warn(`[StoreProfile] Public shop products API error for tid=${tid}:`, e);
          }
        }

        // Strategy B: If the logged-in user is viewing their own store, fetch via authenticated seller endpoint
        if (currentUser?.uid && (currentUser.uid === sellerId || currentUser.uid === data?.id || currentUser.uid === data?.sellerId)) {
          try {
            const sellerApiRes = await apiGet<Product[] | { products?: Product[] }>('/api/v1/seller/products').catch(() => null);
            if (sellerApiRes && Array.isArray(sellerApiRes)) {
              sellerApiRes.forEach(p => {
                if (p && p.id) productMap.set(p.id, p);
              });
            } else if (sellerApiRes && typeof sellerApiRes === 'object' && Array.isArray(sellerApiRes?.products)) {
              sellerApiRes.products.forEach((p) => {
                if (p && p.id) productMap.set(p.id, p);
              });
            }
          } catch (e) {
            console.warn("[StoreProfile] Seller authenticated products API error:", e);
          }
        }

        // Strategy C: Firestore direct queries by target seller IDs
        for (const tid of targetSellerIds) {
          try {
            const qProd = query(
              collection(db, "products"),
              where("sellerId", "==", tid),
              limit(50)
            );
            const snapProd = await getDocs(qProd);
            snapProd.docs.forEach(doc => {
              productMap.set(doc.id, { id: doc.id, ...doc.data() } as unknown as Product);
            });
          } catch (e) {
            console.warn(`[StoreProfile] Firestore products query for sellerId=${tid} warning:`, e);
          }
        }

        // Strategy D: Firestore query by shop/seller names
        if (productMap.size === 0) {
          for (const sName of targetSellerNames) {
            try {
              const qName = query(
                collection(db, "products"),
                where("sellerName", "==", sName),
                limit(50)
              );
              const snapName = await getDocs(qName);
              snapName.docs.forEach(doc => {
                productMap.set(doc.id, { id: doc.id, ...doc.data() } as unknown as Product);
              });

              const qStore = query(
                collection(db, "products"),
                where("storeName", "==", sName),
                limit(50)
              );
              const snapStore = await getDocs(qStore);
              snapStore.docs.forEach(doc => {
                productMap.set(doc.id, { id: doc.id, ...doc.data() } as unknown as Product);
              });
            } catch (e) {
              console.warn(`[StoreProfile] Firestore products query by sellerName=${sName} warning:`, e);
            }
          }
        }

        // Strategy E: Cross-sell API fallback
        if (productMap.size === 0) {
          try {
            for (const tid of targetSellerIds) {
              const apiProdRes = await apiGet<{ products?: Product[] }>(`/api/v1/products/cross-sell?sellerId=${encodeURIComponent(tid)}&limit=30`).catch(() => null);
              if (apiProdRes && Array.isArray(apiProdRes.products) && apiProdRes.products.length > 0) {
                apiProdRes.products.forEach(p => {
                  if (p && p.id) productMap.set(p.id, p);
                });
                break;
              }
            }
          } catch (e) {
            console.warn("[StoreProfile] API products cross-sell fallback error:", e);
          }
        }

        const fetchedProducts = Array.from(productMap.values());

        // 8. Infer storeInfo from product metadata if profile missing
        if (!data && fetchedProducts.length > 0) {
          const sample = fetchedProducts[0] as Product & { storeName?: string; sellerLogo?: string; storeLogo?: string; location?: string; };
          data = {
            id: sellerId,
            sellerId: sellerId,
            shopName: sample.sellerName || sample.storeName || sample.brand || decodedSellerId || "Boutique Officielle",
            shopDescription: "Boutique certifiée et partenaire Olmart.",
            logoUrl: sample.sellerLogo || sample.storeLogo || "",
            bannerUrl: "",
            wilaya: sample.wilaya || sample.location || "16 - Alger",
            legalStatus: "Vendeur Partenaire",
            avgPreparationTime: "24h",
            returnPolicy: "Retours acceptés sous 7 jours.",
            followersCount: 0,
            rating: null,
            status: "ACTIVE"
          };
        }

        // 9. Guarantee clean fallback profile so seller pages always open
        if (!data && sellerId) {
          const nameFromId = decodedSellerId
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());

          data = {
            id: sellerId,
            sellerId: sellerId,
            shopName: nameFromId || "Boutique Officielle",
            shopDescription: "Boutique enregistrée sur la Marketplace Olmart Algérie.",
            logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameFromId)}&background=0F766E&color=fff&bold=true`,
            bannerUrl: "",
            wilaya: "16 - Alger",
            legalStatus: "Vendeur Vérifié",
            avgPreparationTime: "24h",
            returnPolicy: "Politique de retours standard Olmart.",
            followersCount: 0,
            rating: null,
            status: "ACTIVE"
          };
        }

        if (data) {
          // Final resolution check for logoUrl and bannerUrl across all potential aliases & product metadata
          const sampleProd = fetchedProducts.find((p) => {
            const extended = p as Product & { sellerLogo?: string; storeLogo?: string; sellerBanner?: string; storeBanner?: string; };
            return extended.sellerLogo || extended.storeLogo || extended.sellerBanner || extended.storeBanner;
          }) as (Product & { sellerLogo?: string; storeLogo?: string; sellerBanner?: string; storeBanner?: string; }) | undefined;

          const resolvedLogo =
            data.logoUrl ||
            data.photoURL ||
            data.avatarUrl ||
            data.photoUrl ||
            data.avatar ||
            sampleProd?.sellerLogo ||
            sampleProd?.storeLogo ||
            (currentUser?.uid === data.id || currentUser?.uid === data.sellerId ? currentUser?.photoURL : "") ||
            "";

          const resolvedBanner =
            data.bannerUrl ||
            data.coverUrl ||
            data.coverImage ||
            data.bannerImage ||
            data.banner ||
            data.storeBanner ||
            data.sellerBanner ||
            sampleProd?.sellerBanner ||
            sampleProd?.storeBanner ||
            "";

          data.logoUrl = resolvedLogo;
          data.bannerUrl = resolvedBanner;

          setStoreInfo(data);
          setEditForm({
            shopName: data.shopName || data.displayName || '',
            shopDescription: data.shopDescription || data.description || '',
            wilaya: data.wilaya || '',
            legalStatus: data.legalStatus || '',
            avgPreparationTime: data.avgPreparationTime || '',
            returnPolicy: data.returnPolicy || ''
          });
        }

        setProducts(fetchedProducts);
        setTotalCount(fetchedProducts.length);
      } catch (err) {
        console.error("Error fetching store data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreAndProducts();
  }, [sellerId, currentUser?.uid, currentUser?.photoURL, userProfile?.role]);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser || !sellerId) return;
      try {
        const followDoc = await getDoc(doc(db, "users", currentUser.uid, "following", sellerId));
        if (followDoc.exists()) {
          setIsFollowing(true);
        }
      } catch (err) {
        console.error("Error checking follow status:", err);
      }
    };
    checkFollowStatus();
  }, [currentUser, sellerId]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!sellerId || followLoading || !storeInfo) return;
    
    if (isFollowing) {
      setShowConfirm(true);
      return;
    }

    executeFollowToggle();
  };

  const executeFollowToggle = async () => {
    setFollowLoading(true);
    try {
      const followRef = doc(db, "users", currentUser!.uid, "following", sellerId!);
      const sellerPublicRef = doc(db, "publicProfiles", sellerId!);
      const sellerPrivateRef = doc(db, "users", sellerId!);

      if (isFollowing) {
        await deleteDoc(followRef);
        
        // Decrement followersCount in publicProfiles
        await updateDoc(sellerPublicRef, {
          followersCount: increment(-1)
        }).catch(err => (process.env.NODE_ENV === 'development' ? console.log : function(){})("PublicProfile follow count dec error", err));

        // Decrement followersCount in users
        await updateDoc(sellerPrivateRef, {
          followersCount: increment(-1)
        }).catch(err => (process.env.NODE_ENV === 'development' ? console.log : function(){})("UserProfile follow count dec error", err));

        setIsFollowing(false);
        // Update local state smoothly
        setStoreInfo((prev) => prev ? ({
          ...prev,
          followersCount: Math.max(0, (prev.followersCount || 0) - 1)
        }) : null);

        toast.success("Désabonnement réussi.");
      } else {
        await setDoc(followRef, {
          sellerId,
          name: storeInfo?.shopName || storeInfo?.displayName || 'Boutique',
          logo: storeInfo?.logoUrl || null,
          location: storeInfo?.wilaya || 'Algérie',
          followedAt: new Date().toISOString()
        });

        // Increment followersCount in publicProfiles
        await updateDoc(sellerPublicRef, {
          followersCount: increment(1)
        }).catch(err => (process.env.NODE_ENV === 'development' ? console.log : function(){})("PublicProfile follow count inc error", err));

        // Increment followersCount in users
        await updateDoc(sellerPrivateRef, {
          followersCount: increment(1)
        }).catch(err => (process.env.NODE_ENV === 'development' ? console.log : function(){})("UserProfile follow count inc error", err));

        setIsFollowing(true);
        // Update local state smoothly
        setStoreInfo((prev) => prev ? ({
          ...prev,
          followersCount: (prev.followersCount || 0) + 1
        }) : null);

        toast.success("Boutique suivie !");
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      toast.error("Erreur lors de l'action.");
    } finally {
      setFollowLoading(false);
      setShowConfirm(false);
    }
  };

  const loadMoreProducts = () => {
    setDisplayLimit(prev => prev + LOAD_MORE_LIMIT);
  };

  const saveAboutInfo = async () => {
    if (!sellerId) return;
    
    if (
      hasExternalChannel(editForm.shopName) || 
      hasExternalChannel(editForm.shopDescription) || 
      hasExternalChannel(editForm.legalStatus) || 
      hasExternalChannel(editForm.returnPolicy) ||
      hasExternalChannel(editForm.avgPreparationTime)
    ) {
      toast.error(t("external_channel_blocked", "Les coordonnees de communication exterieure (messages, liens ou reseaux) ne sont pas autorisees dans ce champ de texte. Tout contact doit s'effectuer exclusivement via la plateforme OLMART."));
      return;
    }

    setSavingAbout(true);
    const toastId = toast.loading(isRTL ? "جاري الحفظ..." : "Enregistrement en cours...");
    try {
      const maskedForm = {
        ...editForm,
        shopName: maskSensitiveData(editForm.shopName || ''),
        shopDescription: maskSensitiveData(editForm.shopDescription || ''),
        legalStatus: maskSensitiveData(editForm.legalStatus || ''),
        returnPolicy: maskSensitiveData(editForm.returnPolicy || ''),
        avgPreparationTime: maskSensitiveData(editForm.avgPreparationTime || '')
      };

      await updateDoc(doc(db, "users", sellerId), maskedForm);
      await setDoc(doc(db, "publicProfiles", sellerId), maskedForm, { merge: true });
      setStoreInfo((prev) => prev ? ({ ...prev, ...maskedForm }) : null);
      setIsEditingAbout(false);
      toast.success(isRTL ? "تم تحديث المعلومات بنجاح" : "Informations mises à jour.", { id: toastId });
    } catch(err) {
      console.error(err);
      toast.error(isRTL ? "خطأ أثناء الحفظ" : "Erreur lors de l'enregistrement", { id: toastId });
    } finally {
      setSavingAbout(false);
    }
  };

  const storeCategories = Array.from(new Set(products?.map(p => p.category))).filter((cat): cat is string => Boolean(cat));
  
  const getCategoryCount = (catName: string) => {
    return products.filter(p => p.category === catName).length;
  };

  // Smart search helper
  const normalizeText = (text?: string): string => {
    if (!text) return "";
    return text.toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove Latin diacritics
      .replace(/[\u064B-\u065F]/g, "") // Remove Arabic diacritics (tashkeel)
      .replace(/[أإآ]/g, "ا") // Normalize Arabic Alef
      .replace(/ة/g, "ه") // Normalize Teh Marbuta
      .toLowerCase();
  };

  const matchesSmartSearch = (product: Product, query: string): boolean => {
    if (!query) return true;
    
    // Multi-lingual synonyms groups (fr, en, ar)
    const synonymGroups = [
      ['chaussure', 'chaussures', 'soulier', 'souliers', 'basket', 'baskets', 'sneaker', 'sneakers', 'botte', 'bottes', 'sandale', 'sandales', 'shoes', 'shoe', 'حذاء', 'احذيه', 'سباط'],
      ['vetement', 'vetements', 'habit', 'habits', 'clothes', 'clothing', 'ملابس', 'لباس', 'كسوه'],
      ['pantalon', 'pantalons', 'pants', 'trousers', 'سروال', 'سراويل'],
      ['chemise', 'chemises', 'shirt', 'shirts', 'قميص', 'قمصان'],
      ['tshirt', 'tshirts', 't-shirt', 't-shirts', 'تيشيرت', 'تي شيرت'],
      ['veste', 'vestes', 'manteau', 'manteaux', 'jacket', 'coat', 'ستره', 'معطف', 'فيستا'],
      ['robe', 'robes', 'dress', 'dresses', 'فستان', 'فساتين', 'روبه'],
      ['telephone', 'telephones', 'smartphone', 'smartphones', 'portable', 'portables', 'mobile', 'mobiles', 'phone', 'phones', 'هاتف', 'هواتف', 'تليفون', 'موبايل'],
      ['pc', 'ordinateur', 'ordinateurs', 'laptop', 'laptops', 'macbook', 'computer', 'حاسوب', 'كمبيوتر', 'ميكرو'],
      ['velo', 'velos', 'bicyclette', 'bicyclettes', 'vtt', 'bike', 'bicycle', 'دراجه', 'دراجات', 'فيلو'],
      ['montre', 'montres', 'horloge', 'horloges', 'smartwatch', 'watch', 'watches', 'ساعه', 'ساعات', 'مكانه'],
      ['femme', 'femmes', 'fille', 'filles', 'dame', 'dames', 'women', 'woman', 'girl', 'امراه', 'نساء', 'بنت', 'بنات'],
      ['homme', 'hommes', 'garcon', 'garcons', 'monsieur', 'men', 'man', 'boy', 'رجل', 'رجال', 'ولد', 'اولاد'],
      ['enfant', 'enfants', 'bebe', 'bebes', 'kids', 'child', 'children', 'baby', 'طفل', 'اطفال', 'رضيع'],
      ['sac', 'sacs', 'bag', 'bags', 'حقيبه', 'حقائب', 'ساك']
    ];

    const searchTerms = normalizeText(query).split(/\s+/).filter(Boolean);
    
    const searchableText = normalizeText([
      (product as unknown as { title?: string }).title,
      product.name,
      product.description,
      product.category,
      product.subcategory,
      product.subSubCategory,
      product.gender,
      product.brand,
      ...(product.tags || []),
      ...(product.materials || [])
    ].filter(Boolean).join(" "));

    return searchTerms.every(term => {
      // Check the exact term
      if (searchableText.includes(term)) return true;
      
      // Check multi-lingual synonyms
      for (const group of synonymGroups) {
        if (group.some(g => g.includes(term) || term.includes(g))) {
           if (group.some(syn => searchableText.includes(syn))) return true;
        }
      }

      // Handle simple plurals (if term ends with 's' or 'x', try without it)
      if (term.endsWith('s') || term.endsWith('x')) {
        const singular = term.slice(0, -1);
        if (searchableText.includes(singular)) return true;
      }
      
      // Also check partial matching for the word root (extremely basic stemming)
      if (term.length > 4 && searchableText.includes(term.slice(0, -1))) return true;
      if (term.length > 5 && searchableText.includes(term.slice(0, -2))) return true;

      return false;
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = matchesSmartSearch(product, searchQuery);
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const typedFilteredProducts = filteredProducts as (Product & { isStoreFeatured?: boolean })[];

  const paginatedProducts = filteredProducts.slice(0, displayLimit);
  const currentHasMore = displayLimit < filteredProducts.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!storeInfo) {
    return (
      <div className="min-h-screen bg-transparent pt-32 pb-20 flex items-center justify-center">
         <div className="text-center space-y-6">
            <Store className="w-20 h-20 text-zinc-300 mx-auto" />
            <h1 className="text-3xl font-sans font-bold text-zinc-900">{d('notExist')}</h1>
            <p className="text-zinc-500 font-medium">{d('notExistDesc')}</p>
            <button onClick={() => navigate('/shop')} className="px-8 py-4 bg-zinc-950 text-white rounded-2xl font-sans font-bold text-[11px] uppercase tracking-widest rtl:tracking-normal hover:bg-zinc-800 transition-colors">
               {d('backToCatalog')}
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-32" dir={isRTL ? "rtl" : "ltr"}>
      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={executeFollowToggle}
        title={t("Se désabonner") || "Se désabonner"}
        message="Voulez-vous vraiment ne plus suivre cette boutique ?"
      />
      {/* Dynamic Banner Cover */}
      <div className="h-60 sm:h-72 md:h-96 w-full bg-zinc-950 relative overflow-hidden">
         {storeInfo.bannerUrl ? (
            <OptimizedImage
              src={getOptimizedImageUrl(storeInfo.bannerUrl, 1200)}
              alt={t("Store Banner") || "Store Banner"}
              priority={true}
              className="w-full h-full object-cover opacity-70 transition-transform duration-700 hover:scale-[1.03]"
            />
         ) : (
            <div className="w-full h-full bg-gradient-to-tr from-zinc-900 via-zinc-900 to-amber-950/40 opacity-90" />
         )}
         
         <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
         
         {/* Navigation Back Button */}
         <button 
            onClick={() => navigate('/shop')}
            className="absolute top-6 left-4 sm:left-8 w-11 h-11 bg-white/10 hover:bg-white/25 backdrop-blur-lg rounded-full flex items-center justify-center text-white border border-white/20 transition-all shadow-md z-20 hover:scale-105 active:scale-95"
         >
            <ChevronLeft className="w-5 h-5" />
         </button>

         {/* Cover Banner Edit Button for Owner */}
         {isOwner && (
            <div className="absolute top-6 right-4 sm:right-8 rtl:left-4 rtl:right-auto rtl:sm:left-8 rtl:sm:right-auto z-20 animate-fade-in">
               <label className="w-11 h-11 bg-white/15 backdrop-blur-lg hover:bg-white/35 text-white border border-white/25 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95">
                  <Camera className="w-4 h-5" />
                  <input 
                     type="file" 
                     accept="image/*" 
                     className="hidden" 
                     onChange={handleBannerFileSelect} 
                     disabled={uploadingBanner}
                  />
               </label>
            </div>
         )}

         {uploadingBanner && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-30">
               <div className="bg-zinc-950 border border-zinc-800 px-5 py-3.5 rounded-2xl flex items-center gap-3 text-white font-extrabold text-[11px] uppercase tracking-widest shadow-2xl">
                  <span className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <span>{d('uploadingCover')}</span>
               </div>
            </div>
         )}
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 relative -mt-24 sm:-mt-28 md:-mt-32 z-10 animate-fade-in">
         {/* Premium Store Header Card */}
         <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 border border-zinc-200/50">
            {/* Store Logo with Double-circle design */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 bg-white rounded-3xl p-1.5 shadow-lg relative group border border-zinc-100 flex-none -mt-20 sm:-mt-24 md:-mt-28">
               <div className="w-full h-full rounded-2xl overflow-hidden bg-zinc-50 flex items-center justify-center relative border border-zinc-100">
                  {storeInfo.logoUrl ? (
                     <OptimizedImage
                        src={getOptimizedImageUrl(storeInfo.logoUrl, 400)}
                        alt={t("Store Logo") || "Store Logo"}
                        className="w-full h-full object-cover"
                     />
                  ) : (
                     <Store className="w-12 h-12 text-zinc-300" />
                  )}
                  {uploadingLogo && (
                     <div className="absolute inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center z-10 animate-fade-in">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                     </div>
                  )}
               </div>
               
               {isOwner && (
                  <label className="absolute -bottom-1 -right-1 w-9 h-9 bg-zinc-950 hover:bg-zinc-900 border-2 border-white shadow-xl rounded-xl flex items-center justify-center text-white cursor-pointer transition-all hover:scale-105 active:scale-95 z-20">
                     <Camera className="w-4 h-4" />
                     <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleLogoFileSelect} 
                        disabled={uploadingLogo} 
                     />
                  </label>
               )}
            </div>

            {/* Store Information Content */}
            <div className="flex-1 text-center md:text-left space-y-4 w-full">
               <div className="flex flex-col md:flex-row items-center md:justify-between w-full gap-4">
                  <div className="space-y-1">
                     <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2.5">
                        <h1 className="text-2xl sm:text-3xl font-sans font-bold text-zinc-950 tracking-tight rtl:tracking-normal">
                           {storeInfo.shopName || storeInfo.displayName || 'Boutique'}
                        </h1>
                        {/* Status Verification Badge */}
                        {storeInfo.status === 'ACTIVE' && (
                           <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{t("store_profile.verified", "Vérifié")}</span>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Owner Status Tag or Follow Button */}
                  <div className="shrink-0">
                     {isOwner ? (
                       <div className="bg-zinc-950 px-5 py-2.5 rounded-xl text-[10px] font-sans font-black uppercase tracking-widest text-white border border-zinc-800 shadow-md select-none flex items-center justify-center gap-2">
                          <Store className="w-3.5 h-3.5 text-white shrink-0" />
                          <span className="text-white font-extrabold">{isRTL ? "متجرك الخاص" : "Votre Boutique"}</span>
                       </div>
                     ) : (
                       <button
                          onClick={handleFollowToggle}
                          disabled={followLoading}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest rtl:tracking-normal transition-all duration-300 ${
                             isFollowing 
                                ? 'bg-zinc-100 text-zinc-800 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-zinc-200'
                                : 'bg-zinc-950 text-white hover:bg-zinc-800 hover:shadow-lg active:scale-95 border border-zinc-900'
                          }`}
                       >
                          {isFollowing ? (
                             <>
                                <UserCheck className="w-3.5 h-3.5 text-zinc-700" />
                                <span className="text-zinc-800 font-extrabold">{isRTL ? "متابع" : "Abonné"}</span>
                             </>
                          ) : (
                             <>
                                <UserPlus className="w-3.5 h-3.5 text-white" />
                                <span className="text-white font-extrabold">{isRTL ? "متابعة" : "S'abonner"}</span>
                             </>
                          )}
                       </button>
                     )}
                  </div>
               </div>

               {/* Elegant modern pill-based Statistics Highlights */}
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
                  <span className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-600 bg-zinc-50 border border-zinc-100 rounded-lg px-2.5 py-1">
                     <MapPin className="w-3.5 h-3.5 text-orange-500" />
                     {storeInfo.wilaya || 'Algérie'}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-600 bg-zinc-50 border border-zinc-100 rounded-lg px-2.5 py-1">
                     <Package className="w-3.5 h-3.5 text-emerald-500" />
                     {totalCount !== null ? totalCount : "..."} {d('articles')}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-600 bg-zinc-50 border border-zinc-100 rounded-lg px-2.5 py-1">
                     <Users className="w-3.5 h-3.5 text-indigo-500" />
                     {(storeInfo.followersCount || 0)} {d('subscribers')}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-amber-700 bg-amber-50/50 border border-amber-100 rounded-lg px-2.5 py-1">
                     <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                     {storeInfo.rating && typeof storeInfo.rating === "number" ? `${storeInfo.rating.toFixed(1)} / 5.0` : d('newSeller')}
                  </span>
               </div>
               
               <p className="text-zinc-500 font-medium max-w-2xl text-xs sm:text-sm leading-relaxed text-center md:text-left rtl:md:text-right">
                  {storeInfo.shopDescription || d('welcome')}
               </p>

               {/* Modern Tab navigation to separate catalog and store details */}
               <div className="flex border-b border-zinc-100 gap-8 pt-6 w-full justify-center md:justify-start">
                  <button
                     onClick={() => { setActiveTab('products'); setSelectedCategory(null); setSearchQuery(''); }}
                     className={`pb-3 px-1 font-black text-[10px] uppercase tracking-widest transition-all relative flex items-center gap-2 ${
                        activeTab === 'products' ? 'text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-600'
                     }`}
                  >
                     <Package className="w-3.5 h-3.5" />
                     <span>{isRTL ? "المنتجات" : "Boutique"}</span>
                     {activeTab === 'products' && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-950 rounded-full animate-fade-in" />
                     )}
                  </button>
                  <button
                     onClick={() => setActiveTab('about')}
                     className={`pb-3 px-1 font-black text-[10px] uppercase tracking-widest transition-all relative flex items-center gap-2 ${
                        activeTab === 'about' ? 'text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-600'
                     }`}
                  >
                     <Info className="w-3.5 h-3.5" />
                     <span>{isRTL ? "حول المتجر" : "À propos & Garanties"}</span>
                     {activeTab === 'about' && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-950 rounded-full animate-fade-in" />
                     )}
                  </button>
               </div>
            </div>
         </div>

         {/* Dynamic content rendering based on active tab */}
         <div className="mt-12">
            {activeTab === 'products' ? (
               <div className="space-y-10">
                  {/* Dynamic Products Search & Filter Panel */}
                  {products.length > 0 && (
                     <div className="bg-white border border-zinc-100 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                           {/* Live Search inside Store */}
                           <div className="relative flex-1">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                              <input
                                 type="text"
                                 value={searchQuery}
                                 onChange={(e) => setSearchQuery(e.target.value)}
                                 placeholder={isRTL ? "بحث في هذا المتجر..." : "Rechercher dans cette boutique..."}
                                 className="w-full pl-11 pr-10 py-3 bg-zinc-50 border border-zinc-150 rounded-xl text-xs font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-800 focus:bg-white transition-all shadow-inner"
                              />
                              {searchQuery && (
                                 <button 
                                    onClick={() => setSearchQuery('')} 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                                 >
                                    <X className="w-3.5 h-3.5" />
                                 </button>
                              )}
                           </div>
                           
                           {/* Category Horizontal Scrolling Pills */}
                           {storeCategories.length > 0 && (
                              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1 shrink-0 max-w-full lg:max-w-2xl xl:max-w-3xl">
                                 <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                                       selectedCategory === null 
                                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm' 
                                          : 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100'
                                    }`}
                                 >
                                    {isRTL ? "الكل" : "Tout voir"}
                                 </button>
                                 {storeCategories.map(cat => (
                                    <button
                                       key={cat}
                                       onClick={() => setSelectedCategory(cat)}
                                       className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                                          selectedCategory === cat
                                             ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm' 
                                             : 'bg-zinc-50/50 text-zinc-600 border-zinc-100 hover:bg-zinc-100 hover:border-zinc-200'
                                       }`}
                                    >
                                       <span>{cat}</span>
                                       <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                                          selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
                                       }`}>
                                          {getCategoryCount(cat)}
                                       </span>
                                    </button>
                                 ))}
                              </div>
                           )}
                        </div>

                        {/* Search Indicator bar */}
                        {(searchQuery || selectedCategory) && (
                           <div className="flex items-center justify-between text-xs font-bold text-zinc-500 bg-zinc-50/60 p-2.5 px-4 rounded-xl border border-zinc-100">
                              <div className="flex items-center gap-1.5">
                                 <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                 <span>
                                    {isRTL 
                                       ? `تم العثور على ${filteredProducts.length} من المنتجات المطابقة`
                                       : `${filteredProducts.length} articles correspondent à vos filtres`}
                                 </span>
                              </div>
                              <button 
                                 onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                                 className="text-orange-600 hover:text-orange-700 underline text-[10px] uppercase font-sans font-bold tracking-wider"
                              >
                                 {isRTL ? "إعادة تعيين" : "Réinitialiser"}
                              </button>
                           </div>
                        )}
                     </div>
                  )}

                  {/* Products Grid rendering */}
                  {filteredProducts.length > 0 ? (
                     <div className="space-y-12">
                        {/* 1. Default Standard Store Presentation (No Active Queries) */}
                        {!searchQuery && !selectedCategory ? (
                           <>
                              {/* Featured items shelf */}
                              {typedFilteredProducts.filter((p) => p.isStoreFeatured).length > 0 && (
                                 <div className="space-y-6">
                                    <div className="flex items-center gap-2 border-l-4 border-amber-500 pl-4">
                                       <h2 className="text-lg font-sans font-bold text-zinc-900 uppercase tracking-widest">{d('featured')}</h2>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                                       {typedFilteredProducts.filter((p) => p.isStoreFeatured).map((product, i) => (
                                          <div key={product.id} className="col-span-1 transform transition-transform hover:scale-[1.015]">
                                             <ProductCard product={product} index={i} />
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              )}

                              {/* All listings grid */}
                              {typedFilteredProducts.filter((p) => !p.isStoreFeatured).length > 0 && (
                                 <div className="space-y-6">
                                    <div className="flex items-center gap-2 border-l-4 border-zinc-950 pl-4">
                                       <h2 className="text-lg font-sans font-bold text-zinc-900 uppercase tracking-widest">{d('allArticles')}</h2>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                                       {typedFilteredProducts.filter((p) => !p.isStoreFeatured).slice(0, displayLimit).map((product, i) => (
                                          <div key={product.id} className="col-span-1 transform transition-transform hover:scale-[1.015]">
                                             <ProductCard product={product} index={i} />
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              )}
                           </>
                        ) : (
                           /* 2. Unified Grid for Filtered / Searched items */
                           <div className="space-y-6">
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                                 {paginatedProducts.map((product, i) => (
                                    <div key={product.id} className="col-span-1 transform transition-transform hover:scale-[1.015]">
                                       <ProductCard product={product} index={i} />
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}

                        {currentHasMore && (
                           <div className="flex justify-center mt-6">
                              <button
                                 onClick={loadMoreProducts}
                                 className="px-8 py-3.5 bg-zinc-950 text-white hover:bg-zinc-900 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center gap-3 cursor-pointer"
                              >
                                 {d('loadMore')}
                              </button>
                           </div>
                        )}
                     </div>
                  ) : (
                     /* Empty Catalog or Search results state */
                     <div className="py-24 bg-white border border-zinc-100 rounded-3xl flex flex-col items-center text-center space-y-6">
                        <div className="w-20 h-20 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300 border border-zinc-100">
                           <SearchX className="w-9 h-9" />
                        </div>
                        <div className="space-y-1">
                           <h3 className="text-lg font-sans font-bold text-zinc-900">
                              {(searchQuery || selectedCategory) ? (isRTL ? "لا توجد نتائج" : "Aucun article trouvé") : d('emptyStore')}
                           </h3>
                           <p className="text-zinc-400 max-w-sm text-xs font-bold leading-relaxed">
                              {(searchQuery || selectedCategory) 
                                 ? (isRTL ? "حاول تغيير كلمات البحث أو إعادة تعيين عامل التصفية." : "Votre recherche n'a retourné aucun produit pour ce vendeur.") 
                                 : d('emptyDesc')}
                           </p>
                        </div>
                        {(searchQuery || selectedCategory) && (
                           <button 
                              onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                              className="px-6 py-2.5 bg-zinc-950 text-white text-[10px] uppercase tracking-widest font-sans font-bold rounded-lg hover:bg-zinc-800 transition-all shadow-sm"
                           >
                              {isRTL ? "إعادة تعيين البحث" : "Réinitialiser la recherche"}
                           </button>
                        )}
                     </div>
                  )}
               </div>
            ) : (
               /* ABOUT & GUARANTEES TAB - High contrast Bento structure */
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-left">
                  {/* Left Column: Brand Story */}
                  <div className="lg:col-span-5 space-y-6">
                     <div className="bg-white border border-zinc-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                           <div className="flex items-center gap-3">
                              <Store className="w-5 h-5 text-orange-500" />
                              <h3 className="text-sm font-sans font-bold uppercase text-zinc-900 tracking-wider">
                                 {isRTL ? "عن العلامة التجارية" : `La Boutique ${storeInfo.shopName || 'Boutique'}`}
                              </h3>
                           </div>
                           {isOwner && (
                              <button
                                 onClick={() => setIsEditingAbout(!isEditingAbout)}
                                 className="text-[10px] font-sans font-bold uppercase tracking-widest text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg transition-colors border border-orange-100"
                              >
                                 {isEditingAbout ? (isRTL ? "إلغاء التعديل" : "Annuler") : (isRTL ? "تعديل" : "Modifier")}
                              </button>
                           )}
                        </div>

                        {isEditingAbout ? (
                           <div className="space-y-4">
                              <div className="space-y-1.5">
                                 <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-zinc-500">{isRTL ? "اسم المتجر" : "Nom de la boutique"}</label>
                                 <input
                                    type="text"
                                    value={editForm.shopName}
                                    onChange={(e) => setEditForm(prev => ({...prev, shopName: e.target.value}))}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                                    placeholder={isRTL ? "اسم متجرك..." : "Nom de votre boutique..."}
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-zinc-500">{isRTL ? "وصف المتجر" : "Description de la boutique"}</label>
                                 <textarea
                                    value={editForm.shopDescription}
                                    onChange={(e) => setEditForm(prev => ({...prev, shopDescription: e.target.value}))}
                                    rows={4}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                                    placeholder={isRTL ? "وصف متجرك..." : "Décrivez votre boutique..."}
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-zinc-500">{isRTL ? "الولاية" : "Wilaya"}</label>
                                 <select
                                    value={editForm.wilaya}
                                    onChange={(e) => setEditForm(prev => ({...prev, wilaya: e.target.value}))}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                                 >
                                    <option value="">{isRTL ? "اختر الولاية" : "Sélectionnez votre Wilaya"}</option>
                                    {Object.values(ALGERIA_REGIONS).map((w) => (
                                       <option key={w.code} value={`${w.code} ${w.name}`}>{w.code} {w.name}</option>
                                    ))}
                                 </select>
                              </div>
                           </div>
                        ) : (
                           <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed font-semibold">
                              {storeInfo.shopDescription || (isRTL ? "مرحبًا بكم في متجرنا الرسمي على Olma. لقد تم التحقق من متجرنا لتزويدك بأفضل السلع والخدمات بأمان تام." : "Bienvenue dans notre boutique officielle sur Olma. Découvrez notre rigoureuse sélection d'articles d'excellence aux meilleurs prix du marché.")}
                           </p>
                        )}

                        <div className="space-y-3 pt-2">
                           {!isEditingAbout && (
                              <div className="flex justify-between items-center text-xs border-b border-zinc-50 pb-2.5">
                                 <span className="text-zinc-400 font-bold">{isRTL ? "موقع البائع" : "Région d'expédition"}</span>
                                 <span className="text-zinc-800 font-extrabold">{storeInfo.wilaya || 'Algérie'}</span>
                              </div>
                           )}
                           <div className="flex justify-between items-center text-xs border-b border-zinc-50 pb-2.5">
                              <span className="text-zinc-400 font-bold">{isRTL ? "تاريخ الانضمام" : "Partenaire depuis"}</span>
                              <span className="text-zinc-800 font-extrabold">2026</span>
                           </div>
                           <div className="flex justify-between items-center text-xs border-b border-zinc-50 pb-2.5">
                              <span className="text-zinc-400 font-bold">{isRTL ? "إجمالي المنتجات" : "Total d'articles actifs"}</span>
                              <span className="text-zinc-800 font-extrabold">{totalCount || 0}</span>
                           </div>
                           <div className="flex justify-between items-center text-xs">
                              <span className="text-zinc-400 font-bold">{isRTL ? "المتابعون" : "Abonnés vérifiés"}</span>
                              <span className="text-indigo-600 font-extrabold">{(storeInfo.followersCount || 0)}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Right Column: Policies and Seals */}
                  <div className="lg:col-span-7 space-y-6">
                     <div className="bg-white border border-zinc-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                           <div className="flex items-center gap-3">
                              <ShieldCheck className="w-5 h-5 text-emerald-500" />
                              <h3 className="text-sm font-sans font-bold uppercase text-zinc-900 tracking-wider">
                                 {isRTL ? "التزامات المتجر وخدمة العملاء" : "Engagements & Service Client"}
                              </h3>
                           </div>
                           {isOwner && (
                              <button
                                 onClick={() => setIsEditingAbout(!isEditingAbout)}
                                 className="text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100"
                              >
                                 {isEditingAbout ? (isRTL ? "إلغاء التعديل" : "Annuler") : (isRTL ? "تعديل" : "Modifier")}
                              </button>
                           )}
                        </div>

                        {isEditingAbout ? (
                           <div className="space-y-5">
                              <div className="space-y-1.5">
                                 <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-zinc-500">{isRTL ? "الوضع القانوني (اختياري)" : "Statut Légal (Optionnel)"}</label>
                                 <input
                                    type="text"
                                    value={editForm.legalStatus}
                                    onChange={(e) => setEditForm(prev => ({...prev, legalStatus: e.target.value}))}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                                    placeholder="SARL, EURL, Auto-entrepreneur..."
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-zinc-500">{isRTL ? "متوسط وقت التحضير" : "Délai moyen de préparation"}</label>
                                 <input
                                    type="text"
                                    value={editForm.avgPreparationTime}
                                    onChange={(e) => setEditForm(prev => ({...prev, avgPreparationTime: e.target.value}))}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                                    placeholder="ex: 24 - 48 heures"
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-zinc-500">{isRTL ? "سياسة الإرجاع" : "Politique de retour et garantie"}</label>
                                 <textarea
                                    value={editForm.returnPolicy}
                                    onChange={(e) => setEditForm(prev => ({...prev, returnPolicy: e.target.value}))}
                                    rows={3}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                                    placeholder={isRTL ? "أدخل سياسة الإرجاع..." : "Saisissez votre politique..."}
                                 />
                              </div>

                              <div className="pt-4 flex justify-end">
                                 <button
                                    onClick={saveAboutInfo}
                                    disabled={savingAbout}
                                    className="px-8 py-3.5 bg-zinc-950 text-white hover:bg-zinc-800 rounded-xl font-sans font-bold text-[11px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                                 >
                                    {savingAbout ? (isRTL ? "جاري الحفظ..." : "Enregistrement...") : (isRTL ? "حفظ التغييرات" : "Enregistrer les modifications")}
                                 </button>
                              </div>
                           </div>
                        ) : (
                           <div className="space-y-6">
                              {/* Legal Status badge */}
                              {storeInfo.legalStatus && (
                                 <div className="flex gap-4 p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center shrink-0 shadow-sm">
                                       <Building2 className="w-4 h-4 text-zinc-500" />
                                    </div>
                                    <div>
                                       <h4 className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-wider">{d('legalStatus')}</h4>
                                       <p className="text-xs font-sans font-bold text-zinc-800 mt-0.5">{storeInfo.legalStatus}</p>
                                       <p className="text-[11px] text-zinc-400 font-medium mt-1">{t("store_profile.verified_desc", "Vendeur certifié ayant fourni ses documents d'immatriculation officiels.")}</p>
                                    </div>
                                 </div>
                              )}

                              {/* Ship timeline / average prep speed */}
                              {storeInfo.avgPreparationTime && (
                                 <div className="flex gap-4 p-4 rounded-2xl bg-orange-50/20 border border-orange-100/50">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-orange-100/50 flex items-center justify-center shrink-0 shadow-sm">
                                       <Truck className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <div className="flex-1">
                                       <h4 className="text-[10px] font-sans font-bold text-orange-700 uppercase tracking-wider">{d('prepTime')}</h4>
                                       <p className="text-xs font-sans font-bold text-zinc-800 mt-0.5">{storeInfo.avgPreparationTime}</p>
                                       <p className="text-[11px] text-zinc-500 font-semibold mt-1">{t("store_profile.dispatch_desc", "Délai estimé pour confier votre commande à l'agence d'expédition agréée.")}</p>
                                    </div>
                                 </div>
                              )}

                              {/* Returns & Exchange Guarantee Policies */}
                              {storeInfo.returnPolicy && (
                                 <div className="flex gap-4 p-4 rounded-2xl bg-blue-50/20 border border-blue-100/50">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-blue-100/50 flex items-center justify-center shrink-0 shadow-sm">
                                       <Undo2 className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                       <h4 className="text-[10px] font-sans font-bold text-blue-700 uppercase tracking-wider">{d('returnPolicy')}</h4>
                                       <p className="text-xs font-sans font-bold text-zinc-800 leading-relaxed mt-1 italic">
                                          "{storeInfo.returnPolicy}"
                                       </p>
                                       <p className="text-[11px] text-zinc-400 font-medium mt-2">{t("store_profile.guarantee_desc", "La conformité de la marchandise est garantie selon la législation algérienne sur le commerce électronique.")}</p>
                                    </div>
                                 </div>
                              )}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>

      <AnimatePresence>
        {adjustingImage && (
          <ImageAdjusterModal
            src={adjustingImage.src}
            type={adjustingImage.type}
            isRTL={isRTL}
            onClose={() => setAdjustingImage(null)}
            onConfirm={handleSaveAdjustedImage}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
