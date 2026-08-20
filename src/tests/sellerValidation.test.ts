import { describe, it, expect } from 'vitest';
import { onboardingSchema } from '../utils/validation';
import { ALGERIA_WILAYAS } from '../constants';
import { hasExternalChannel } from '../utils/masking';
import { sanitizeXSS } from '../utils/sanitization';

describe('Seller Onboarding and KYC Document Validation', () => {
  describe('Onboarding Profile Validation', () => {
    it('should validate a correct seller profile on Algerian standard format', () => {
      const validSeller = {
        name: 'Mourad Informatique',
        phone: '0555987654', // Ooredoo
        wilaya: '16 Alger',
        address: 'Bordj El Kiffan, Alger',
        role: 'seller',
        interests: []
      };
      
      const result = onboardingSchema.safeParse(validSeller);
      expect(result.success).toBe(true);
    });

    it('should reject invalid Algerian phone number prefixes', () => {
      const invalidSeller = {
        name: 'Mourad Tech',
        phone: '021123456', // Landline format not allowed for mobile SMS auth
        wilaya: '31 Oran',
        address: 'Place d Armes, Oran',
        role: 'seller'
      };
      
      const result = onboardingSchema.safeParse(invalidSeller);
      expect(result.success).toBe(false);
    });

    it('should reject a wilaya that is not in the 58 official wilayas list', () => {
      const invalidSeller = {
        name: 'Tizi Craft',
        phone: '0770123456', // Djezzy
        wilaya: '99 Marseille', // Invalid Wilaya
        address: 'Rue de la gare',
        role: 'seller'
      };
      
      const result = onboardingSchema.safeParse(invalidSeller);
      expect(result.success).toBe(false);
    });
  });

  describe('Algerian Legal Identifiers (RC, NIF, RIB/CCP)', () => {
    // Standard formats in Algeria:
    // RC (Registre de Commerce): standard string representing the commercial register number
    // NIF (Numéro d'Identification Fiscal): usually 15 digits
    // RIB: 20 digits
    const validateAlgerianLegalIdentifiers = (data: { rcNumber?: string; nifNumber?: string; rib?: string }) => {
      const rcRegex = /^[0-9a-zA-Z\s/-]{5,30}$/;
      const nifRegex = /^\d{15}$/;
      const ribRegex = /^\d{20}$/;

      const errors: string[] = [];
      if (data.rcNumber && !rcRegex.test(data.rcNumber)) {
        errors.push("Format du Registre de Commerce invalide.");
      }
      if (data.nifNumber && !nifRegex.test(data.nifNumber)) {
        errors.push("Le NIF doit être composé d'exactement 15 chiffres.");
      }
      if (data.rib && !ribRegex.test(data.rib)) {
        errors.push("Le RIB doit contenir exactement 20 chiffres.");
      }
      return { success: errors.length === 0, errors };
    };

    it('should validate standard Algerian legal formats', () => {
      const validLegal = {
        rcNumber: '16/00-1234567B18',
        nifNumber: '123456789012345',
        rib: '00799999000000123456'
      };
      const result = validateAlgerianLegalIdentifiers(validLegal);
      expect(result.success).toBe(true);
    });

    it('should reject bad NIF numbers (less than 15 digits)', () => {
      const invalidNif = {
        nifNumber: '123456'
      };
      const result = validateAlgerianLegalIdentifiers(invalidNif);
      expect(result.success).toBe(false);
      expect(result.errors).toContain("Le NIF doit être composé d'exactement 15 chiffres.");
    });

    it('should reject bad RIB formats (non-digits or incorrect length)', () => {
      const invalidRib = {
        rib: '007CCP12345'
      };
      const result = validateAlgerianLegalIdentifiers(invalidRib);
      expect(result.success).toBe(false);
      expect(result.errors).toContain("Le RIB doit contenir exactement 20 chiffres.");
    });
  });

  describe('KYC File Upload Constraints', () => {
    const ALLOWED_KYC_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
    const MAX_KYC_SIZE = 10 * 1024 * 1024; // 10MB

    const validateKYCDocumentFile = (file: { type: string; size: number }) => {
      if (!ALLOWED_KYC_TYPES.includes(file.type)) {
        return { success: false, error: "Format PDF, JPG ou PNG uniquement." };
      }
      if (file.size > MAX_KYC_SIZE) {
        return { success: false, error: "Fichier trop volumineux (max 10MB)." };
      }
      return { success: true };
    };

    it('should accept valid PDF/JPEG under 10MB', () => {
      const validPDF = { type: 'application/pdf', size: 2 * 1024 * 1024 };
      const validPNG = { type: 'image/png', size: 8 * 1024 * 1024 };

      expect(validateKYCDocumentFile(validPDF).success).toBe(true);
      expect(validateKYCDocumentFile(validPNG).success).toBe(true);
    });

    it('should reject unallowed file formats (like docx or zip)', () => {
      const invalidDocx = { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 1 * 1024 * 1024 };
      const result = validateKYCDocumentFile(invalidDocx);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Format PDF, JPG ou PNG uniquement.");
    });

    it('should reject files exceeding the 10MB limit', () => {
      const tooLargePDF = { type: 'application/pdf', size: 12 * 1024 * 1024 };
      const result = validateKYCDocumentFile(tooLargePDF);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Fichier trop volumineux (max 10MB).");
    });
  });
});

describe('Seller Localized Product Sheet (Fiche Produit) Validation', () => {
  const validateProductData = (product: {
    name: string;
    category: string;
    subcategory: string;
    price: number;
    promoPrice?: number;
    wilaya: string;
    description: string;
  }) => {
    const errors: string[] = [];

    if (!product.name || product.name.trim().length < 2) {
      errors.push("Le nom du produit est requis (min 2 caractères).");
    }
    if (!product.category || product.category.trim() === '') {
      errors.push("La catégorie est obligatoire.");
    }
    if (!product.subcategory || product.subcategory.trim() === '') {
      errors.push("La sous-catégorie est obligatoire.");
    }
    if (product.price < 0) {
      errors.push("Le prix du produit ne peut pas être négatif.");
    }
    if (product.promoPrice !== undefined && product.promoPrice >= product.price) {
      errors.push("Le prix promotionnel doit être strictement inférieur au prix d'origine.");
    }
    if (!ALGERIA_WILAYAS.includes(product.wilaya)) {
      errors.push("Wilaya de provenance invalide.");
    }
    if (hasExternalChannel(product.name) || hasExternalChannel(product.description)) {
      errors.push("Les coordonnées externes (téléphone, liens, réseaux) sont strictement interdites.");
    }

    return {
      success: errors.length === 0,
      errors,
      sanitizedDescription: sanitizeXSS(product.description)
    };
  };

  it('should validate a correct product fiche', () => {
    const validProduct = {
      name: 'Karakou Algérois Traditionnel',
      category: 'Mode',
      subcategory: 'Femme',
      price: 35000,
      promoPrice: 29900,
      wilaya: '16 Alger',
      description: 'Magnifique Karakou brodé à la main en fil d\'or traditionnel de haute qualité.'
    };

    const result = validateProductData(validProduct);
    expect(result.success).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should reject a negative price', () => {
    const badProduct = {
      name: 'Bendir Chaoui',
      category: 'Instruments',
      subcategory: 'Percussion',
      price: -500,
      wilaya: '05 Batna',
      description: 'Bendir artisanal traditionnel de la région de Batna.'
    };

    const result = validateProductData(badProduct);
    expect(result.success).toBe(false);
    expect(result.errors).toContain("Le prix du produit ne peut pas être négatif.");
  });

  it('should reject a promotion price that is equal or higher than the original price', () => {
    const badPromo = {
      name: 'Miel de Sidr El M gher',
      category: 'Alimentation',
      subcategory: 'Épicerie',
      price: 8000,
      promoPrice: 8500, // Invalid promotion
      wilaya: '49 El M\'Ghair',
      description: 'Miel de Sidr pur et naturel.'
    };

    const result = validateProductData(badPromo);
    expect(result.success).toBe(false);
    expect(result.errors).toContain("Le prix promotionnel doit être strictement inférieur au prix d'origine.");
  });

  it('should block off-platform phone numbers inside description and name', () => {
    const illegalDealProduct = {
      name: 'Contactez-moi au 0661223344 pour achat direct',
      category: 'High-Tech',
      subcategory: 'Téléphones',
      price: 45000,
      wilaya: '31 Oran',
      description: 'Produit en parfait état, appelez-moi directement sur WhatsApp, pas de paiement sur le site.'
    };

    const result = validateProductData(illegalDealProduct);
    expect(result.success).toBe(false);
    expect(result.errors).toContain("Les coordonnées externes (téléphone, liens, réseaux) sont strictement interdites.");
  });

  it('should safely sanitize description field from malicious script tags', () => {
    const unsafeProduct = {
      name: 'Robots ménagers modernes',
      category: 'Électroménager',
      subcategory: 'Cuisine',
      price: 15000,
      wilaya: '19 Sétif',
      description: '<script>alert("hack")</script><p>Description saine du robot.</p>'
    };

    const result = validateProductData(unsafeProduct);
    expect(result.success).toBe(true); // description can be sanitized without failing the submission
    expect(result.sanitizedDescription).toBe('<p>Description saine du robot.</p>');
  });
});
