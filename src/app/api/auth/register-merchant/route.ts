import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(request: Request) {
    try {
        const { email, password, storeName, storeSlug, template } = await request.json();

        // 1. Validate Input
        if (!email || !password || !storeName || !storeSlug) {
            return NextResponse.json(
                { error: 'جميع الحقول مطلوبة' },
                { status: 400 }
            );
        }

        // Validate slug format
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(storeSlug)) {
            return NextResponse.json(
                { error: 'رابط المتجر يجب أن يحتوي فقط على أحرف إنجليزية صغيرة وأرقام وشرطات' },
                { status: 400 }
            );
        }

        // 2. Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { error: 'البريد الإلكتروني مسجل بالفعل' },
                { status: 400 }
            );
        }

        // 3. Check if store slug exists
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

        // 4. Create User
        const passwordHash = await bcrypt.hash(password, 10);
        const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert([
                {
                    email,
                    password_hash: passwordHash,
                    role: 'store_owner'
                }
            ])
            .select()
            .single();

        if (userError) {
            if (userError.code === '23505') { // Unique violation
                return NextResponse.json(
                    { error: 'البريد الإلكتروني مسجل بالفعل' },
                    { status: 400 }
                );
            }
            throw userError;
        }

        // 5. Create Store
        const { data: newStore, error: storeError } = await supabase
            .from('stores')
            .insert([
                {
                    name: storeName,
                    slug: storeSlug,
                    owner_id: newUser.id,
                    template: template || 'modern'
                }
            ])
            .select()
            .single();

        if (storeError) {
            // Rollback user creation
            await supabase.from('users').delete().eq('id', newUser.id);

            if (storeError.code === '23505') { // Unique violation
                return NextResponse.json(
                    { error: 'رابط المتجر مستخدم بالفعل' },
                    { status: 400 }
                );
            }
            throw storeError;
        }

        // 6. Create Session Token
        const token = await new SignJWT({
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(JWT_SECRET);

        // 7. Return Success & Set Cookie
        const response = NextResponse.json({ success: true, user: newUser, store: newStore });

        // Determine cookie domain
        let rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
        if (!rootDomain) {
            const host = request.headers.get('host');
            if (host) {
                rootDomain = host.replace('www.', '').split(':')[0];
            }
        }
        if (rootDomain) {
            rootDomain = rootDomain.replace('https://', '').replace('http://', '');
        }

        const cookieOptions: any = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 // 24 hours
        };

        if (rootDomain && !rootDomain.includes('localhost') && !rootDomain.includes('vercel.app')) {
            cookieOptions.domain = `.${rootDomain}`;
        }

        response.cookies.set('user_session', token, cookieOptions);

        return response;

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: error.message || 'حدث خطأ أثناء إنشاء الحساب والمتجر' },
            { status: 500 }
        );
    }
}
