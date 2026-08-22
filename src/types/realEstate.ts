export type PropertyType = 'apartment' | 'villa' | 'studio' | 'commercial' | 'land';
export type ListingType = 'sale' | 'rent_long' | 'rent_short';
export type PropertyStatus = 'draft' | 'active' | 'rented' | 'sold' | 'archived';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'rejected';

export interface GeoPointLocation {
  lat: number;
  lng: number;
  geohash?: string;
  address: string;
  commune: string;
  wilaya: string;
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number; // DZD
  pricePeriod?: 'night' | 'month' | 'total';
  deposit?: number;
  contactPhone?: string;
  areaSquareMeters: number;
  area?: number;
  rooms: number;
  bathrooms: number;
  features: string[];
  images: string[];
  location: GeoPointLocation;
  status: PropertyStatus;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type RealEstateProperty = Property;

export interface PropertyFormData {
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  pricePeriod: 'night' | 'month' | 'total';
  deposit?: number;
  contactPhone?: string;
  areaSquareMeters: number;
  area?: number;
  rooms: number;
  bathrooms: number;
  floor?: number;
  totalFloors?: number;
  features: string[];
  amenities: string[];
  images: string[];
  location: GeoPointLocation;
  status?: PropertyStatus;
}

export interface BookingShort {
  id: string;
  propertyId: string;
  ownerId: string;
  tenantId: string;
  startDate: string; // ISO YYYY-MM-DD
  endDate: string;   // ISO YYYY-MM-DD
  totalNights: number;
  totalPriceDZD: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyVisit {
  id: string;
  propertyId: string;
  ownerId: string;
  visitorId: string | null;
  visitorName: string;
  visitorPhone: string;
  preferredDate: string; // ISO YYYY-MM-DD
  timeSlot: string;      // e.g. "10:00 - 12:00"
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
}

// API Response DTOs
export interface PropertyMapResult {
  id: string;
  title: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  pricePeriod?: 'night' | 'month' | 'total';
  lat: number;
  lng: number;
  commune: string;
  wilaya: string;
  mainImage: string;
  rooms: number;
  areaSquareMeters: number;
  distanceKm?: number;
}

export type PropertySortOption = 'distance' | 'price_asc' | 'price_desc' | 'recent' | 'popularity';

export interface PropertyResponse {
  success: boolean;
  data?: Property;
  error?: string;
}

export interface PropertyListResponse {
  success: boolean;
  data?: Property[];
  total?: number;
  page?: number;
  limit?: number;
  error?: string;
}

export interface BookingResponse {
  success: boolean;
  data?: BookingShort;
  error?: string;
}

export interface VisitResponse {
  success: boolean;
  data?: PropertyVisit;
  error?: string;
}
