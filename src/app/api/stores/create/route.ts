import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const JWT_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(request: NextRequest) {
    try {
        const { name, slug } = await request.json();
        const userSession = request.cookies.get('user_session')?.value;

        if (!userSession) {
            return NextResponse.json(
                { error: 'غير مصرح لك بالقيام بهذا الإجراء' },
                { status: 401 }
            );
        }

        // Verify Token
        const { payload } = await jwtVerify(userSession, JWT_SECRET);
        const userId = payload.userId as string;

        if (!name || !slug) {
            return NextResponse.json(
                { error: 'اسم المتجر والرابط مطلوبان' },
                { status: 400 }
            );
        }

        // Create store
        const { data: store, error } = await supabase
            .from('stores')
            .insert([
                {
                    name,
                    slug,
                    owner_id: userId
                }
            ])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'هذا الرابط مستخدم بالفعل، يرجى اختيار رابط آخر' },
                    { status: 400 }
                );
            }
            throw error;
        }

        // Update user role to store_owner
        await supabase
            .from('users')
            .update({ role: 'store_owner' })
            .eq('id', userId);

        return NextResponse.json({ success: true, store });

    } catch (error: any) {
        console.error('Create store error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء إنشاء المتجر' },
            { status: 500 }
        );
    }
}
