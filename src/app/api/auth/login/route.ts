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
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
                { status: 400 }
            );
        }

        // Fetch user
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (!user) {
            return NextResponse.json(
                { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return NextResponse.json(
                { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
                { status: 401 }
            );
        }

        // Fetch user's store
        const { data: store } = await supabase
            .from('stores')
            .select('slug')
            .eq('owner_id', user.id)
            .single();

        // Create Session Token
        const token = await new SignJWT({
            userId: user.id,
            email: user.email,
            role: user.role
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(JWT_SECRET);

        // Set Cookie
        const response = NextResponse.json({ success: true, user, store });
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
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء تسجيل الدخول' },
            { status: 500 }
        );
    }
}
