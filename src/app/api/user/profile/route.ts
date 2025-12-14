import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function getUser(request: Request) {
    const cookieStore = cookies();
    const token = cookieStore.get('user_session')?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function GET(request: Request) {
    try {
        const userPayload = await getUser(request);
        if (!userPayload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, email, created_at, full_name, phone, bio')
            .eq('id', userPayload.userId)
            .single();

        if (error) throw error;

        return NextResponse.json(user);
    } catch (error: any) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const userPayload = await getUser(request);
        if (!userPayload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { email, password, currentPassword, full_name, phone, bio } = body;

        // 1. Verify current password if changing sensitive info
        const { data: currentUser } = await supabaseAdmin
            .from('users')
            .select('password_hash')
            .eq('id', userPayload.userId)
            .single();

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (currentPassword) {
            const isValid = await bcrypt.compare(currentPassword, currentUser.password_hash);
            if (!isValid) {
                return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 });
            }
        } else if (password || (email && email !== userPayload.email)) {
            // Require current password for changes
            return NextResponse.json({ error: 'يرجى إدخال كلمة المرور الحالية لتأكيد التغييرات' }, { status: 400 });
        }

        const updates: any = {};
        if (email) updates.email = email;
        if (full_name !== undefined) updates.full_name = full_name;
        if (phone !== undefined) updates.phone = phone;
        if (bio !== undefined) updates.bio = bio;

        if (password) {
            updates.password_hash = await bcrypt.hash(password, 10);
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ message: 'No changes requested' });
        }

        const { data, error } = await supabaseAdmin
            .from('users')
            .update(updates)
            .eq('id', userPayload.userId)
            .select('id, email, created_at, full_name, phone, bio')
            .single();

        if (error) throw error;

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
