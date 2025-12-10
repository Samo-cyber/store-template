import { createClient } from '@supabase/supabase-js';
import { supabase as globalSupabase } from './supabase';

export interface ShippingRate {
    id: string;
    governorate: string;
    price: number;
}

// Helper to get a working client
const getClient = () => {
    if (globalSupabase) return globalSupabase;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key && url !== 'your_supabase_project_url_here') {
        return createClient(url, key, {
            auth: { persistSession: false }
        });
    }
    return null;
};

export async function getShippingRates() {
    const supabase = getClient();

    if (!supabase) {
        // Mock data if Supabase is not configured
        return [
            { id: '1', governorate: 'القاهرة', price: 50 },
            { id: '2', governorate: 'الجيزة', price: 50 },
            { id: '3', governorate: 'الإسكندرية', price: 60 },
            { id: '4', governorate: 'أخرى', price: 70 },
        ];
    }

    const { data, error } = await supabase
        .from('shipping_rates')
        .select('*')
        .order('governorate');

    if (error) {
        console.error('Error fetching shipping rates:', error);
        return [];
    }

    return data as ShippingRate[];
}

export async function updateShippingRate(id: string, price: number) {
    const supabase = getClient();

    if (!supabase) return { success: true };

    const { error } = await supabase
        .from('shipping_rates')
        .update({ price })
        .eq('id', id);

    if (error) {
        console.error('Error updating shipping rate:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function addShippingRate(governorate: string, price: number) {
    const supabase = getClient();

    if (!supabase) return { success: true };

    const { error } = await supabase
        .from('shipping_rates')
        .insert({ governorate, price });

    if (error) {
        console.error('Error adding shipping rate:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function getShippingRateForGovernorate(governorate: string) {
    const rates = await getShippingRates();
    const rate = rates.find(r => r.governorate === governorate);

    // If exact match not found, try to find 'أخرى' (Other)
    if (!rate) {
        return rates.find(r => r.governorate === 'أخرى')?.price || 0;
    }

    return rate.price;
}
