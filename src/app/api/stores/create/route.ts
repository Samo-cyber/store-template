import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

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
        const userSession = cookieStore.get('user_session')?.value;

        if (!userSession) {
            return NextResponse.json(
                { error: 'يجب تسجيل الدخول أولاً' },
                { status: 401 }
            );
        }

        // Verify session
        let userId;
        try {
            const { jwtVerify } = await import('jose');
            const { payload } = await jwtVerify(userSession, JWT_SECRET);
            userId = payload.userId;
        } catch (e) {
            return NextResponse.json(
                { error: 'جلسة غير صالحة' },
                { status: 401 }
            );
        }

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
