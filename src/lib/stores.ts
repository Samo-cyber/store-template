import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const getClient = () => {
    if (supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_project_url_here') {
        return createClient(supabaseUrl, supabaseKey);
    }
    return null;
};

export interface Store {
    id: string;
    name: string;
    slug: string;
    owner_id: string;
    settings: any;
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
    const supabase = getClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error(`Error fetching store with slug ${slug}:`, error);
        return null;
    }

    return data;
}

export async function getStoreById(id: string): Promise<Store | null> {
    const supabase = getClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching store with id ${id}:`, error);
        return null;
    }

    return data;
}
