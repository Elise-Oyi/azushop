// Product interface

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    images?: string[];
    setTrending: boolean;
    ratings?: number;
    reviewCount?: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}