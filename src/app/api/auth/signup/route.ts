import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

        // Check if user exists
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

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([
                {
                    email,
                    password_hash: passwordHash,
                    role: 'user'
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Create Session Token
        const token = await new SignJWT({
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(JWT_SECRET);

        // Set Cookie
        const response = NextResponse.json({ success: true, user: newUser });
        response.cookies.set('user_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        return response;

    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء إنشاء الحساب' },
            { status: 500 }
        );
    }
}
