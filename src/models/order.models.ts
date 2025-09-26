// Order Models

export interface Order {
  id: string;
  orderId: string;
  userId: string;
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  
  // Addresses
  billingAddress: Address;
  shippingAddress?: Address;
  
  // Payment
  paymentMethod: 'paypal' | 'credit_card' | 'bank_transfer';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  
  // Order Status
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  
  // Tracking
  trackingNumber?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date;
}

export interface OrderItem {
  productId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  total: number;
  images?: string[];
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

// For checkout process
export interface CheckoutRequest {
  userId: string;
  items: CheckoutItem[];
  billingAddress: Address;
  shippingAddress?: Address;
  paymentMethod: 'paypal' | 'credit_card' | 'bank_transfer';
}

export interface CheckoutItem {
  productId: string;
  quantity: number;
}

// Order status update request
export interface OrderStatusUpdate {
  orderStatus?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded';
  trackingNumber?: string;
}