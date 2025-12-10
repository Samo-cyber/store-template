import { createClient } from '@supabase/supabase-js';
import { supabase as globalSupabase } from './supabase';

export interface FreeShippingSettings {
    isActive: boolean;
    endDate: string | null; // ISO string
}

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Helper to get a working client
const getClient = () => {
    if (typeof window !== 'undefined') {
        return createClientComponentClient();
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

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
    const supabase = getClient();

    if (!supabase) return defaultValue;

    const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();

    if (error || !data) {
        return defaultValue;
    }

    return data.value as T;
}

export async function updateSetting<T>(key: string, value: T) {
    const supabase = getClient();

    if (!supabase) return { success: true };

    const { error } = await supabase
        .from('settings')
        .upsert({ key, value })
        .select();

    if (error) {
        console.error('Error updating setting:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function getFreeShippingSettings() {
    return getSetting<FreeShippingSettings>('free_shipping', {
        isActive: false,
        endDate: null
    });
}
