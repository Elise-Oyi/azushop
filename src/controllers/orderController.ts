import type { Request, Response, NextFunction } from "express";
import { FirestoreRepo } from "../repo/firestore.repo.ts";
import { type Order, type CheckoutRequest, type OrderStatusUpdate, type OrderItem, type CheckoutItem } from "../models/order.models.ts";
import { type Cart } from "../models/cart.models.ts";
import { type Product } from "../models/product.models.ts";
import Collection from "../config/collections.ts";
import { v4 as uuidv4 } from 'uuid';

const orderService = new FirestoreRepo<Order>(Collection.azushopOrder);
const cartService = new FirestoreRepo<Cart>(Collection.azushopCart);
const productService = new FirestoreRepo<Product>(Collection.azushopProduct);

// Create order from checkout
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const checkoutData: CheckoutRequest = req.body;
        const { userId, items, billingAddress, shippingAddress, paymentMethod } = checkoutData;

        if (!userId || !items || items.length === 0 || !billingAddress || !paymentMethod) {
            return res.error('Missing required checkout information', 400);
        }

        // Fetch product details and validate stock
        const orderItems: OrderItem[] = [];
        let subtotal = 0;

        for (const item of items) {
            const product = await productService.getById(item.productId);
            if (!product) {
                return res.error(`Product ${item.productId} not found`, 404);
            }
            if (!product.isActive) {
                return res.error(`Product ${product.name} is not available`, 400);
            }
            if (product.stock < item.quantity) {
                return res.error(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400);
            }

            // Create order item with current product data
            const itemTotal = product.price * item.quantity;
            const orderItem: OrderItem = {
                productId: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                quantity: item.quantity,
                total: itemTotal,
                images: product.images || [],
            };

            orderItems.push(orderItem);
            subtotal += itemTotal;
        }
        const shipping = calculateShipping(subtotal, billingAddress.country);
        const tax = calculateTax(subtotal, billingAddress.country);
        const total = subtotal + shipping + tax;

        // Generate order ID
        const orderId = generateOrderId();

        // Create order
        const orderData = {
            orderId,
            userId,
            items: orderItems,
            subtotal: Math.round(subtotal * 100) / 100,
            shipping: Math.round(shipping * 100) / 100,
            tax: Math.round(tax * 100) / 100,
            total: Math.round(total * 100) / 100,
            billingAddress,
            shippingAddress: shippingAddress || billingAddress,
            paymentMethod,
            paymentStatus: 'pending' as const,
            orderStatus: 'pending' as const,
            updatedAt: new Date(),
        };

        const order = await orderService.create(orderData) as Order & { id: string };

        // Update product stock
        for (const item of orderItems) {
            const product = await productService.getById(item.productId);
            if (product) {
                await productService.update(item.productId, {
                    stock: product.stock - item.quantity
                });
            }
        }

        // Clear user's cart after successful order
        try {
            const cart = await cartService.getByField('userId', userId);
            if (cart) {
                await cartService.update(cart.id, {
                    items: [],
                    totalAmount: 0,
                    itemCount: 0,
                    updatedAt: new Date(),
                });
            }
        } catch (error) {
            console.log('Note: Could not clear cart after order creation');
        }

        res.success('Order created successfully', {
            id: order.id,
            orderId: order.orderId,
            total: order.total,
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus,
        });
    } catch (error) {
        next(error);
    }
};

// Get user's orders
export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { limit = 10, status } = req.query;

        if (!userId) {
            return res.error('User ID is required', 400);
        }

        let orders = await orderService.findManyByField('userId', userId);

        // Filter by status if provided
        if (status && typeof status === 'string') {
            orders = orders.filter(order => order.orderStatus === status);
        }

        // Sort by creation date (newest first)
        orders.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

        // Apply limit
        if (limit) {
            orders = orders.slice(0, Number(limit));
        }

        // Format for frontend
        const formattedOrders = orders.map(order => ({
            id: order.id,
            orderId: order.orderId,
            date: order.createdAt,
            total: order.total,
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus,
            itemCount: order.items.length,
            firstItemImage: order.items[0]?.images?.[0] || null,
        }));

        res.success('Orders retrieved successfully', formattedOrders);
    } catch (error) {
        next(error);
    }
};

// Get order details
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.error('Order ID is required', 400);
        }

        const order = await orderService.getById(id);
        if (!order) {
            return res.error('Order not found', 404);
        }

        res.success('Order retrieved successfully', order);
    } catch (error) {
        next(error);
    }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updateData: OrderStatusUpdate = req.body;

        if (!id) {
            return res.error('Order ID is required', 400);
        }

        const existingOrder = await orderService.getById(id);
        if (!existingOrder) {
            return res.error('Order not found', 404);
        }

        const updatedFields: any = {
            updatedAt: new Date(),
        };

        if (updateData.orderStatus) {
            updatedFields.orderStatus = updateData.orderStatus;
            
            // Set delivered timestamp
            if (updateData.orderStatus === 'delivered') {
                updatedFields.deliveredAt = new Date();
            }
        }

        if (updateData.paymentStatus) {
            updatedFields.paymentStatus = updateData.paymentStatus;
        }

        if (updateData.trackingNumber) {
            updatedFields.trackingNumber = updateData.trackingNumber;
        }

        const updatedOrder = await orderService.update(id, updatedFields);
        res.success('Order updated successfully', updatedOrder);
    } catch (error) {
        next(error);
    }
};

// Get order by order ID (for tracking)
export const getOrderByOrderId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.error('Order ID is required', 400);
        }

        const order = await orderService.getByField('orderId', orderId);
        if (!order) {
            return res.error('Order not found', 404);
        }

        // Return limited info for public tracking
        const trackingInfo = {
            orderId: order.orderId,
            orderStatus: order.orderStatus,
            trackingNumber: order.trackingNumber,
            createdAt: order.createdAt,
            deliveredAt: order.deliveredAt,
            shippingAddress: {
                city: order.shippingAddress?.city,
                country: order.shippingAddress?.country,
            }
        };

        res.success('Order tracking info retrieved', trackingInfo);
    } catch (error) {
        next(error);
    }
};

// Cancel order
export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!id) {
            return res.error('Order ID is required', 400);
        }

        const order = await orderService.getById(id);
        if (!order) {
            return res.error('Order not found', 404);
        }

        // Check if order can be cancelled
        if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
            return res.error(`Cannot cancel order with status: ${order.orderStatus}`, 400);
        }

        // Restore product stock
        for (const item of order.items) {
            const product = await productService.getById(item.productId);
            if (product) {
                await productService.update(item.productId, {
                    stock: product.stock + item.quantity
                });
            }
        }

        // Update order status
        const updatedOrder = await orderService.update(id, {
            orderStatus: 'cancelled',
            paymentStatus: order.paymentStatus === 'completed' ? 'refunded' : 'failed',
            updatedAt: new Date(),
        });

        res.success('Order cancelled successfully', updatedOrder);
    } catch (error) {
        next(error);
    }
};

// Helper functions
function generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ORD-${timestamp}-${random}`.toUpperCase();
}

function calculateShipping(subtotal: number, country: string): number {
    // Free shipping for orders over $100
    if (subtotal >= 100) {
        return 0;
    }
    
    // Different rates by country
    const shippingRates: { [key: string]: number } = {
        'US': 10,
        'CA': 15,
        'UK': 12,
        'AU': 18,
        'DE': 14,
        'FR': 14,
        'default': 20
    };
    
    return shippingRates[country] || shippingRates.default;
}

function calculateTax(subtotal: number, country: string): number {
    // Tax rates by country
    const taxRates: { [key: string]: number } = {
        'US': 0.08,
        'CA': 0.13,
        'UK': 0.20,
        'AU': 0.10,
        'DE': 0.19,
        'FR': 0.20,
        'default': 0.05
    };
    
    const rate = taxRates[country] || taxRates.default;
    return subtotal * rate;
}