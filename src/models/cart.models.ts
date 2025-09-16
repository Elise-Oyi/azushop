// Cart Model
export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  createdAt?: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number; // Price at time of adding to cart
  addedAt: Date;
}

  // Wishlist Model  
  export interface Wishlist {
    id: string;
    userId: string;
    productIds: string[];
    updatedAt: Date;
  }