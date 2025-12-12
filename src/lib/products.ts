import { createClient } from '@supabase/supabase-js';
import { supabase as globalSupabase } from './supabase';

export interface Product {
    id: string;
    store_id: string;
    title: string;
    description: string | null;
    price: number;
    category: string;
    image_url: string;
    images?: string[];
    stock: number;
}

const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        store_id: 'mock-store',
        title: 'ساعة ذكية فاخرة',
        description: 'ساعة ذكية بمواصفات عالية وتصميم أنيق',
        price: 299,
        category: 'electronics',
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        stock: 10
    },
    {
        id: '2',
        store_id: 'mock-store',
        title: 'سماعات لاسلكية',
        description: 'سماعات بلوتوث مع عزل ضوضاء ممتاز',
        price: 159,
        category: 'electronics',
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        stock: 15
    },
    {
        id: '3',
        store_id: 'mock-store',
        title: 'عطر رجالي',
        description: 'عطر فاحر برائحة مميزة وثبات عالي',
        price: 89,
        category: 'perfumes',
        image_url: 'https://images.unsplash.com/photo-1523293188086-b589b9b40b8d?w=800&q=80',
        stock: 20
    },
    {
        id: '4',
        store_id: 'mock-store',
        title: 'نظارة شمسية',
        description: 'نظارة شمسية بتصميم عصري وحماية UV',
        price: 120,
        category: 'accessories',
        image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
        stock: 5
    }
];

// Helper to get a working client
const getClient = () => {
    if (globalSupabase) return globalSupabase;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key && url !== 'your_supabase_project_url_here') {
        return createClient(url, key, {
            auth: { persistSession: false } // No auth needed for public fetch
        });
    }
    return null;
};

export async function getProducts(storeId?: string) {
    const supabase = getClient();

    if (!supabase) {
        console.warn('Supabase not configured, returning mock data');
        // Filter mock data if storeId is provided
        if (storeId) {
            return MOCK_PRODUCTS.filter(p => p.store_id === storeId);
        }
        return MOCK_PRODUCTS;
    }

    let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (storeId) {
        query = query.eq('store_id', storeId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data as Product[];
}

export async function getProductById(id: string, storeId?: string) {
    const supabase = getClient();

    if (!supabase) {
        const product = MOCK_PRODUCTS.find(p => p.id === id);
        if (storeId && product?.store_id !== storeId) return null;
        return product || null;
    }

    let query = supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    // Note: .single() might fail if we add more filters that result in 0 rows, 
    // but here we want to ensure the product belongs to the store.
    // However, RLS might handle this if we set it up correctly.
    // But explicit check is good.
    // Actually, if we filter by store_id and id, it's still unique.

    if (storeId) {
        // We can't chain .eq after .single() usually, order matters.
        // But supabase-js usually allows building query then executing.
        // Let's rebuild query.
        query = supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .eq('store_id', storeId)
            .single();
    }

    const { data, error } = await query;

    if (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }

    return data as Product;
}

export async function getFeaturedProducts(limit = 4, storeId?: string) {
    const supabase = getClient();

    if (!supabase) {
        return MOCK_PRODUCTS.slice(0, limit);
    }

    let query = supabase
        .from('products')
        .select('*')
        .limit(limit)
        .order('created_at', { ascending: false });

    if (storeId) {
        query = query.eq('store_id', storeId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }

    return data as Product[];
}

export async function getProductsByCategory(category: string, storeId?: string) {
    const supabase = getClient();

    if (!supabase) {
        return MOCK_PRODUCTS.filter(p => p.category === category);
    }

    let query = supabase
        .from('products')
        .select('*')
        .eq('category', category);

    if (storeId) {
        query = query.eq('store_id', storeId);
    }

    const { data, error } = await query;

    if (error) {
        console.error(`Error fetching products in category ${category}:`, error);
        return [];
    }

    return data as Product[];
}
export async function getBestSellers(limit = 4, storeId?: string) {
    // For now, just return featured products as best sellers
    return getFeaturedProducts(limit, storeId);
}

export async function getNewArrivals(limit = 4, storeId?: string) {
    const supabase = getClient();

    if (!supabase) {
        return MOCK_PRODUCTS.slice(0, limit);
    }

    let query = supabase
        .from('products')
        .select('*')
        .limit(limit)
        .order('created_at', { ascending: false });

    if (storeId) {
        query = query.eq('store_id', storeId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching new arrivals:', error);
        return [];
    }

    return data as Product[];
}

export async function getOffers(limit = 4, storeId?: string) {
    // For now, return random products as offers
    // In a real app, you might query for products with a discount field
    return getFeaturedProducts(limit, storeId);
}
