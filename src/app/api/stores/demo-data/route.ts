import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const cookieStore = cookies();
        const userSession = cookieStore.get('user_session')?.value;

        if (!userSession) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify session
        const { jwtVerify } = await import('jose');
        const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        const { payload } = await jwtVerify(userSession, secret);
        const userId = payload.userId as string;

        // Get store
        const { data: store } = await supabase
            .from('stores')
            .select('id')
            .eq('owner_id', userId)
            .single();

        if (!store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        // Demo Products
        const demoProducts = [
            {
                title: "ساعة كلاسيكية فاخرة",
                description: "ساعة يد رجالية بتصميم كلاسيكي أنيق، مقاومة للماء مع سوار جلدي طبيعي.",
                price: 1250,
                stock: 15,
                category: "إكسسوارات",
                store_id: store.id,
                image_url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80"]
            },
            {
                title: "حذاء رياضي مريح",
                description: "حذاء رياضي خفيف الوزن مناسب للجري والمشي لمسافات طويلة.",
                price: 850,
                stock: 20,
                category: "ملابس",
                store_id: store.id,
                image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"]
            },
            {
                title: "حقيبة جلدية",
                description: "حقيبة يد نسائية مصنوعة من الجلد عالي الجودة، مثالية للعمل والمناسبات.",
                price: 1500,
                stock: 8,
                category: "إكسسوارات",
                store_id: store.id,
                image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"]
            },
            {
                title: "نظارة شمسية عصرية",
                description: "نظارة شمسية بتصميم عصري وحماية كاملة من الأشعة فوق البنفسجية.",
                price: 450,
                stock: 30,
                category: "إكسسوارات",
                store_id: store.id,
                image_url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80"]
            },
            {
                title: "سماعة رأس لاسلكية",
                description: "سماعة رأس بلوتوث مع خاصية إلغاء الضوضاء وصوت عالي النقاء.",
                price: 2200,
                stock: 12,
                category: "إلكترونيات",
                store_id: store.id,
                image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
                images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"]
            }
        ];

        const { error } = await supabase
            .from('products')
            .insert(demoProducts);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Demo data error:', error);
        return NextResponse.json(
            { error: 'Failed to generate demo data' },
            { status: 500 }
        );
    }
}
