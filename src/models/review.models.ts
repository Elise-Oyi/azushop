  // review.models.ts
  export interface Review {
    reviewId: string;
    productId: string;
    userId: string;
    rating: number; // 1-5 stars
    title?: string;
    comment: string;
    isVerified: boolean; // Verified purchase
    helpfulCount: number;
    createdAt: Date;
    updatedAt: Date;
  }
