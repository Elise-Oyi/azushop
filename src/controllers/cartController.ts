import type { Request, Response, NextFunction } from "express";
import { FirestoreRepo } from "../repo/firestore.repo.js";
import { type Cart, type CartItem } from "../models/cart.models.js";
import { type Product } from "../models/product.models.js";
import Collection from "../config/collections.js";
import { v4 as uuidv4 } from 'uuid';

const cartService = new FirestoreRepo<Cart>(Collection.azushopCart);
const productService = new FirestoreRepo<Product>(Collection.azushopProduct);

// Get or create user's cart
export const getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.error('User ID is required', 400);
        }

        // Try to find existing cart
        let cart = await cartService.getByField('userId', userId);
        
        // Create new cart if doesn't exist
        if (!cart) {
            const newCartData = {
                userId,
                items: [],
                totalAmount: 0,
                itemCount: 0,
                updatedAt: new Date(),
            };
            cart = await cartService.create(newCartData) as Cart & { id: string };
        }

        // Populate cart items with product details
        const populatedCart = await populateCartItems(cart);
        res.success('Cart retrieved successfully', populatedCart);
    } catch (error) {
        next(error);
    }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, productId, quantity = 1 } = req.body;

        if (!userId || !productId) {
            return res.error('User ID and Product ID are required', 400);
        }

        // Get product details
        const product = await productService.getById(productId);
        if (!product) {
            return res.error('Product not found', 404);
        }

        if (!product.isActive) {
            return res.error('Product is not available', 400);
        }

        if (product.stock < quantity) {
            return res.error('Insufficient stock', 400);
        }

        // Get or create cart
        let cart = await cartService.getByField('userId', userId);
        if (!cart) {
            const newCartData = {
                userId,
                items: [],
                totalAmount: 0,
                itemCount: 0,
                updatedAt: new Date(),
            };
            cart = await cartService.create(newCartData) as Cart & { id: string };
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
        
        if (existingItemIndex > -1) {
            // Update existing item quantity
            cart.items[existingItemIndex].quantity += Number(quantity);
        } else {
            // Add new item to cart
            const newItem: CartItem = {
                productId,
                quantity: Number(quantity),
                price: product.price,
                addedAt: new Date(),
            };
            cart.items.push(newItem);
        }

        // Recalculate totals
        const updatedCart = calculateCartTotals(cart);
        
        // Save updated cart
        await cartService.update(cart.id, updatedCart);
        
        const populatedCart = await populateCartItems(updatedCart);
        res.success('Item added to cart successfully', populatedCart);
    } catch (error) {
        next(error);
    }
};

// Update item quantity in cart
export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, productId, quantity } = req.body;

        if (!userId || !productId || quantity === undefined) {
            return res.error('User ID, Product ID, and quantity are required', 400);
        }

        const cart = await cartService.getByField('userId', userId);
        if (!cart) {
            return res.error('Cart not found', 404);
        }

        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        if (itemIndex === -1) {
            return res.error('Item not found in cart', 404);
        }

        if (Number(quantity) <= 0) {
            // Remove item if quantity is 0 or negative
            cart.items.splice(itemIndex, 1);
        } else {
            // Check stock availability
            const product = await productService.getById(productId);
            if (product && product.stock < Number(quantity)) {
                return res.error('Insufficient stock', 400);
            }
            
            // Update quantity
            cart.items[itemIndex].quantity = Number(quantity);
        }

        // Recalculate totals
        const updatedCart = calculateCartTotals(cart);
        
        // Save updated cart
        await cartService.update(cart.id, updatedCart);
        
        const populatedCart = await populateCartItems(updatedCart);
        res.success('Cart updated successfully', populatedCart);
    } catch (error) {
        next(error);
    }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, productId } = req.params;

        if (!userId || !productId) {
            return res.error('User ID and Product ID are required', 400);
        }

        const cart = await cartService.getByField('userId', userId);
        if (!cart) {
            return res.error('Cart not found', 404);
        }

        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        if (itemIndex === -1) {
            return res.error('Item not found in cart', 404);
        }

        // Remove item from cart
        cart.items.splice(itemIndex, 1);

        // Recalculate totals
        const updatedCart = calculateCartTotals(cart);
        
        // Save updated cart
        await cartService.update(cart.id, updatedCart);
        
        const populatedCart = await populateCartItems(updatedCart);
        res.success('Item removed from cart successfully', populatedCart);
    } catch (error) {
        next(error);
    }
};

// Clear entire cart
export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.error('User ID is required', 400);
        }

        const cart = await cartService.getByField('userId', userId);
        if (!cart) {
            return res.error('Cart not found', 404);
        }

        // Clear all items
        const clearedCart = {
            ...cart,
            items: [],
            totalAmount: 0,
            itemCount: 0,
            updatedAt: new Date(),
        };

        await cartService.update(cart.id, clearedCart);
        res.success('Cart cleared successfully', clearedCart);
    } catch (error) {
        next(error);
    }
};

// Helper function to calculate cart totals
function calculateCartTotals(cart: Cart): Cart {
    const totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
        ...cart,
        totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
        itemCount,
        updatedAt: new Date(),
    };
}

// Helper function to populate cart items with product details
async function populateCartItems(cart: Cart) {
    const populatedItems = await Promise.all(
        cart.items.map(async (item) => {
            const product = await productService.getById(item.productId);
            return {
                ...item,
                product: product ? {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    images: product.images,
                    currentPrice: product.price, // Current price might be different from cart price
                    stock: product.stock,
                    isActive: product.isActive,
                } : null,
                total: item.price * item.quantity,
            };
        })
    );

    return {
        ...cart,
        items: populatedItems,
    };
}