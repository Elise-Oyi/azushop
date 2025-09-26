import type { Request, Response, NextFunction } from "express";
import { FirestoreRepo } from "../repo/firestore.repo.js";
import { type Wishlist } from "../models/cart.models.js";
import { type Product } from "../models/product.models.js";
import Collection from "../config/collections.js";

const wishlistService = new FirestoreRepo<Wishlist>(Collection.azushopWishlist);
const productService = new FirestoreRepo<Product>(Collection.azushopProduct);

// Get user's wishlist
export const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.error('User ID is required', 400);
        }

        // Try to find existing wishlist
        let wishlist = await wishlistService.getByField('userId', userId);
        
        // Create new wishlist if doesn't exist
        if (!wishlist) {
            const newWishlistData = {
                userId,
                productIds: [],
                updatedAt: new Date(),
            };
            wishlist = await wishlistService.create(newWishlistData) as Wishlist & { id: string };
        }

        // Populate wishlist with product details
        const populatedWishlist = await populateWishlistItems(wishlist);
        res.success('Wishlist retrieved successfully', populatedWishlist);
    } catch (error) {
        next(error);
    }
};

// Add product to wishlist
export const addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.error('User ID and Product ID are required', 400);
        }

        // Check if product exists
        const product = await productService.getById(productId);
        if (!product) {
            return res.error('Product not found', 404);
        }

        // Get or create wishlist
        let wishlist = await wishlistService.getByField('userId', userId);
        if (!wishlist) {
            const newWishlistData = {
                userId,
                productIds: [],
                updatedAt: new Date(),
            };
            wishlist = await wishlistService.create(newWishlistData) as Wishlist & { id: string };
        }

        // Check if product is already in wishlist
        if (wishlist.productIds.includes(productId)) {
            return res.error('Product already in wishlist', 400);
        }

        // Add product to wishlist
        wishlist.productIds.push(productId);
        wishlist.updatedAt = new Date();

        // Save updated wishlist
        await wishlistService.update(wishlist.id, {
            productIds: wishlist.productIds,
            updatedAt: wishlist.updatedAt,
        });

        const populatedWishlist = await populateWishlistItems(wishlist);
        res.success('Product added to wishlist successfully', populatedWishlist);
    } catch (error) {
        next(error);
    }
};

// Remove product from wishlist
export const removeFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, productId } = req.params;

        if (!userId || !productId) {
            return res.error('User ID and Product ID are required', 400);
        }

        const wishlist = await wishlistService.getByField('userId', userId);
        if (!wishlist) {
            return res.error('Wishlist not found', 404);
        }

        // Check if product is in wishlist
        const productIndex = wishlist.productIds.indexOf(productId);
        if (productIndex === -1) {
            return res.error('Product not found in wishlist', 404);
        }

        // Remove product from wishlist
        wishlist.productIds.splice(productIndex, 1);
        wishlist.updatedAt = new Date();

        // Save updated wishlist
        await wishlistService.update(wishlist.id, {
            productIds: wishlist.productIds,
            updatedAt: wishlist.updatedAt,
        });

        const populatedWishlist = await populateWishlistItems(wishlist);
        res.success('Product removed from wishlist successfully', populatedWishlist);
    } catch (error) {
        next(error);
    }
};

// Clear entire wishlist
export const clearWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.error('User ID is required', 400);
        }

        const wishlist = await wishlistService.getByField('userId', userId);
        if (!wishlist) {
            return res.error('Wishlist not found', 404);
        }

        // Clear all products
        await wishlistService.update(wishlist.id, {
            productIds: [],
            updatedAt: new Date(),
        });

        res.success('Wishlist cleared successfully', {
            id: wishlist.id,
            userId: wishlist.userId,
            productIds: [],
            products: [],
            itemCount: 0,
            updatedAt: new Date(),
        });
    } catch (error) {
        next(error);
    }
};

// Check if product is in user's wishlist
export const checkWishlistStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, productId } = req.params;

        if (!userId || !productId) {
            return res.error('User ID and Product ID are required', 400);
        }

        const wishlist = await wishlistService.getByField('userId', userId);
        const isInWishlist = wishlist ? wishlist.productIds.includes(productId) : false;

        res.success('Wishlist status checked', {
            productId,
            isInWishlist,
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to populate wishlist items with product details
async function populateWishlistItems(wishlist: Wishlist) {
    const products = await Promise.all(
        wishlist.productIds.map(async (productId) => {
            const product = await productService.getById(productId);
            return product ? {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                images: product.images,
                category: product.category,
                ratings: product.ratings,
                reviewCount: product.reviewCount,
                stock: product.stock,
                isActive: product.isActive,
                setTrending: product.setTrending,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
            } : null;
        })
    );

    // Filter out null products (deleted products)
    const validProducts = products.filter(product => product !== null);

    return {
        id: wishlist.id,
        userId: wishlist.userId,
        productIds: wishlist.productIds,
        products: validProducts,
        itemCount: validProducts.length,
        updatedAt: wishlist.updatedAt,
    };
}