import { useState, useCallback } from "react";
import { doc, getDoc, setDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { DEFAULT_CATEGORIES } from "../../data/categories";
import { Product } from "../../domains/product/product.types";
import toast from "react-hot-toast";

export interface CategoryConfig {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  subCategoryImages: Record<string, string>;
  gradient?: string;
  featuredProductIds: string[];
  updatedAt?: string;
}

export function useHomepageCategories() {
  const [dbCategories, setDbCategories] = useState<Record<string, CategoryConfig>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("Supermarché");
  const [catTitle, setCatTitle] = useState("");
  const [catSubtitle, setCatSubtitle] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catSubImages, setCatSubImages] = useState<Record<string, string>>({});
  const [catFeaturedIds, setCatFeaturedIds] = useState<string[]>([]);

  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const loadCategoryConfigAndProducts = useCallback(async (
    setIsLoading: (loading: boolean) => void
  ) => {
    setIsLoading(true);
    setIsLoadingProducts(true);
    try {
      const docRef = doc(db, "homepage_categories_v2", selectedCategory);
      const docSnap = await getDoc(docRef);

      const defaultForCat = DEFAULT_CATEGORIES[selectedCategory] || { title: "", subtitle: "", image: "", gradient: "" };
      let finalConfig = {
        ...defaultForCat,
        featuredProductIds: [] as string[],
        subCategoryImages: {} as Record<string, string>,
      };

      if (docSnap.exists()) {
        const data = docSnap.data();
        finalConfig = {
          title: data.title || defaultForCat.title,
          subtitle: data.subtitle || defaultForCat.subtitle,
          image: data.image || defaultForCat.image,
          gradient: data.gradient || defaultForCat.gradient,
          featuredProductIds: data.featuredProductIds || [],
          subCategoryImages: data.subCategoryImages || {},
        };
      }

      setCatTitle(finalConfig.title || "");
      setCatSubtitle(finalConfig.subtitle || "");
      setCatImage(finalConfig.image || "");
      setCatSubImages(finalConfig.subCategoryImages || {});
      setCatFeaturedIds(finalConfig.featuredProductIds || []);

      setDbCategories((prev) => ({
        ...prev,
        [selectedCategory]: { id: selectedCategory, ...finalConfig } as CategoryConfig,
      }));

      const pQuery = query(collection(db, "products"), where("category", "==", selectedCategory));
      const pSnap = await getDocs(pQuery);
      const productsLoaded = pSnap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Product));

      setCategoryProducts(productsLoaded);
    } catch (err) {
      console.error(err);
      toast.error("Erreur d'importation de la catégorie");
    } finally {
      setIsLoading(false);
      setIsLoadingProducts(false);
    }
  }, [selectedCategory]);

  const handleSaveCategory = useCallback(async (
    reloadFn: () => void
  ) => {
    setIsSavingCategory(true);
    try {
      const docRef = doc(db, "homepage_categories_v2", selectedCategory);
      await setDoc(
        docRef,
        {
          id: selectedCategory,
          title: catTitle,
          subtitle: catSubtitle,
          image: catImage,
          subCategoryImages: catSubImages,
          gradient: DEFAULT_CATEGORIES[selectedCategory]?.gradient || "from-zinc-950/80 via-zinc-950/20 to-transparent",
          featuredProductIds: catFeaturedIds,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      sessionStorage.removeItem("home_custom_categories");
      toast.success("Catégorie mise à jour avec succès !");
      reloadFn();
    } catch {
      toast.error("Erreur lors de la sauvegarde de la catégorie");
    } finally {
      setIsSavingCategory(false);
    }
  }, [selectedCategory, catTitle, catSubtitle, catImage, catSubImages, catFeaturedIds]);

  const toggleProductFeatured = useCallback((productId: string) => {
    setCatFeaturedIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  }, []);

  return {
    dbCategories,
    setDbCategories,
    selectedCategory,
    setSelectedCategory,
    catTitle,
    setCatTitle,
    catSubtitle,
    setCatSubtitle,
    catImage,
    setCatImage,
    catSubImages,
    setCatSubImages,
    catFeaturedIds,
    setCatFeaturedIds,
    categoryProducts,
    setCategoryProducts,
    searchProductQuery,
    setSearchProductQuery,
    isSavingCategory,
    isLoadingProducts,
    loadCategoryConfigAndProducts,
    handleSaveCategory,
    toggleProductFeatured,
  };
}
