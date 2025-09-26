import type { Request, Response, NextFunction } from "express";
import { FirestoreRepo } from "../repo/firestore.repo.js";
import { type Review } from "../models/review.models.js";
import Collection from "../config/collections.js";
import { v4 as uuidv4 } from 'uuid';

const reviewService = new FirestoreRepo<Review>(Collection.azushopReview);

export const addReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId, userId, rating, title, comment } = req.body;

        // Debug logging
        console.log('Received review data:', { productId, userId, rating, title, comment });

        if (!productId || !userId || !rating || !comment) {
            const missing = [];
            if (!productId) missing.push('productId');
            if (!userId) missing.push('userId');
            if (!rating) missing.push('rating');
            if (!comment) missing.push('comment');
            
            console.log('Missing fields:', missing);
            return res.error(`Missing required fields: ${missing.join(', ')}`, 400);
        }

        // Check if user has purchased this product for verification
        const isVerified = await checkUserPurchase(userId, productId);

        const reviewData: Partial<Review> = {
            reviewId: uuidv4(), // Generate a new ID
            productId,
            userId,
            rating: Number(rating),
            title,
            comment,
            isVerified,
            helpfulCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const review = await reviewService.create(reviewData);
        
        // Update product ratings after adding review
        const { averageRating, reviewCount } = await updateProductRatings(productId);
        
        // Update the product with new ratings
        const productService = new FirestoreRepo<any>(Collection.azushopProduct);
        await productService.update(productId, {
            ratings: Math.round(averageRating * 10) / 10,
            reviewCount,
            updatedAt: new Date()
        });
        
        res.success('Review added successfully', review);
    } catch (error: any) {
        console.error('Error adding review:', error);
        res.error('Failed to add review', 500);
    }
}

export const getReviewsByProductId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.params;
        const { limit, pageToken, includeTotal } = req.query;

        if (!productId) {
            return res.error('Product ID is required', 400);
        }

        const result = await reviewService.findManyByField('productId', productId);
        res.success('Reviews retrieved successfully', result);
    } catch (error) {
        next(error);
    }
}

export const getReviewById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const review = await reviewService.getById(id);
        if (!review) {
            return res.error('Review not found', 404);
        }
        res.success('Review retrieved successfully', review);
    } catch (error) {
        next(error);
    }
}

export const markReviewHelpful = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params; // Review ID
        const { userId } = req.body; // User who found it helpful

        if (!userId) {
            return res.error('User ID is required', 400);
        }

        // Get the current review
        const review = await reviewService.getById(id);
        if (!review) {
            return res.error('Review not found', 404);
        }

        // TODO: Add logic to prevent duplicate votes by same user
        // For now, just increment the count
        
        const updatedReview = await reviewService.update(id, {
            helpfulCount: review.helpfulCount + 1
        });

        res.success('Review marked as helpful', updatedReview);
    } catch (error) {
        console.error('Error marking review helpful:', error);
        res.error('Failed to mark review as helpful', 500);
    }
};

export const checkUserPurchase = async (userId: string, productId: string): Promise<boolean> => {
    try {
        // TODO: Implement order checking logic when Order model is ready
        // For now, return false (unverified)
        
        // Future implementation:
        // const orderService = new FirestoreRepo<Order>(Collection.azushopOrder);
        // const userOrders = await orderService.findManyByField('userId', userId);
        // 
        // return userOrders.some(order => 
        //     order.items.some(item => item.productId === productId) &&
        //     order.orderStatus === 'delivered'
        // );
        
        return false;
    } catch (error) {
        console.error('Error checking user purchase:', error);
        return false;
    }
};

export const updateProductRatings = async (productId: string) => {
    try {
        const reviews = await reviewService.findManyByField('productId', productId);
        if (reviews.length === 0) {
            return { averageRating: 0, reviewCount: 0 };
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        const reviewCount = reviews.length;

        return { averageRating, reviewCount };
    } catch (error) {
        console.error('Error updating product ratings:', error);
        throw new Error('Failed to update product ratings');
    }
}
