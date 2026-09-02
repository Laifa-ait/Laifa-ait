import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Product } from "../../../domains/product/product.types";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-hot-toast";
import { apiGet } from "../../../lib/api";
import { checkStoreFollowStatus, toggleStoreFollow } from "../../../services/storeRepository";
import { PublicStoreInfo } from "../StoreProfile";

export function useStoreProfile() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "fr";
  const isRTL = currentLang === "ar";

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

  const { currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const INITIAL_LIMIT = typeof window !== "undefined" ? (window.innerWidth >= 1024 ? 10 : window.innerWidth >= 768 ? 8 : 6) : 6;
  const LOAD_MORE_LIMIT = 6;
  const [displayLimit, setDisplayLimit] = useState(INITIAL_LIMIT);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);
  const [editForm, setEditForm] = useState({
    shopName: "",
    shopDescription: "",
    wilaya: "",
    legalStatus: "",
    avgPreparationTime: "",
    returnPolicy: ""
  });

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

  const [adjustingImage, setAdjustingImage] = useState<{ file: File; type: "logo" | "banner"; src: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "about">("products");
  const [searchQuery, setSearchQuery] = useState("");
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
        type: "logo",
        src: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
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
        type: "banner",
        src: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveAdjustedImage = async (blob: Blob) => {
    if (!adjustingImage || !sellerId) return;
    const { type } = adjustingImage;
    setAdjustingImage(null);

    const isLogo = type === "logo";
    if (isLogo) {
      setUploadingLogo(true);
    } else {
      setUploadingBanner(true);
    }

    const toastId = toast.loading(isRTL ? "جاري رفع الصورة المعدلة..." : "Envoi de l'image ajustée...");

    try {
      const { ref: storageRef, uploadBytes, getDownloadURL } = await import("firebase/storage");
      const { storage } = await import("../../../lib/firebase");

      const fileExtension = "jpg";
      const fileRef = storageRef(storage, `shops/${sellerId}/${type}_${Date.now()}.${fileExtension}`);
      
      try {
        await uploadBytes(fileRef, blob, { contentType: "image/jpeg" });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        toast.error("Firebase Storage Error: " + errorMsg, { id: toastId });
        return;
      }
      
      const url = await getDownloadURL(fileRef);

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

      setStoreInfo(prev => prev ? ({ ...prev, ...updateData }) : null);
      toast.success(isRTL ? "تم تحديث الصورة بنجاح !" : "Photo mise à jour avec succès !", { id: toastId });
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
    let isSubscribed = true;

    async function loadStore() {
      if (!sellerId) return;
      setLoading(true);

      try {
        const publicProfileData = await apiGet<PublicStoreInfo>(`/api/v1/public-profiles/${sellerId}`);
        
        if (publicProfileData && !publicProfileData.error && isSubscribed) {
          setStoreInfo(publicProfileData);
          setEditForm({
            shopName: publicProfileData.shopName || publicProfileData.displayName || '',
            shopDescription: publicProfileData.shopDescription || publicProfileData.description || '',
            wilaya: publicProfileData.wilaya || '',
            legalStatus: publicProfileData.legalStatus || '',
            avgPreparationTime: publicProfileData.avgPreparationTime || '',
            returnPolicy: publicProfileData.returnPolicy || ''
          });
        } else {
          // Fallback Firestore query
          const shopDocRef = doc(db, 'shops', sellerId);
          const shopDocSnap = await getDoc(shopDocRef);

          if (shopDocSnap.exists() && isSubscribed) {
            const data = shopDocSnap.data() as PublicStoreInfo;
            setStoreInfo({ ...data, id: shopDocSnap.id });
            setEditForm({
              shopName: data.shopName || data.displayName || '',
              shopDescription: data.shopDescription || data.description || '',
              wilaya: data.wilaya || '',
              legalStatus: data.legalStatus || '',
              avgPreparationTime: data.avgPreparationTime || '',
              returnPolicy: data.returnPolicy || ''
            });
          } else {
            const userDocRef = doc(db, 'users', sellerId);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists() && isSubscribed) {
              const data = userDocSnap.data() as PublicStoreInfo;
              setStoreInfo({ ...data, id: userDocSnap.id });
              setEditForm({
                shopName: data.shopName || data.displayName || '',
                shopDescription: data.shopDescription || data.description || '',
                wilaya: data.wilaya || '',
                legalStatus: data.legalStatus || '',
                avgPreparationTime: data.avgPreparationTime || '',
                returnPolicy: data.returnPolicy || ''
              });
            } else if (isSubscribed) {
              setStoreInfo(null);
            }
          }
        }

        // Fetch seller active products
        const productsQuery = query(
          collection(db, 'products'),
          where('sellerId', '==', sellerId),
          where('status', '==', 'active')
        );
        const productsSnap = await getDocs(productsQuery);

        if (isSubscribed) {
          const prods = productsSnap.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          })) as Product[];
          
          setProducts(prods);
          setTotalCount(prods.length);
        }
      } catch (error) {
        console.error("Error loading store profile:", error);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    loadStore();

    return () => {
      isSubscribed = false;
    };
  }, [sellerId]);

  useEffect(() => {
    async function checkFollow() {
      if (!currentUser || !sellerId) return;
      try {
        const following = await checkStoreFollowStatus(sellerId, currentUser.uid);
        setIsFollowing(following);
      } catch (err) {
        console.error("Follow status check error:", err);
      }
    }
    checkFollow();
  }, [currentUser, sellerId]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error(isRTL ? "يرجى تسجيل الدخول لمتابعة هذا البائع." : "Veuillez vous connecter pour suivre ce vendeur.");
      navigate('/login');
      return;
    }

    if (!sellerId) return;

    if (isFollowing) {
      setShowConfirm(true);
      return;
    }

    await executeFollowAction(true);
  };

  const executeFollowAction = async (followState: boolean) => {
    if (!currentUser || !sellerId) return;

    setFollowLoading(true);
    const toastId = toast.loading(
      followState 
        ? (isRTL ? "جاري المتابعة..." : "Abonnement en cours...") 
        : (isRTL ? "جاري إلغاء المتابعة..." : "Désabonnement en cours...")
    );

    try {
      await toggleStoreFollow(sellerId, currentUser.uid, followState);

      setIsFollowing(followState);
      setStoreInfo(prev => {
        if (!prev) return null;
        const currentCount = prev.followersCount || 0;
        return {
          ...prev,
          followersCount: followState ? currentCount + 1 : Math.max(0, currentCount - 1)
        };
      });

      toast.success(
        followState 
          ? (isRTL ? "أنت الآن تتابع هذا البائع !" : "Vous suivez maintenant ce vendeur !") 
          : (isRTL ? "تم إلغاء المتابعة بنجاح." : "Désabonné avec succès."),
        { id: toastId }
      );
    } catch (err) {
      console.error("Toggle follow error:", err);
      toast.error(isRTL ? "حدث خطأ أثناء تنفيذ العملية." : "Échec de l'action de suivi.", { id: toastId });
    } finally {
      setFollowLoading(false);
      setShowConfirm(false);
    }
  };

  const handleSaveAbout = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!sellerId) return;

    setSavingAbout(true);
    const toastId = toast.loading(isRTL ? "جاري حفظ التغييرات..." : "Enregistrement...");

    try {
      const updates = {
        shopName: editForm.shopName,
        shopDescription: editForm.shopDescription,
        wilaya: editForm.wilaya,
        legalStatus: editForm.legalStatus,
        avgPreparationTime: editForm.avgPreparationTime,
        returnPolicy: editForm.returnPolicy,
        displayName: editForm.shopName,
        description: editForm.shopDescription
      };

      try {
        await updateDoc(doc(db, "users", sellerId), updates);
      } catch (err) {
        console.warn("Firestore users update warning:", err);
      }

      try {
        await setDoc(doc(db, "publicProfiles", sellerId), updates, { merge: true });
      } catch (err) {
        console.warn("Firestore publicProfiles error:", err);
      }

      setStoreInfo(prev => prev ? ({ ...prev, ...updates }) : null);
      setIsEditingAbout(false);
      toast.success(isRTL ? "تم تحديث معلومات المتجر بنجاح !" : "Informations de la boutique mises à jour !", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(isRTL ? "حدث خطأ أثناء الحفظ." : "Erreur d'enregistrement.", { id: toastId });
    } finally {
      setSavingAbout(false);
    }
  };

  return {
    sellerId,
    navigate,
    t,
    isRTL,
    d,
    storeInfo,
    products,
    loading,
    currentUser,
    isFollowing,
    followLoading,
    showConfirm,
    setShowConfirm,
    displayLimit,
    setDisplayLimit,
    totalCount,
    LOAD_MORE_LIMIT,
    isEditingAbout,
    setIsEditingAbout,
    savingAbout,
    editForm,
    setEditForm,
    uploadingLogo,
    uploadingBanner,
    isOwner,
    adjustingImage,
    setAdjustingImage,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    handleLogoFileSelect,
    handleBannerFileSelect,
    handleSaveAdjustedImage,
    handleFollowToggle,
    executeFollowAction,
    handleSaveAbout
  };
}
