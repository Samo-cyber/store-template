import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    // This API is disabled for security reasons.
    // Use the Supabase SQL Editor to promote users manually.
    return NextResponse.json({ error: 'This endpoint is disabled.' }, { status: 403 });
}
