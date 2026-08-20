import { useState } from "react";
import toast from "react-hot-toast";
import { User } from "firebase/auth";
import { ProductFormData } from "../../../../types/seller";

export function useProductAiAndTranslate(
  formData: ProductFormData,
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>,
  currentUser: User | null
) {
  const [aiGenerating, setAiGenerating] = useState(false);
  const [translating, setTranslating] = useState(false);

  const handleGenerateAiDescription = async () => {
    if (!formData.name) return toast.error("Entrez un nom de produit d'abord.");
    setAiGenerating(true);
    try {
      const idToken = (await currentUser?.getIdToken()) || "";
      if (!idToken) {
        toast.error("Session expirée, veuillez vous reconnecter");
        return;
      }
      const response = await fetch("/api/v1/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ productName: formData.name, category: formData.category }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textError = await response.text();
        throw new Error(`Erreur serveur (${response.status}): ${textError.substring(0, 100)}`);
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erreur serveur");
      }
      if (data.description) {
        setFormData((prev) => ({ ...prev, description: data.description }));
        toast.success("Description générée avec succès ! ✨");
      }
    } catch (err: unknown) {
      console.error("Gemini AI error:", err);
      const errMsg = err instanceof Error ? err.message : "Erreur lors de la génération IA.";
      toast.error(errMsg);
    } finally {
      setAiGenerating(false);
    }
  };

  return {
    aiGenerating,
    setAiGenerating,
    translating,
    setTranslating,
    handleGenerateAiDescription,
  };
}

