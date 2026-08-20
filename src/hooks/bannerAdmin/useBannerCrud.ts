import { useState, useEffect, useCallback } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  getDocs,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  limit,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { DbBanner, TagType } from "./useBannerTypes";
import { Product } from "../../domains/product/product.types";

export function useBannerCrud() {
  const [banners, setBanners] = useState<DbBanner[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Tag Fields
  const [tagName, setTagName] = useState("");
  const [tagSlug, setTagSlug] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Banners
      const qBanners = query(collection(db, "banners"), orderBy("sort_order", "asc"));
      const snapBanners = await getDocs(qBanners);
      setBanners(snapBanners.docs.map((d) => ({ id: d.id, ...d.data() }) as DbBanner));

      // 2. Fetch Tags
      const snapTags = await getDocs(query(collection(db, "tags"), limit(300)));
      setTags(snapTags.docs.map((d) => ({ id: d.id, ...d.data() }) as TagType));

      // 3. Fetch all Products for selector
      const qProducts = query(collection(db, "products"), limit(100));
      const snapProducts = await getDocs(qProducts);
      setAllProducts(snapProducts.docs.map((d) => ({ id: d.id, ...d.data() }) as Product));
    } catch (err) {
      console.error(err);
      toast.error("Erreur réseau lors de la récupération des données");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTagNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTagName(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setTagSlug(slug);
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName || !tagSlug) {
      toast.error("Veuillez remplir le nom et le slug du tag");
      return;
    }

    try {
      await addDoc(collection(db, "tags"), { name: tagName, slug: tagSlug });
      toast.success(`Tag "${tagName}" créé !`);
      setTagName("");
      setTagSlug("");
      fetchData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Erreur lors de la création du tag";
      toast.error(errMsg);
    }
  };

  const handleDeleteTag = async (id: string, _name: string) => {
    try {
      await deleteDoc(doc(db, "tags", id));
      toast.success("Tag supprimé avec succès");
      fetchData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Erreur lors de la suppression";
      toast.error(errMsg);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await deleteDoc(doc(db, "banners", id));
      toast.success("Bannière supprimée");
      fetchData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Erreur lors de la suppression";
      toast.error(errMsg);
    }
  };

  return {
    banners,
    setBanners,
    tags,
    setTags,
    allProducts,
    isLoading,
    tagName,
    setTagName,
    tagSlug,
    setTagSlug,
    fetchData,
    handleTagNameChange,
    handleCreateTag,
    handleDeleteTag,
    handleDeleteBanner,
  };
}
