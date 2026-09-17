export type DocumentCategory =
  | 'identity'
  | 'real_estate_legal'
  | 'artisan_qualification'
  | 'seller_registry'
  | 'invoice'
  | 'dispute_evidence'
  | 'general';

export interface UserDocumentDTO {
  id: string;
  userId: string;
  category: DocumentCategory;
  fileName: string;
  fileSize: number;
  mimeType: string;
  downloadUrl: string;
  storagePath: string;
  description?: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserDataConsentPreferences {
  essential: boolean;
  localStorageCache: boolean;
  documentMemory: boolean;
  analyticsPerformance: boolean;
  consentTimestamp: string;
  consentVersion: string;
}

export interface DocumentUploadPayload {
  category: DocumentCategory;
  fileName: string;
  fileSize: number;
  mimeType: string;
  downloadUrl: string;
  storagePath: string;
  description?: string;
}

export interface StorageQuotaEstimate {
  usageBytes: number;
  quotaBytes: number;
  percentUsed: number;
  localStorageBytes: number;
  humanUsage: string;
  humanQuota: string;
}
