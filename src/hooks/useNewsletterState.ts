import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Product } from "../domains/product/product.types";
import { NewsletterBlock } from "../types/newsletter.types";

export const useNewsletterState = () => {
  const { currentUser } = useAuth();
  const [subject, setSubject] = useState("");
  const [blocks, setBlocks] = useState<NewsletterBlock[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [previewOpen, setPreviewOpen] = useState(false);

  // Media Selector States
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectedBlockIdForImage, setSelectedBlockIdForImage] = useState<string | null>(null);
  const [selectedBlockIdForProduct, setSelectedBlockIdForProduct] = useState<string | null>(null);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaTab, setMediaTab] = useState<"product_catalog" | "stock_banners" | "custom_url" | "file_upload">(
    "product_catalog"
  );
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const addBlock = (type: string) => {
    const newBlock: NewsletterBlock = { id: Math.random().toString(), type, width: "100" };
    if (type === "title") {
      newBlock.content = "Titre de la Newsletter";
    } else if (type === "text") {
      newBlock.content = "Votre texte ici...";
    } else if (type === "image") {
      newBlock.content = "";
      newBlock.linkUrl = "";
      newBlock.align = "center";
      newBlock.aspectRatio = "auto";
      newBlock.rounded = "rounded-2xl";
    } else if (type === "product") {
      newBlock.productId = "";
      newBlock.productName = "";
      newBlock.productPrice = 0;
      newBlock.productImage = "";
      newBlock.productCategory = "";
      newBlock.linkUrl = "";
    } else {
      newBlock.content = "";
    }
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => setBlocks(blocks.filter((b) => b.id !== id));

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const updateBlockProperty = (id: string, property: keyof NewsletterBlock, value: string | number) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, [property]: value } : b)));
  };

  const handleSelectProduct = (prod: Product) => {
    if (selectedBlockIdForProduct) {
      setBlocks(
        blocks.map((b) =>
          b.id === selectedBlockIdForProduct
            ? {
                ...b,
                productId: prod.id,
                content: prod.name,
                productName: prod.name,
                productPrice: prod.price,
                productImage: prod.images?.[0] || "",
                productCategory: prod.category || "",
                linkUrl: `/products/${prod.id}`,
              }
            : b
        )
      );
      setMediaModalOpen(false);
      setSelectedBlockIdForProduct(null);
    }
  };

  useEffect(() => {
    if (mediaModalOpen) {
      const fetchProducts = async () => {
        setProductsLoading(true);
        try {
          const snap = await getDocs(query(collection(db, "products"), limit(45)));
          setProductsList(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as unknown as Product)));
        } catch (err) {
          console.error("Erreur de chargement des produits pour la médiathèque:", err);
        } finally {
          setProductsLoading(false);
        }
      };
      fetchProducts();
    }
  }, [mediaModalOpen]);

  const handleSelectImage = (url: string) => {
    if (selectedBlockIdForImage) {
      updateBlockProperty(selectedBlockIdForImage, "content", url);
      setMediaModalOpen(false);
      setSelectedBlockIdForImage(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image est trop volumineuse (max 5MB).");
      return;
    }

    setIsUploadingImage(true);
    const toastId = toast.loading("Téléchargement de l'image en cours...");
    try {
      const storage = getStorage();
      const fileRef = storageRef(storage, `newsletter-images/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      handleSelectImage(url);
      toast.success("Image ajoutée avec succès.", { id: toastId });
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'image :", error);
      toast.error("Échec du téléchargement.", { id: toastId });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const generateWithAi = async () => {
    if (!aiPrompt || !currentUser) return;
    setGenerating(true);
    try {
      const currentAuthUser = auth.currentUser;
      let idToken = "";
      if (currentAuthUser) {
        idToken = await currentAuthUser.getIdToken();
      }
      const response = await fetch("/api/v1/admin/generate-newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textError = await response.text();
        throw new Error(`Erreur serveur (${response.status}): ${textError.substring(0, 100)}`);
      }

      const data = await response.json();
      if (data.subject) setSubject(data.subject);
      if (data.blocks) {
        const adaptedBlocks = data.blocks.map((b: Partial<NewsletterBlock>) => {
          if (b.type === "image") {
            return {
              width: "100",
              align: "center",
              aspectRatio: "auto",
              rounded: "rounded-2xl",
              linkUrl: "",
              ...b,
            };
          }
          return b;
        });
        setBlocks(adaptedBlocks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!subject.trim() || blocks.length === 0) {
      toast.error("Veuillez ajouter un objet et du contenu avant d'envoyer.");
      return;
    }
    setIsSending(true);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (auth.currentUser) headers["Authorization"] = `Bearer ${await auth.currentUser.getIdToken()}`;
      const res = await fetch("/api/v1/admin/send-newsletter", {
        method: "POST",
        headers,
        body: JSON.stringify({ subject, blocks, settings: {} }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erreur serveur");

      toast.success(data.message || "Campagne envoyée avec succès !", { duration: 4000, icon: "🚀" });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur de connexion.");
    } finally {
      setIsSending(false);
    }
  };

  return {
    subject,
    setSubject,
    blocks,
    aiPrompt,
    setAiPrompt,
    generating,
    isSending,
    view,
    setView,
    previewOpen,
    setPreviewOpen,
    mediaModalOpen,
    setMediaModalOpen,
    setSelectedBlockIdForImage,
    setSelectedBlockIdForProduct,
    productsList,
    productsLoading,
    searchQuery,
    setSearchQuery,
    mediaTab,
    setMediaTab,
    customImageUrl,
    setCustomImageUrl,
    isUploadingImage,
    addBlock,
    removeBlock,
    updateBlock,
    updateBlockProperty,
    handleSelectProduct,
    handleFileUpload,
    handleSelectImage,
    generateWithAi,
    handleSendCampaign,
  };
};
