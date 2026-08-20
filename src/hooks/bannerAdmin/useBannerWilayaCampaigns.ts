import { useState, useEffect } from "react";
import { storage } from "../../lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";
import { compressAndResizeImage } from "./useBannerTypes";

export function useBannerWilayaCampaigns(
  electroTitle: string,
  electroSubtitle: string,
  electroImage: string,
  promoLeftTitle: string,
  promoLeftBadge: string,
  promoLeftCtaLink: string,
  promoLeftImage: string,
  promoLeftBgColor: string,
  promoLeftTextColor: string,
  promoRightTitle: string,
  promoRightBadge: string,
  promoRightCtaLink: string,
  promoRightImage: string,
  promoRightBgColor: string,
  promoRightTextColor: string
) {
  interface PromoBanner {
  title?: string;
  badge?: string;
  ctaLink?: string;
  image?: string;
  bgColor?: string;
  textColor?: string;
}

interface WilayaCampaign {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  promoLeft?: PromoBanner;
  promoRight?: PromoBanner;
}

  const [wilayaCampaigns, setWilayaCampaigns] = useState<Record<string, WilayaCampaign>>({});
  const [selectedWilayaToEdit, setSelectedWilayaToEdit] = useState<string>("");
  const [hasWilayaCampaign, setHasWilayaCampaign] = useState(false);
  const [wilayaHeroTitle, setWilayaHeroTitle] = useState("");
  const [wilayaHeroSubtitle, setWilayaHeroSubtitle] = useState("");
  const [wilayaHeroImage, setWilayaHeroImage] = useState("");

  const [wilayaPromoLeftTitle, setWilayaPromoLeftTitle] = useState("");
  const [wilayaPromoLeftBadge, setWilayaPromoLeftBadge] = useState("");
  const [wilayaPromoLeftCtaLink, setWilayaPromoLeftCtaLink] = useState("");
  const [wilayaPromoLeftImage, setWilayaPromoLeftImage] = useState("");
  const [wilayaPromoLeftBgColor, setWilayaPromoLeftBgColor] = useState("#F5F6F8");
  const [wilayaPromoLeftTextColor, setWilayaPromoLeftTextColor] = useState("#111111");

  const [wilayaPromoRightTitle, setWilayaPromoRightTitle] = useState("");
  const [wilayaPromoRightBadge, setWilayaPromoRightBadge] = useState("");
  const [wilayaPromoRightCtaLink, setWilayaPromoRightCtaLink] = useState("");
  const [wilayaPromoRightImage, setWilayaPromoRightImage] = useState("");
  const [wilayaPromoRightBgColor, setWilayaPromoRightBgColor] = useState("#111111");
  const [wilayaPromoRightTextColor, setWilayaPromoRightTextColor] = useState("#FFFFFF");

  const [isUploadingWilayaHero, setIsUploadingWilayaHero] = useState(false);
  const [uploadProgressWilayaHero, setUploadProgressWilayaHero] = useState(0);
  const [isUploadingWilayaPromoLeft, setIsUploadingWilayaPromoLeft] = useState(false);
  const [uploadProgressWilayaPromoLeft, setUploadProgressWilayaPromoLeft] = useState(0);
  const [isUploadingWilayaPromoRight, setIsUploadingWilayaPromoRight] = useState(false);
  const [uploadProgressWilayaPromoRight, setUploadProgressWilayaPromoRight] = useState(0);

  // Sync form inputs when switching the active Wilaya to edit
  useEffect(() => {
    if (!selectedWilayaToEdit) {
      setHasWilayaCampaign(false);
      setWilayaHeroTitle("");
      setWilayaHeroSubtitle("");
      setWilayaHeroImage("");
      setWilayaPromoLeftTitle("");
      setWilayaPromoLeftBadge("");
      setWilayaPromoLeftCtaLink("");
      setWilayaPromoLeftImage("");
      setWilayaPromoLeftBgColor("#F5F6F8");
      setWilayaPromoLeftTextColor("#111111");
      setWilayaPromoRightTitle("");
      setWilayaPromoRightBadge("");
      setWilayaPromoRightCtaLink("");
      setWilayaPromoRightImage("");
      setWilayaPromoRightBgColor("#111111");
      setWilayaPromoRightTextColor("#FFFFFF");
      return;
    }

    const campaign = wilayaCampaigns[selectedWilayaToEdit];
    if (campaign) {
      setHasWilayaCampaign(true);
      setWilayaHeroTitle(campaign.heroTitle || "");
      setWilayaHeroSubtitle(campaign.heroSubtitle || "");
      setWilayaHeroImage(campaign.heroImage || "");

      setWilayaPromoLeftTitle(campaign.promoLeft?.title || "");
      setWilayaPromoLeftBadge(campaign.promoLeft?.badge || "");
      setWilayaPromoLeftCtaLink(campaign.promoLeft?.ctaLink || "");
      setWilayaPromoLeftImage(campaign.promoLeft?.image || "");
      setWilayaPromoLeftBgColor(campaign.promoLeft?.bgColor || "#F5F6F8");
      setWilayaPromoLeftTextColor(campaign.promoLeft?.textColor || "#111111");

      setWilayaPromoRightTitle(campaign.promoRight?.title || "");
      setWilayaPromoRightBadge(campaign.promoRight?.badge || "");
      setWilayaPromoRightCtaLink(campaign.promoRight?.ctaLink || "");
      setWilayaPromoRightImage(campaign.promoRight?.image || "");
      setWilayaPromoRightBgColor(campaign.promoRight?.bgColor || "#111111");
      setWilayaPromoRightTextColor(campaign.promoRight?.textColor || "#FFFFFF");
    } else {
      setHasWilayaCampaign(false);
      setWilayaHeroTitle(electroTitle || "Tout pour la maison,");
      setWilayaHeroSubtitle(electroSubtitle || "rien que le meilleur.");
      setWilayaHeroImage(electroImage || "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=1600");

      setWilayaPromoLeftTitle(promoLeftTitle || "Jusqu'à -40% sur une sélection d'appareils");
      setWilayaPromoLeftBadge(promoLeftBadge || "OFFRE LIMITÉE");
      setWilayaPromoLeftCtaLink(promoLeftCtaLink || "/shop?category=Électroménager&promo=true");
      setWilayaPromoLeftImage(promoLeftImage || "https://images.unsplash.com/photo-1594222644265-5c1eb4856f70?auto=format&fit=crop&q=80&w=400");
      setWilayaPromoLeftBgColor(promoLeftBgColor || "#F5F6F8");
      setWilayaPromoLeftTextColor(promoLeftTextColor || "#111111");

      setWilayaPromoRightTitle(promoRightTitle || "Offres spéciales Week-end");
      setWilayaPromoRightBadge(promoRightBadge || "OFFRE DU WEEK-END");
      setWilayaPromoRightCtaLink(promoRightCtaLink || "/shop?category=Électroménager&sort=bestselling");
      setWilayaPromoRightImage(promoRightImage || "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=400");
      setWilayaPromoRightBgColor(promoRightBgColor || "#111111");
      setWilayaPromoRightTextColor(promoRightTextColor || "#FFFFFF");
    }
  }, [
    selectedWilayaToEdit,
    wilayaCampaigns,
    electroTitle,
    electroSubtitle,
    electroImage,
    promoLeftTitle,
    promoLeftBadge,
    promoLeftCtaLink,
    promoLeftImage,
    promoLeftBgColor,
    promoLeftTextColor,
    promoRightTitle,
    promoRightBadge,
    promoRightCtaLink,
    promoRightImage,
    promoRightBgColor,
    promoRightTextColor,
  ]);

  const handleWilayaHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingWilayaHero(true);
    setUploadProgressWilayaHero(0);

    try {
      toast.loading("Optimisation de l'image Hero régionale...", { id: "upload-wilaya-hero" });
      const { blob } = await compressAndResizeImage(file, 1600, 1000);
      const uuid = Math.random().toString(36).substring(2, 15);
      const storageRef = ref(storage, `banners/wilaya_hero_${uuid}_${file.name.replace(/\s+/g, "_")}`);

      const finalUrl = await new Promise<string>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, blob);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgressWilayaHero(Math.round(progress));
          },
          (error) => reject(error),
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            } catch (err) {
              reject(err instanceof Error ? err : new Error(String(err)));
            }
          }
        );
      });

      setWilayaHeroImage(finalUrl);
      toast.success("Image Hero régionale enregistrée !", { id: "upload-wilaya-hero" });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Veuillez réessayer.";
      toast.error(`Erreur d'importation: ${errMsg}`, { id: "upload-wilaya-hero" });
    } finally {
      setIsUploadingWilayaHero(false);
    }
  };

  const handleWilayaPromoLeftImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingWilayaPromoLeft(true);
    setUploadProgressWilayaPromoLeft(0);

    try {
      toast.loading("Optimisation Promo Gauche régionale...", { id: "upload-wilaya-promo-left" });
      const { blob } = await compressAndResizeImage(file, 800, 800);
      const uuid = Math.random().toString(36).substring(2, 15);
      const storageRef = ref(storage, `banners/wilaya_left_${uuid}_${file.name.replace(/\s+/g, "_")}`);

      const finalUrl = await new Promise<string>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, blob);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgressWilayaPromoLeft(Math.round(progress));
          },
          (error) => reject(error),
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            } catch (err) {
              reject(err instanceof Error ? err : new Error(String(err)));
            }
          }
        );
      });

      setWilayaPromoLeftImage(finalUrl);
      toast.success("Image Promo Gauche régionale enregistrée !", { id: "upload-wilaya-promo-left" });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Veuillez réessayer.";
      toast.error(`Erreur d'importation: ${errMsg}`, { id: "upload-wilaya-promo-left" });
    } finally {
      setIsUploadingWilayaPromoLeft(false);
    }
  };

  const handleWilayaPromoRightImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingWilayaPromoRight(true);
    setUploadProgressWilayaPromoRight(0);

    try {
      toast.loading("Optimisation Promo Droite régionale...", { id: "upload-wilaya-promo-right" });
      const { blob } = await compressAndResizeImage(file, 800, 800);
      const uuid = Math.random().toString(36).substring(2, 15);
      const storageRef = ref(storage, `banners/wilaya_right_${uuid}_${file.name.replace(/\s+/g, "_")}`);

      const finalUrl = await new Promise<string>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, blob);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgressWilayaPromoRight(Math.round(progress));
          },
          (error) => reject(error),
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            } catch (err) {
              reject(err instanceof Error ? err : new Error(String(err)));
            }
          }
        );
      });

      setWilayaPromoRightImage(finalUrl);
      toast.success("Image Promo Droite régionale enregistrée !", { id: "upload-wilaya-promo-right" });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Veuillez réessayer.";
      toast.error(`Erreur d'importation: ${errMsg}`, { id: "upload-wilaya-promo-right" });
    } finally {
      setIsUploadingWilayaPromoRight(false);
    }
  };

  return {
    wilayaCampaigns,
    setWilayaCampaigns,
    selectedWilayaToEdit,
    setSelectedWilayaToEdit,
    hasWilayaCampaign,
    setHasWilayaCampaign,
    wilayaHeroTitle,
    setWilayaHeroTitle,
    wilayaHeroSubtitle,
    setWilayaHeroSubtitle,
    wilayaHeroImage,
    setWilayaHeroImage,
    wilayaPromoLeftTitle,
    setWilayaPromoLeftTitle,
    wilayaPromoLeftBadge,
    setWilayaPromoLeftBadge,
    wilayaPromoLeftCtaLink,
    setWilayaPromoLeftCtaLink,
    wilayaPromoLeftImage,
    setWilayaPromoLeftImage,
    wilayaPromoLeftBgColor,
    setWilayaPromoLeftBgColor,
    wilayaPromoLeftTextColor,
    setWilayaPromoLeftTextColor,
    wilayaPromoRightTitle,
    setWilayaPromoRightTitle,
    wilayaPromoRightBadge,
    setWilayaPromoRightBadge,
    wilayaPromoRightCtaLink,
    setWilayaPromoRightCtaLink,
    wilayaPromoRightImage,
    setWilayaPromoRightImage,
    wilayaPromoRightBgColor,
    setWilayaPromoRightBgColor,
    wilayaPromoRightTextColor,
    setWilayaPromoRightTextColor,
    isUploadingWilayaHero,
    uploadProgressWilayaHero,
    isUploadingWilayaPromoLeft,
    uploadProgressWilayaPromoLeft,
    isUploadingWilayaPromoRight,
    uploadProgressWilayaPromoRight,
    handleWilayaHeroImageUpload,
    handleWilayaPromoLeftImageUpload,
    handleWilayaPromoRightImageUpload,
  };
}
