export type PropertyType = 'apartment' | 'villa' | 'house' | 'studio' | 'commercial' | 'land' | 'office' | 'room' | 'building';
export type ListingType = 'sale' | 'rent_long' | 'rent_short';
export type PropertyStatus = 'draft' | 'pending' | 'active' | 'paused' | 'rented' | 'sold' | 'archived' | 'rejected';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'completed';

export interface BookingGuests {
  adults: number;
  children: number;
}

export interface BookingShort {
  id: string;
  propertyId: string;
  propertyTitle?: string;
  propertyLocation?: string;
  propertyImage?: string;
  ownerId: string;
  tenantId: string; // guestId
  startDate: string; // ISO YYYY-MM-DD
  endDate: string;   // ISO YYYY-MM-DD
  checkIn?: string;  // Alias for startDate
  checkOut?: string; // Alias for endDate
  guests?: BookingGuests;
  totalNights: number;
  nightlyPrice?: number;
  subtotal?: number;
  cleaningFee?: number;
  serviceFee?: number;
  totalPriceDZD: number;
  currency?: string; // Default "DZD"
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export type PropertyBooking = BookingShort;

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
  cleaningFee?: number;
  serviceFee?: number;
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
  cleaningFee?: number;
  serviceFee?: number;
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
  visitorNotes?: string;
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

export interface PublicOwnerProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: string;
  shopName?: string;
  sellerType?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'action_required' | 'unverified';
  joinedAt?: string;
}

export interface PublicOwnerProfileResponse {
  success: boolean;
  data?: PublicOwnerProfile;
  error?: string;
}

export type ImmoAccountType = 'individual' | 'pro' | 'agency';
export type ProVerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';

export interface ProApplicationData {
  id?: string;
  userId: string;
  accountType: 'pro' | 'agency';
  companyName: string;
  tradeRegisterNumber: string; // N° Registre de Commerce (RC)
  agencyLicenseNumber?: string; // N° Agrément Ministériel pour agence
  taxIdentificationNumber?: string; // NIF / NIS
  contactPhone: string;
  wilaya: string;
  address: string;
  description: string;
  status: ProVerificationStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface ProApplicationResponse {
  success: boolean;
  data?: ProApplicationData | null;
  error?: string;
  message?: string;
}
