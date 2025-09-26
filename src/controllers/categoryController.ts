import type { Request, Response, NextFunction } from "express";
import { FirestoreRepo } from "../repo/firestore.repo.ts";
import { type Category } from "../models/category.models.ts";
import { type Product } from "../models/product.models.ts";
import Collection from "../config/collections.ts";
import { v4 as uuidv4 } from 'uuid';

const categoryService = new FirestoreRepo<Category>(Collection.azushopCategory);
const productService = new FirestoreRepo<Product>(Collection.azushopProduct);

// Create new category
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description } = req.body;

        if (!name || name.trim() === '') {
            return res.error('Category name is required', 400);
        }

        // Create slug from name
        const slug = createSlug(name);

        // Check if category with same name or slug already exists
        const existingByName = await categoryService.getByField('name', name.trim());
        const existingBySlug = await categoryService.getByField('slug', slug);

        if (existingByName || existingBySlug) {
            return res.error('Category with this name already exists', 400);
        }

        const categoryData = {
            name: name.trim(),
            slug,
            description: description?.trim() || '',
            isActive: true,
            productCount: 0,
            updatedAt: new Date(),
        };

        const category = await categoryService.create(categoryData) as Category & { id: string };
        res.success('Category created successfully', category);
    } catch (error) {
        next(error);
    }
};

// Get all categories
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { includeInactive = false, includeProductCount = false } = req.query;

        // Get all categories
        let categories = await categoryService.list();
        let categoryList = categories.items;

        // Filter out inactive categories if not requested
        if (includeInactive !== 'true') {
            categoryList = categoryList.filter(category => category.isActive);
        }

        // Include product count if requested
        if (includeProductCount === 'true') {
            categoryList = await Promise.all(
                categoryList.map(async (category) => {
                    const products = await productService.findManyByField('category', category.name);
                    const activeProductCount = products.filter(product => product.isActive).length;
                    
                    return {
                        ...category,
                        productCount: activeProductCount,
                    };
                })
            );
        }

        // Sort by name
        categoryList.sort((a, b) => a.name.localeCompare(b.name));

        res.success('Categories retrieved successfully', categoryList);
    } catch (error) {
        next(error);
    }
};

// Get category by ID
export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.error('Category ID is required', 400);
        }

        const category = await categoryService.getById(id);
        if (!category) {
            return res.error('Category not found', 404);
        }

        // Get product count
        const products = await productService.findManyByField('category', category.name);
        const productCount = products.filter(product => product.isActive).length;

        const categoryWithCount = {
            ...category,
            productCount,
        };

        res.success('Category retrieved successfully', categoryWithCount);
    } catch (error) {
        next(error);
    }
};

// Get category by slug
export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.error('Category slug is required', 400);
        }

        const category = await categoryService.getByField('slug', slug);
        if (!category) {
            return res.error('Category not found', 404);
        }

        // Get products in this category
        const products = await productService.findManyByField('category', category.name);
        const activeProducts = products.filter(product => product.isActive);

        const result = {
            category: {
                ...category,
                productCount: activeProducts.length,
            },
            products: activeProducts,
        };

        res.success('Category and products retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

// Update category
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, description, isActive } = req.body;

        if (!id) {
            return res.error('Category ID is required', 400);
        }

        const existingCategory = await categoryService.getById(id);
        if (!existingCategory) {
            return res.error('Category not found', 404);
        }

        const updateData: any = {
            updatedAt: new Date(),
        };

        // Update name and slug if provided
        if (name && name.trim() !== '') {
            const newName = name.trim();
            const newSlug = createSlug(newName);

            // Check if another category has the same name (excluding current)
            const existingByName = await categoryService.getByField('name', newName);
            if (existingByName && existingByName.id !== id) {
                return res.error('Category with this name already exists', 400);
            }

            updateData.name = newName;
            updateData.slug = newSlug;

            // Update all products that use the old category name
            if (newName !== existingCategory.name) {
                const products = await productService.findManyByField('category', existingCategory.name);
                for (const product of products) {
                    await productService.update(product.id, {
                        category: newName,
                        updatedAt: new Date(),
                    });
                }
            }
        }

        if (description !== undefined) {
            updateData.description = description.trim();
        }

        if (isActive !== undefined) {
            updateData.isActive = Boolean(isActive);
        }

        const updatedCategory = await categoryService.update(id, updateData);
        res.success('Category updated successfully', updatedCategory);
    } catch (error) {
        next(error);
    }
};

// Delete category
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.error('Category ID is required', 400);
        }

        const existingCategory = await categoryService.getById(id);
        if (!existingCategory) {
            return res.error('Category not found', 404);
        }

        // Check if category has products
        const products = await productService.findManyByField('category', existingCategory.name);
        const activeProducts = products.filter(product => product.isActive);

        if (activeProducts.length > 0) {
            return res.error(`Cannot delete category. It has ${activeProducts.length} active products`, 400);
        }

        await categoryService.delete(id);
        res.success('Category deleted successfully');
    } catch (error) {
        next(error);
    }
};

// Get products by category
export const getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const { limit, includeInactive = false } = req.query;

        if (!slug) {
            return res.error('Category slug is required', 400);
        }

        // Find category by slug
        const category = await categoryService.getByField('slug', slug);
        if (!category) {
            return res.error('Category not found', 404);
        }

        // Get products in this category
        let products = await productService.findManyByField('category', category.name);

        // Filter active products unless requested otherwise
        if (includeInactive !== 'true') {
            products = products.filter(product => product.isActive);
        }

        // Apply limit if specified
        if (limit && Number(limit) > 0) {
            products = products.slice(0, Number(limit));
        }

        // Sort by creation date (newest first)
        products.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

        res.success('Products retrieved successfully', {
            category: {
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description,
            },
            products,
            totalProducts: products.length,
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to create URL-friendly slug
function createSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}