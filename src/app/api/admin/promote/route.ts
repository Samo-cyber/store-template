import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        console.log("Promote API: Started");
        // 1. Verify the user is logged in
        const cookieStore = cookies();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            console.error("Promote API: Missing SUPABASE_SERVICE_ROLE_KEY");
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            console.error("Promote API: No authorization header");
            return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');

        const supabaseAdmin = createClient(
            supabaseUrl,
            serviceRoleKey
        );

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            console.error("Promote API: Invalid token or user not found", authError);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        console.log("Promote API: User found", user.id, user.email);

        // 2. Promote the user (Upsert to ensure row exists)
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: user.id,
                email: user.email,
                role: 'super_admin',
                password_hash: 'supabase_managed_account' // Placeholder for Supabase Auth users
            }, { onConflict: 'id' });

        if (updateError) {
            console.error("Promote API: DB Update Error", updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        console.log("Promote API: Success");
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Promote API: Unexpected Error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
