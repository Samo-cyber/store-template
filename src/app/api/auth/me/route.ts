import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const JWT_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(request: Request) {
    try {
        // 1. Get Cookie
        const cookieHeader = request.headers.get('cookie');
        if (!cookieHeader) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
        const token = cookies['user_session'];

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // 2. Verify Token
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        // 3. Fetch User Profile
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        return NextResponse.json(user);

    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}
