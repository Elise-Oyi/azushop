// Category Model

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  productCount?: number; // Number of products in this category
  createdAt?: Date;
  updatedAt: Date;
}