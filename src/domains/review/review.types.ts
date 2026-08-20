import { admin } from "../../config/firebase-admin";

export interface ReviewDocument {
  id?: string;
  orderId: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images: string[];
  status: "pending" | "approved" | "published" | "flagged" | "replied";
  flags: number;
  lastReportedReason?: string;
  lastReportedAt?: admin.firestore.FieldValue | string | Date;
  createdAt?: admin.firestore.FieldValue | string | Date;
  replies?: Array<{
    sellerId: string;
    text: string;
    createdAt: string;
  }>;
}

export interface ProductStats {
  reviewCount: number;
  totalReviews: number;
  averageRating: number;
  totalRatingSum: number;
  lastReviewAt?: admin.firestore.FieldValue;
}

export interface SubmitReviewData {
  orderId: string;
  productId: string;
  rating: number;
  comment?: string;
  images?: string[];
}
