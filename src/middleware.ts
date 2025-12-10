import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If Supabase is not configured, allow access (Demo Mode)
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url_here') {
        return res
    }

    // Calculate cookie name to match createBrowserClient
    // Default is sb-<ref>-auth-token
    let cookieName = 'sb-auth-token'
    try {
        const url = new URL(supabaseUrl)
        const ref = url.hostname.split('.')[0]
        cookieName = `sb-${ref}-auth-token`
    } catch (e) {
        // Fallback or handle invalid URL
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: true,
            detectSessionInUrl: false,
            storage: {
                getItem: (key) => {
                    // supabase-js uses 'sb-<ref>-auth-token' as key by default? 
                    // No, it uses the key passed to it. 
                    // But createBrowserClient overrides this.
                    // We need to look for the cookie that createBrowserClient set.
                    // createBrowserClient sets a cookie named `sb-<ref>-auth-token`.
                    // We should try to read that specific cookie.

                    // Actually, let's try to read the cookie with the name we calculated.
                    const cookie = req.cookies.get(cookieName)
                    return cookie?.value ?? null
                },
                setItem: (key, value) => {
                    // We need to set the cookie on the response
                    res.cookies.set({
                        name: cookieName,
                        value,
                        domain: req.nextUrl.hostname === 'localhost' ? undefined : '.' + req.nextUrl.hostname,
                        path: '/',
                        sameSite: 'lax',
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 60 * 60 * 24 * 365 * 1000 // 1000 years? No, just a long time.
                    })
                },
                removeItem: (key) => {
                    res.cookies.set({
                        name: cookieName,
                        value: '',
                        maxAge: 0,
                        path: '/',
                    })
                }
            }
        }
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
                return NextResponse.redirect(new URL('/admin', req.url))
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
