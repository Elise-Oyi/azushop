import type { Request, Response, NextFunction } from "express";
import { FirestoreRepo } from "../repo/firestore.repo.ts";
import { Product } from "../models/product.models.ts";
import Collection from "../config/collections.ts";

const productService = new FirestoreRepo<Product>(Collection.azushopProduct);

export const addProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, price, stock, category, images, setTrending, isActive } = req.body;

        if (!name || !description || !price || !stock || !category) {
            return res.error('Missing required fields', 400);
        }

        const productData: Partial<Product> = {
            name,
            description,
            price: Number(price),
            stock: Number(stock),
            category,
            images: images || [],
            setTrending: Boolean(setTrending),
            ratings: 0,
            reviewCount: 0,
            isActive: isActive !== undefined ? Boolean(isActive) : true,
        };

        const product = await productService.create(productData);
        res.success('Product created successfully', product);
    } catch (error) {
        next(error);
    }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit, pageToken, includeTotal } = req.query;
        
        const options = {
            limit: limit ? Number(limit) : undefined,
            pageToken: pageToken as string,
            includeTotal: includeTotal === 'true',
        };

        const result = await productService.list(options);
        res.success('Products retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        const product = await productService.getById(id);
        if (!product) {
            return res.error('Product not found', 404);
        }

        res.success('Product retrieved successfully', product);
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const existingProduct = await productService.getById(id);
        if (!existingProduct) {
            return res.error('Product not found', 404);
        }

        if (updateData.price) updateData.price = Number(updateData.price);
        if (updateData.stock) updateData.stock = Number(updateData.stock);

        const updatedProduct = await productService.update(id, updateData);
        res.success('Product updated successfully', updatedProduct);
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const existingProduct = await productService.getById(id);
        if (!existingProduct) {
            return res.error('Product not found', 404);
        }

        await productService.delete(id);
        res.success('Product deleted successfully');
    } catch (error) {
        next(error);
    }
};