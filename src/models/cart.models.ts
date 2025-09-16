 // Cart Model
  export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
    updatedAt: Date;
  }

    export interface CartItem {
    productId: string;
    quantity: number;
    addedAt: Date;
  }

  // Wishlist Model  
  export interface Wishlist {
    id: string;
    userId: string;
    productIds: string[];
    updatedAt: Date;
  }