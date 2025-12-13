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

export async function POST(request: Request) {
    try {
        const user = await getUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { store_id, ...productData } = body;

        // Verify ownership of the store
        const { data: store } = await supabaseAdmin
            .from('stores')
            .select('id')
            .eq('id', store_id)
            .eq('owner_id', user.userId)
            .single();

        if (!store) {
            return NextResponse.json({ error: 'Unauthorized access to store' }, { status: 403 });
        }

        const { data, error } = await supabaseAdmin
            .from('products')
            .insert([{ ...productData, store_id }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const user = await getUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, store_id, ...updates } = body;

        if (!id || !store_id) {
            return NextResponse.json({ error: 'Missing product ID or Store ID' }, { status: 400 });
        }

        // Verify ownership
        const { data: store } = await supabaseAdmin
            .from('stores')
            .select('id')
            .eq('id', store_id)
            .eq('owner_id', user.userId)
            .single();

        if (!store) {
            return NextResponse.json({ error: 'Unauthorized access to store' }, { status: 403 });
        }

        const { data, error } = await supabaseAdmin
            .from('products')
            .update(updates)
            .eq('id', id)
            .eq('store_id', store_id) // Extra safety
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const user = await getUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const store_id = searchParams.get('storeId');

        if (!id || !store_id) {
            return NextResponse.json({ error: 'Missing ID or Store ID' }, { status: 400 });
        }

        // Verify ownership
        const { data: store } = await supabaseAdmin
            .from('stores')
            .select('id')
            .eq('id', store_id)
            .eq('owner_id', user.userId)
            .single();

        if (!store) {
            return NextResponse.json({ error: 'Unauthorized access to store' }, { status: 403 });
        }

        const { error } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', id)
            .eq('store_id', store_id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
