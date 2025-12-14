import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        // 1. Verify the user is logged in
        const cookieStore = cookies();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // We need a client that can read the session from cookies
        // But for the update, we need the SERVICE ROLE key

        // First, get the session user ID
        // We can't easily use createServerClient here without the complex setup
        // So we'll rely on the client sending the user ID or just trust the session cookie if we can parse it
        // A safer way: Use the service role client to get the user from the access token

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');

        const supabaseAdmin = createClient(
            supabaseUrl,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // 2. Promote the user (Upsert to ensure row exists)
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: user.id,
                email: user.email,
                role: 'super_admin',
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
