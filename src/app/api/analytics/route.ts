import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function getUser(request: Request) {
    const cookieStore = cookies();
    const token = cookieStore.get('user_session')?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function GET(request: Request) {
    try {
        const user = await getUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const storeId = searchParams.get('storeId');

        if (!storeId) {
            return NextResponse.json({ error: 'Missing Store ID' }, { status: 400 });
        }

        // Verify ownership
        const { data: store } = await supabaseAdmin
            .from('stores')
            .select('id')
            .eq('id', storeId)
            .eq('owner_id', user.userId)
            .single();

        if (!store) {
            return NextResponse.json({ error: 'Unauthorized access to store' }, { status: 403 });
        }

        // Fetch all stats in parallel
        const [statsRes, salesRes, productsRes] = await Promise.all([
            supabaseAdmin.rpc('get_dashboard_stats', { p_store_id: storeId }),
            supabaseAdmin.rpc('get_monthly_sales', { p_store_id: storeId }),
            supabaseAdmin.rpc('get_top_products', { p_store_id: storeId })
        ]);

        if (statsRes.error) throw statsRes.error;
        if (salesRes.error) throw salesRes.error;
        if (productsRes.error) throw productsRes.error;

        return NextResponse.json({
            stats: statsRes.data,
            monthlySales: salesRes.data,
            topProducts: productsRes.data
        });

    } catch (error: any) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
