import { useState } from "react";
import { db, storage } from "../../lib/firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";
import { DbBanner, compressAndResizeImage } from "./useBannerTypes";

export function useBannerModal(
  banners: DbBanner[],
  fetchData: () => Promise<void>
) {
  const [activeTab, setActiveTab] = useState<"banners" | "tags">("banners");
  const [selectedZone, setSelectedZone] = useState<"carousel_main" | "grid_top" | "grid_bottom" | "sidebar">("carousel_main");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBanner, setEditingBanner] = useState<DbBanner | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [titleColor, setTitleColor] = useState("#FFFFFF");
  const [subtitle, setSubtitle] = useState("");
  const [subtitleColor, setSubtitleColor] = useState("#F3F4F6");
  const [buttonText, setButtonText] = useState("Acheter maintenant");
  const [btnBgColor, setBtnBgColor] = useState("#E11D48");
  const [btnTextColor, setBtnTextColor] = useState("#FFFFFF");
  const [desktopImage, setDesktopImage] = useState("");
  const [mobileImage, setMobileImage] = useState("");
  const [tagId, setTagId] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Product Selection & A/B Testing & Targeting
  const [featuredProducts, setFeaturedProducts] = useState<string[]>([]);
  const [targetUserType, setTargetUserType] = useState<"all" | "new" | "logged_in">("all");
  const [targetRegions, setTargetRegions] = useState<string[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [previewDeviceMode, setPreviewDeviceMode] = useState<"desktop" | "mobile" | "tablet">("desktop");
  const [abGroup, setAbGroup] = useState<"all" | "A" | "B">("all");

  // Interactive Live Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewBannerData, setPreviewBannerData] = useState<DbBanner | null>(null);

  // Upload States
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [uploadProgressDesktop, setUploadProgressDesktop] = useState(0);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const [uploadProgressMobile, setUploadProgressMobile] = useState(0);

  const resetBannerForm = () => {
    setEditingBanner(null);
    setTitle("");
    setTitleColor("#FFFFFF");
    setSubtitle("");
    setSubtitleColor("#F3F4F6");
    setButtonText("Acheter maintenant");
    setBtnBgColor("#E11D48");
    setBtnTextColor("#FFFFFF");
    setDesktopImage("");
    setMobileImage("");
    setTagId("");
    setSortOrder(banners.length + 1);
    setIsActive(true);
    setStartDate("");
    setEndDate("");
    setFeaturedProducts([]);
    setAbGroup("all");
  };

  const handleOpenAddModal = () => {
    resetBannerForm();
    setIsModalOpen(true);
  };

  const handleEditBanner = (banner: DbBanner) => {
    setEditingBanner(banner);
    setTitle(banner.title || "");
    setTitleColor(banner.title_color || "#FFFFFF");
    setSubtitle(banner.subtitle || "");
    setSubtitleColor(banner.subtitle_color || "#F3F4F6");
    setButtonText(banner.button_text || "Acheter maintenant");
    setBtnBgColor(banner.btn_bg_color || "#E11D48");
    setBtnTextColor(banner.btn_text_color || "#FFFFFF");
    setDesktopImage(banner.desktop_image || "");
    setMobileImage(banner.mobile_image || "");
    setTagId(banner.tag_id || "");
    setSortOrder(banner.sort_order || 1);
    setIsActive(banner.is_active !== undefined ? banner.is_active : true);
    setStartDate(banner.start_date || "");
    setEndDate(banner.end_date || "");
    setFeaturedProducts(banner.featured_products || []);
    setAbGroup(banner.ab_group || "all");
    setIsModalOpen(true);
  };

  const handleOpenPreviewModal = (banner: DbBanner) => {
    setPreviewBannerData(banner);
    setIsPreviewModalOpen(true);
  };

  const handleDesktopImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format de fichier non supporté. JPG, PNG et WebP uniquement.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le fichier dépasse la limite maximale de 10 Mo.");
      return;
    }

    setIsUploadingDesktop(true);
    setUploadProgressDesktop(0);

    try {
      toast.loading("Optimisation, redimensionnement et compression...", { id: "upload-desktop-toast" });

      const { blob } = await compressAndResizeImage(file, 1920, 1080);
      const uuid = Math.random().toString(36).substring(2, 15);
      const storageRef = ref(storage, `banners/desktop_${uuid}_${file.name.replace(/\s+/g, "_")}`);

      const finalUrl = await new Promise<string>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, blob);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgressDesktop(Math.round(progress));
          },
          (error) => reject(error),
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            } catch (err) {
              reject(err);
            }
          }
        );
      });      setDesktopImage(finalUrl);
      toast.success("Image Desktop importée et optimisée (1920x1080) ! 📸", { id: "upload-desktop-toast" });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Veuillez réessayer.";
      toast.error(`Erreur d'importation: ${errMsg}`, { id: "upload-desktop-toast" });
      console.error(err);
    } finally {
      setIsUploadingDesktop(false);
    }
  };

  const handleMobileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format de fichier non supporté. JPG, PNG et WebP uniquement.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le fichier dépasse la limite maximale de 10 Mo.");
      return;
    }

    setIsUploadingMobile(true);
    setUploadProgressMobile(0);

    try {
      toast.loading("Optimisation et compression pour mobile...", { id: "upload-mobile-toast" });

      const { blob } = await compressAndResizeImage(file, 1080, 1080);
      const uuid = Math.random().toString(36).substring(2, 15);
      const storageRef = ref(storage, `banners/mobile_${uuid}_${file.name.replace(/\s+/g, "_")}`);

      const finalUrl = await new Promise<string>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, blob);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgressMobile(Math.round(progress));
          },
          (error) => reject(error),
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            } catch (err) {
              reject(err);
            }
          }
        );
      });

      setMobileImage(finalUrl);
      toast.success("Image Mobile importée et optimisée (1080x1080) ! 📱", { id: "upload-mobile-toast" });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Veuillez réessayer.";
      toast.error(`Erreur d'importation: ${errMsg}`, { id: "upload-mobile-toast" });
      console.error(err);
    } finally {
      setIsUploadingMobile(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desktopImage) {
      toast.error("Veuillez sélectionner une image Desktop obligatoire");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title,
      title_color: titleColor,
      subtitle,
      subtitle_color: subtitleColor,
      button_text: buttonText,
      btn_bg_color: btnBgColor,
      btn_text_color: btnTextColor,
      desktop_image: desktopImage,
      mobile_image: mobileImage || null,
      tag_id: tagId,
      sort_order: Number(sortOrder) || 1,
      is_active: Boolean(isActive),
      featured_products: featuredProducts,
      ab_group: abGroup,
      zone: selectedZone,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
    };

    try {
      if (editingBanner) {
        await updateDoc(doc(db, "banners", editingBanner.id), payload);
        toast.success("Bannière mise à jour avec succès");
      } else {
        await addDoc(collection(db, "banners"), {
          ...payload,
          views: 0,
          clicks: 0,
          created_at: new Date().toISOString(),
        });
        toast.success("Bannière créée avec succès");
      }

      setIsModalOpen(false);
      resetBannerForm();
      fetchData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Erreur lors de la sauvegarde de la bannière";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    selectedZone,
    setSelectedZone,
    isModalOpen,
    setIsModalOpen,
    isSubmitting,
    editingBanner,
    title,
    setTitle,
    titleColor,
    setTitleColor,
    subtitle,
    setSubtitle,
    subtitleColor,
    setSubtitleColor,
    buttonText,
    setButtonText,
    btnBgColor,
    setBtnBgColor,
    btnTextColor,
    setBtnTextColor,
    desktopImage,
    setDesktopImage,
    mobileImage,
    setMobileImage,
    tagId,
    setTagId,
    sortOrder,
    setSortOrder,
    isActive,
    setIsActive,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    featuredProducts,
    setFeaturedProducts,
    targetUserType,
    setTargetUserType,
    targetRegions,
    setTargetRegions,
    productSearchTerm,
    setProductSearchTerm,
    previewDeviceMode,
    setPreviewDeviceMode,
    abGroup,
    setAbGroup,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    previewBannerData,
    setPreviewBannerData,
    isUploadingDesktop,
    uploadProgressDesktop,
    isUploadingMobile,
    uploadProgressMobile,
    resetBannerForm,
    handleOpenAddModal,
    handleEditBanner,
    handleOpenPreviewModal,
    handleDesktopImageUpload,
    handleMobileImageUpload,
    handleSaveBanner,
  };
}
