import { createMiddlewareClient } from './lib/supabase-middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res }, {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    // Protect admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
        // Allow access to login page
        if (req.nextUrl.pathname === '/admin/login') {
            // If already logged in, redirect to admin dashboard
            if (session) {
                return NextResponse.redirect(new URL('/admin/orders', req.url))
            }
            return res
        }

        // Redirect unauthenticated users to login page
        if (!session) {
            return NextResponse.redirect(new URL('/admin/login', req.url))
        }
    }

    return res
}

export const config = {
    matcher: ['/admin/:path*'],
}
