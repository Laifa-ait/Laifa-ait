import { IReviewRepository } from "./review.repository";
import { SubmitReviewData } from "./review.types";

export class ReviewService {
  constructor(private readonly repo: IReviewRepository) {}

  async submitReview(userId: string, userName: string, data: SubmitReviewData): Promise<{ success: boolean }> {
    const { orderId, productId, rating } = data;
    if (!orderId || !productId || rating === undefined) {
      throw new Error("Missing review fields");
    }

    await this.repo.addReview(userId, userName, data);
    return { success: true };
  }

  async reportReview(reviewId: string, reason: string): Promise<{ success: boolean }> {
    if (!reviewId || !reason) throw new Error("ID de l'avis et raison requis");
    await this.repo.reportReview(reviewId, reason);
    return { success: true };
  }

  async approveReview(reviewId: string): Promise<{ success: boolean }> {
    if (!reviewId) throw new Error("ID de l'avis requis");
    await this.repo.approveReview(reviewId);
    return { success: true };
  }

  async replyToReview(reviewId: string, sellerId: string, replyText: string): Promise<{ success: boolean }> {
    if (!reviewId || !replyText) throw new Error("ID de l'avis et texte de réponse requis");
    
    const review = await this.repo.getReview(reviewId);
    if (!review) throw new Error("Avis introuvable");
    
    await this.repo.addReply(reviewId, {
      sellerId,
      text: replyText
    });
    
    return { success: true };
  }
}
