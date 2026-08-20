/**
 * Utilitaire d'optimisation (FinOps) pour réduire le trafic sortant (Egress)
 */

let isWebpSupportedCached: boolean | null = null;

/**
 * Détecte si le navigateur de l'utilisateur supporte le format moderne WebP de manière synchrone.
 * Utilise l'API Canvas pour une vérification rapide et sûre côté client.
 */
export const checkWebpSupport = (): boolean => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  if (isWebpSupportedCached !== null) {
    return isWebpSupportedCached;
  }
  try {
    const canvas = document.createElement("canvas");
    if (canvas.getContext && canvas.getContext("2d")) {
      isWebpSupportedCached = canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
      return isWebpSupportedCached;
    }
    isWebpSupportedCached = false;
    return false;
  } catch {
    isWebpSupportedCached = false;
    return false;
  }
};

/**
 * Convertit une URL de stockage Firebase JPEG/PNG/GIF en une URL pointant vers sa version WebP.
 */
export const getWebpFirebaseUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  // Ne pas forcer la transformation automatique .jpg/.png vers .webp sur Firebase Storage
  // afin d'éviter les erreurs 404 lorsque le fichier .webp n'existe pas dans le bucket.
  return url;
};

export const getOptimizedImageUrl = (url: string | null | undefined, _width: number = 400): string => {
  if (!url) return "/images/placeholders/product.svg";
  
  // Par défaut, nous laissons les composants comme ProductImage gérer la substitution WebP avec fallback de sécurité
  return url;
};

export const getFallbackSubImage = (name: string): string => {
  if (!name) return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600";
  const normalized = name.toLowerCase().trim();

  // Électroménager / Froid
  if (normalized.includes("réfrigérateur") || normalized.includes("refrigerateur") || normalized.includes("froid") || normalized.includes("congélateur") || normalized.includes("congelateur")) {
    return "https://images.unsplash.com/photo-1571843439991-dd2b8e051966?auto=format&fit=crop&q=80&w=600";
  }
  // Lave-linge
  if (normalized.includes("lave-linge") || normalized.includes("lavage") || normalized.includes("machine à laver") || normalized.includes("machine a laver")) {
    return "https://images.unsplash.com/photo-1610557892470-76d74cd1228d?auto=format&fit=crop&q=80&w=600";
  }
  // Sèche-linge
  if (normalized.includes("sèche-linge") || normalized.includes("seche-linge") || normalized.includes("séchant") || normalized.includes("sechant")) {
    return "https://images.unsplash.com/photo-1610557892470-76d74cd1228d?auto=format&fit=crop&q=80&w=600";
  }
  // TV / Home Cinéma
  if (normalized.includes("téléviseur") || normalized.includes("televiseur") || normalized.includes("télévision") || normalized.includes("television") || normalized.includes("tv") || normalized.includes("cinéma") || normalized.includes("cinema") || normalized.includes("écran") || normalized.includes("ecran")) {
    return "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=600";
  }
  // Climatiseurs
  if (normalized.includes("climatiseur") || normalized.includes("climatisation") || normalized.includes("ventilateur") || normalized.includes("chauffage")) {
    return "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600";
  }
  // Aspirateurs
  if (normalized.includes("aspirateur") || normalized.includes("balai") || normalized.includes("nettoyeur")) {
    return "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=600";
  }
  // Friteuses
  if (normalized.includes("friteuse") || normalized.includes("fryer") || normalized.includes("airfryer")) {
    return "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=600";
  }
  // Cafetières
  if (normalized.includes("cafetière") || normalized.includes("cafetiere") || normalized.includes("café") || normalized.includes("cafe") || normalized.includes("bouilloire") || normalized.includes("grille-pain")) {
    return "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&q=80&w=600";
  }
  // Fours & Micro-ondes
  if (normalized.includes("four") || normalized.includes("cuisson") || normalized.includes("plaque") || normalized.includes("cuisinière") || normalized.includes("cuisiniere") || normalized.includes("micro-onde") || normalized.includes("micro-ondes") || normalized.includes("hotte")) {
    return "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600";
  }
  // Lave-vaisselle
  if (normalized.includes("vaisselle") || normalized.includes("lave-vaisselle") || normalized.includes("lave-vaisselles") || normalized.includes("dishwasher")) {
    return "https://images.unsplash.com/photo-1585837575652-267c0ee1228b?auto=format&fit=crop&q=80&w=600";
  }
  // Mixeurs & Blenders / Préparation
  if (normalized.includes("mixeur") || normalized.includes("blender") || normalized.includes("robot") || normalized.includes("hachoir") || normalized.includes("batteur") || normalized.includes("préparation") || normalized.includes("preparation")) {
    return "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&q=80&w=600";
  }

  // Électronique
  if (normalized.includes("smartphone") || normalized.includes("téléphone") || normalized.includes("telephone") || normalized.includes("iphone") || normalized.includes("android")) {
    return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("ordinateur") || normalized.includes("pc") || normalized.includes("laptop") || normalized.includes("macbook")) {
    return "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("tablette") || normalized.includes("liseuse") || normalized.includes("ipad")) {
    return "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("audio") || normalized.includes("casque") || normalized.includes("écouteur") || normalized.includes("ecouteur") || normalized.includes("speaker") || normalized.includes("enceinte")) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("gaming") || normalized.includes("console") || normalized.includes("playstation") || normalized.includes("xbox") || normalized.includes("nintendo") || normalized.includes("manette")) {
    return "https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("photo") || normalized.includes("vidéo") || normalized.includes("video") || normalized.includes("caméra") || normalized.includes("camera") || normalized.includes("drone")) {
    return "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600";
  }

  // Mode
  if (normalized.includes("femme") || normalized.includes("robe") || normalized.includes("jupe")) {
    return "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("homme") || normalized.includes("chemise") || normalized.includes("costume")) {
    return "https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("enfant") || normalized.includes("bébé") || normalized.includes("bebe") || normalized.includes("fille") || normalized.includes("garçon") || normalized.includes("garcon")) {
    return "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("chaussure") || normalized.includes("basket") || normalized.includes("talons") || normalized.includes("sneaker")) {
    return "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("accessoire") || normalized.includes("bijou") || normalized.includes("sac") || normalized.includes("ceinture") || normalized.includes("chapeau")) {
    return "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600";
  }

  // Maison & Déco
  if (normalized.includes("salon") || normalized.includes("canapé") || normalized.includes("canape") || normalized.includes("fauteuil") || normalized.includes("table basse")) {
    return "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("chambre") || normalized.includes("lit") || normalized.includes("matelas") || normalized.includes("armoire") || normalized.includes("dressing")) {
    return "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("déco") || normalized.includes("deco") || normalized.includes("intérieur") || normalized.includes("interieur") || normalized.includes("vase") || normalized.includes("bougie") || normalized.includes("miroir")) {
    return "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("luminaire") || normalized.includes("éclairage") || normalized.includes("eclairage") || normalized.includes("lampe") || normalized.includes("suspension") || normalized.includes("lustre") || normalized.includes("led")) {
    return "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("table") || normalized.includes("ustensile") || normalized.includes("vaisselle") || normalized.includes("verre") || normalized.includes("assiette")) {
    return "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600";
  }
  if (normalized.includes("jardin") || normalized.includes("terrasse") || normalized.includes("balcon") || normalized.includes("extérieur") || normalized.includes("exterieur") || normalized.includes("barbecue")) {
    return "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=600";
  }

  // Fallback general abstract background patterns
  return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600";
};


