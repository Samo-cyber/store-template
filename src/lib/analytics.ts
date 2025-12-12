import { createClient } from '@supabase/supabase-js';
import { supabase as globalSupabase } from './supabase';

import { createBrowserClient } from "@supabase/ssr";

// Helper to get a working client
const getClient = () => {
    if (typeof window !== 'undefined') {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
    }

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

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    lowStockCount: number;
}

export interface MonthlySales {
    month: string;
    revenue: number;
    orders_count: number;
}

export interface TopProduct {
    product_id: string;
    product_title: string;
    product_image: string;
    total_sold: number;
    total_revenue: number;
}

export async function getDashboardStats(storeId: string): Promise<DashboardStats> {
    const supabase = getClient();
    if (!supabase) return { totalRevenue: 0, totalOrders: 0, totalProducts: 0, lowStockCount: 0 };

    const { data, error } = await supabase.rpc('get_dashboard_stats', { p_store_id: storeId });

    if (error) {
        console.error('Error fetching dashboard stats:', error);
        return { totalRevenue: 0, totalOrders: 0, totalProducts: 0, lowStockCount: 0 };
    }

    return data as DashboardStats;
}

export async function getMonthlySales(storeId: string): Promise<MonthlySales[]> {
    const supabase = getClient();
    if (!supabase) return [];

    const { data, error } = await supabase.rpc('get_monthly_sales', { p_store_id: storeId });

    if (error) {
        console.error('Error fetching monthly sales:', error);
        return [];
    }

    // Sort by month ascending for the chart
    return (data as MonthlySales[]).sort((a, b) => a.month.localeCompare(b.month));
}

export async function getTopProducts(storeId: string): Promise<TopProduct[]> {
    const supabase = getClient();
    if (!supabase) return [];

    const { data, error } = await supabase.rpc('get_top_products', { p_store_id: storeId });

    if (error) {
        console.error('Error fetching top products:', error);
        return [];
    }

    return data as TopProduct[];
}
