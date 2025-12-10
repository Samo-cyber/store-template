import { supabase } from './supabase';

export interface Product {
    id: string;
    title: string;
    description: string | null;
    price: number;
    category: string;
    image_url: string;
    stock: number;
}

export async function getProducts() {
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
