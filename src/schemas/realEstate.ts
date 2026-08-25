import { z } from 'zod';

export const PropertyTypeEnum = z.enum(['apartment', 'villa', 'house', 'studio', 'commercial', 'land', 'office', 'room', 'building']);
export const ListingTypeEnum = z.enum(['sale', 'rent_long', 'rent_short']);
export const PropertyStatusEnum = z.enum(['draft', 'pending', 'active', 'paused', 'rented', 'sold', 'archived', 'rejected']);
export const PricePeriodEnum = z.enum(['night', 'month', 'total']);
export const VisitStatusEnum = z.enum(['pending', 'accepted', 'declined', 'completed']);
export const BookingStatusEnum = z.enum(['pending', 'confirmed', 'cancelled', 'rejected', 'completed']);

export const GeoPointLocationSchema = z.object({
  lat: z.number().min(-90, "Latitude invalide").max(90, "Latitude invalide"),
  lng: z.number().min(-180, "Longitude invalide").max(180, "Longitude invalide"),
  geohash: z.string().optional().default(''),
  address: z.string().min(3, "L'adresse doit contenir au moins 3 caractères").max(200, "Adresse trop longue"),
  commune: z.string().min(2, "La commune est requise").max(100),
  wilaya: z.string().min(2, "La wilaya est requise").max(100),
});

export const PropertyCreateSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères").max(150, "Titre trop long").transform(s => s.trim()),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères").max(3000, "Description trop longue").transform(s => s.trim()),
  propertyType: PropertyTypeEnum,
  listingType: ListingTypeEnum,
  price: z.number().positive("Le prix doit être un nombre positif (DZD)"),
  pricePeriod: PricePeriodEnum.optional(),
  cleaningFee: z.number().min(0, "Les frais de ménage ne peuvent pas être négatifs").optional().default(0),
  serviceFee: z.number().min(0, "Les frais de service ne peuvent pas être négatifs").optional().default(0),
  areaSquareMeters: z.number().positive("La superficie doit être supérieure à 0 m²"),
  rooms: z.number().int().min(0, "Le nombre de pièces ne peut être négatif").max(100),
  bathrooms: z.number().int().min(0, "Le nombre de salles de bain ne peut être négatif").max(50),
  features: z.array(z.string().min(1)).max(50).optional().default([]),
  images: z.array(z.string().url("URL d'image invalide")).min(1, "Au moins une image est requise").max(30),
  location: GeoPointLocationSchema,
  status: PropertyStatusEnum.optional().default('active'),
});

export const PropertyUpdateSchema = PropertyCreateSchema.partial().omit({
  status: true, // Status updates should use specific status endpoint or restricted schema if needed
}).extend({
  status: PropertyStatusEnum.optional(),
});

export const PropertySortOptionEnum = z.enum([
  'distance',
  'price_asc',
  'price_desc',
  'recent',
  'popularity',
]);

export const PropertySearchQuerySchema = z.object({
  propertyType: PropertyTypeEnum.optional(),
  listingType: ListingTypeEnum.optional(),
  wilaya: z.string().optional(),
  commune: z.string().optional(),
  minPrice: z.coerce.number().min(0, 'Le prix minimum ne peut être négatif').optional(),
  maxPrice: z.coerce.number().positive('Le prix maximum doit être supérieur à 0').optional(),
  minRooms: z.coerce.number().min(0).optional(),
  minArea: z.coerce.number().min(0).optional(),
  status: PropertyStatusEnum.optional().default('active'),
  // Geospatial Search
  lat: z.coerce.number().min(-90, 'Latitude invalide').max(90, 'Latitude invalide').optional(),
  lng: z.coerce.number().min(-180, 'Longitude invalide').max(180, 'Longitude invalide').optional(),
  radius: z.coerce.number().min(0.1, 'Le rayon doit être d\'au moins 0.1km').max(500, 'Rayon maximum 500km').optional().default(50),
  bbox: z.string().optional(), // Format "minLng,minLat,maxLng,maxLat"
  sort: PropertySortOptionEnum.optional().default('recent'),
  map: z.coerce.boolean().optional().default(false),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(20),
}).superRefine((data, ctx) => {
  if (data.minPrice !== undefined && data.maxPrice !== undefined && data.minPrice > data.maxPrice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Le prix minimum ne peut pas dépasser le prix maximum',
      path: ['minPrice'],
    });
  }
  if (data.bbox) {
    const parts = data.bbox.split(',').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Format de bounding box invalide (attendu: minLng,minLat,maxLng,maxLat)',
        path: ['bbox'],
      });
    } else {
      const [minLng, minLat, maxLng, maxLat] = parts;
      if (minLat < -90 || maxLat > 90 || minLat > maxLat || minLng < -180 || maxLng > 180 || minLng > maxLng) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Coordonnées de bounding box hors limites',
          path: ['bbox'],
        });
      }
    }
  }
});

export const BookingGuestsSchema = z.object({
  adults: z.number().int().min(1, "Au moins 1 adulte requis").max(30, "Nombre maximum d'adultes dépassé").default(1),
  children: z.number().int().min(0).max(30, "Nombre maximum d'enfants dépassé").default(0),
});

export const BookingCreateSchema = z.object({
  propertyId: z.string().min(1, "L'identifiant de la propriété est requis"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date de début invalide (AAAA-MM-JJ)"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date de fin invalide (AAAA-MM-JJ)"),
  guests: BookingGuestsSchema.optional().default({ adults: 1, children: 0 }),
}).superRefine((data, ctx) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  if (isNaN(start.getTime())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date de début invalide", path: ["startDate"] });
  }
  if (isNaN(end.getTime())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date de fin invalide", path: ["endDate"] });
  }
  if (start >= end) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La date de fin doit être postérieure à la date de début", path: ["endDate"] });
  }
});

export const BookingStatusUpdateSchema = z.object({
  status: BookingStatusEnum,
});

export const PropertyVisitCreateSchema = z.object({
  propertyId: z.string().min(1, "L'identifiant de la propriété est requis"),
  visitorName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  visitorPhone: z.string().min(8, "Numéro de téléphone invalide").max(20),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (AAAA-MM-JJ)"),
  timeSlot: z.string().min(3, "Créneau horaire invalide").max(50),
});

export const PropertyVisitUpdateStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'declined', 'cancelled']),
});
