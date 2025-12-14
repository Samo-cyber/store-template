import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { storeName, storeSlug, template } = await request.json();

        if (!storeName || !storeSlug) {
            return NextResponse.json(
                { error: 'اسم المتجر والرابط مطلوبان' },
                { status: 400 }
            );
        }

        const cookieStore = cookies();

        // Initialize Supabase Client (Server-Side)
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        // Get Authenticated User
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'يجب تسجيل الدخول أولاً' },
                { status: 401 }
            );
        }

        const userId = user.id;

        // Check if slug exists
        const { data: existingStore } = await supabase
            .from('stores')
            .select('id')
            .eq('slug', storeSlug)
            .single();

        if (existingStore) {
            return NextResponse.json(
                { error: 'رابط المتجر مستخدم بالفعل' },
                { status: 400 }
            );
        }

        // Create store
        const { data: newStore, error } = await supabase
            .from('stores')
            .insert([
                {
                    name: storeName,
                    slug: storeSlug,
                    owner_id: userId,
                    template: template || 'modern',
                    settings: {
                        colors: {
                            primary: '#000000',
                            secondary: '#ffffff'
                        }
                    }
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, store: newStore });

    } catch (error: any) {
        console.error('Create store error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء إنشاء المتجر' },
            { status: 500 }
        );
    }
}
