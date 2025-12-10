import { createClient } from '@supabase/supabase-js';
import { supabase as globalSupabase } from './supabase';

export interface Product {
    id: string;
    title: string;
    description: string | null;
    price: number;
    category: string;
    image_url: string;
    stock: number;
}

const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        title: 'ساعة ذكية فاخرة',
        description: 'ساعة ذكية بمواصفات عالية وتصميم أنيق',
        price: 299,
        category: 'electronics',
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        stock: 10
    },
    {
        id: '2',
        title: 'سماعات لاسلكية',
        description: 'سماعات بلوتوث مع عزل ضوضاء ممتاز',
        price: 159,
        category: 'electronics',
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        stock: 15
    },
    {
        id: '3',
        title: 'عطر رجالي',
        description: 'عطر فاحر برائحة مميزة وثبات عالي',
        price: 89,
        category: 'perfumes',
        image_url: 'https://images.unsplash.com/photo-1523293188086-b589b9b40b8d?w=800&q=80',
        stock: 20
    },
    {
        id: '4',
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

export async function getProducts() {
    const supabase = getClient();

    if (!supabase) {
        console.warn('Supabase not configured, returning mock data');
        return MOCK_PRODUCTS;
    }

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data as Product[];
}

export async function getProductById(id: string) {
    const supabase = getClient();

    if (!supabase) {
        return MOCK_PRODUCTS.find(p => p.id === id) || null;
    }

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }

    return data as Product;
}

export async function getFeaturedProducts(limit = 4) {
    const supabase = getClient();

    if (!supabase) {
        return MOCK_PRODUCTS.slice(0, limit);
    }

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(limit)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }

    return data as Product[];
}

export async function getProductsByCategory(category: string) {
    const supabase = getClient();

    if (!supabase) {
        return MOCK_PRODUCTS.filter(p => p.category === category);
    }

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category);

    if (error) {
        console.error(`Error fetching products in category ${category}:`, error);
        return [];
    }

    return data as Product[];
}
