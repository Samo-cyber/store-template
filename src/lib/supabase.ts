import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValidUrl = (url: string | undefined) => {
    try {
        return url && new URL(url);
    } catch {
        return false;
    }
};

export const supabase = (isValidUrl(supabaseUrl) && supabaseKey && supabaseUrl !== 'your_supabase_project_url_here')
    ? createClient(supabaseUrl!, supabaseKey!)
    : null;
