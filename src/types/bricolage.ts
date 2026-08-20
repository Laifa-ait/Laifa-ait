export type ServiceUrgency = 'normal' | 'urgent_24h' | 'emergency';
export type ProjectRequestStatus = 'pending' | 'matched' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface BricolageServiceCategory {
  id: string;
  slug: string;
  name: Record<'fr' | 'ar' | 'en', string>;
  description: Record<'fr' | 'ar' | 'en', string>;
  icon: string;
  popularServices: string[];
  avgPriceRangeDZD: { min: number; max: number };
  badge?: string;
}

export interface VerifiedArtisan {
  id: string;
  name: string;
  fullName?: string;
  specialty: string;
  wilaya: string;
  commune: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  verifiedBadge: boolean;
  avatarUrl?: string;
  phone: string;
  isAvailable24_7: boolean;
  bio?: string;
  yearsExperience?: number;
}

export interface BricolageReview {
  id: string;
  artisanName: string;
  clientName: string;
  wilaya: string;
  serviceName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface QuoteOffer {
  id: string;
  artisanId: string;
  artisanName: string;
  artisanPhone: string;
  artisanRating: number;
  priceDZD: number;
  estimatedDuration: string;
  notes: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface QuoteRequestPayload {
  serviceCategoryId: string;
  serviceName: string;
  wilaya: string;
  commune?: string;
  urgency: ServiceUrgency;
  description: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  preferredDate?: string;
  projectPhotos?: string[];
}

export interface QuoteRequestDoc extends QuoteRequestPayload {
  id: string;
  status: ProjectRequestStatus;
  createdAt: string;
  estimatedPriceDZD: { min: number; max: number };
  offers?: QuoteOffer[];
  acceptedOffer?: QuoteOffer;
  projectPhotos?: string[];
}

export type VerificationDocumentStatus = 'pending' | 'approved' | 'rejected';

export interface ArtisanVerificationDocument {
  id: string;
  docType: 'cni' | 'passport' | 'permis' | 'diploma' | 'certificate' | 'artisan_card' | 'registre_commerce';
  title: string;
  docNumber?: string;
  issuingInstitution?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: string;
  status: VerificationDocumentStatus;
  rejectionReason?: string;
  uploadedAt: string;
}

export interface ArtisanVerificationData {
  status: 'pending_review' | 'verified' | 'rejected' | 'incomplete_docs';
  submittedAt: string;
  reviewedAt?: string;
  reviewedByAdmin?: string;
  adminNotes?: string;
  identityDoc?: ArtisanVerificationDocument;
  diplomaDoc?: ArtisanVerificationDocument;
  registryDoc?: ArtisanVerificationDocument;
}

export interface ActiveArtisanProfile {
  id: string;
  fullName: string;
  specialty: string;
  wilaya: string;
  commune: string;
  phone: string;
  registryNumber?: string;
  yearsOfExperience: number;
  isAvailable24_7: boolean;
  registeredAt: string;
  verifiedBadge: boolean;
  rating: number;
  verificationStatus?: 'pending_review' | 'verified' | 'rejected' | 'incomplete_docs';
  verificationData?: ArtisanVerificationData;
}

export interface ArtisanRegistrationPayload {
  fullName: string;
  specialty: string;
  wilaya: string;
  commune: string;
  phone: string;
  registryNumber?: string;
  yearsOfExperience: number;
  isAvailable24_7: boolean;
  
  // Verification documents
  identityDoc?: {
    type: 'cni' | 'passport' | 'permis';
    number: string;
    fileName?: string;
    fileUrl?: string;
  };
  diplomaDoc?: {
    title: string;
    institution: string;
    fileName?: string;
    fileUrl?: string;
  };
  registryDoc?: {
    number: string;
    camWilaya: string;
    fileName?: string;
    fileUrl?: string;
  };
}

export interface QuoteNotificationAlert {
  id: string;
  type: 'new_quote_received' | 'quote_accepted' | 'new_domain_lead';
  requestId: string;
  title: string;
  message: string;
  timestamp: string;
  priceDZD?: number;
  artisanName?: string;
  read: boolean;
}


export interface BricolageMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'client' | 'artisan';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  attachmentUrl?: string;
  voiceNoteUrl?: string;
  voiceNoteDuration?: string;
  locationPin?: {
    wilaya: string;
    commune: string;
    address: string;
  };
  offerProposal?: {
    id?: string;
    priceDZD: number;
    duration: string;
    notes?: string;
    status?: 'pending' | 'accepted' | 'declined';
  };
}

export interface BricolageConversation {
  id: string;
  requestId: string;
  serviceName: string;
  clientName: string;
  clientPhone: string;
  artisanName: string;
  artisanPhone: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface ArtisanOpportunityDTO {
  id: string;
  serviceCategoryId: string;
  serviceName: string;
  wilaya: string;
  commune?: string;
  urgency: ServiceUrgency;
  description: string;
  projectPhotos?: string[];
  preferredDate?: string;
  estimatedPriceDZD: { min: number; max: number };
  createdAt: string;
  status: ProjectRequestStatus;
  
  customerDisplayName: string;
  offersCount: number;
  hasSubmittedOffer: boolean;
  myOffer?: {
    id?: string;
    priceDZD: number;
    estimatedDuration: string;
    notes?: string;
    createdAt: string;
    status?: string;
  } | null;
}
