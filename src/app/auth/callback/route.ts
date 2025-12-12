import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Default next is create-store for new users
    const next = searchParams.get('next') ?? '/create-store'

    if (code) {
        const cookieStore = cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.delete({ name, ...options })
                    },
                },
            }
        )
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && session) {
            // Smart Redirect Logic
            try {
                // 1. Fetch User Profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()

                // 2. Handle Roles
                if (profile?.role === 'super_admin') {
                    return NextResponse.redirect(`${origin}/platform-admin`)
                }

                if (profile?.role === 'store_owner') {
                    // Fetch their store to get the slug
                    const { data: store } = await supabase
                        .from('stores')
                        .select('slug')
                        .eq('owner_id', session.user.id)
                        .single()

                    if (store) {
                        // Redirect to store admin
                        // Check for Vercel domain workaround
                        const protocol = request.headers.get('x-forwarded-proto') || 'http';
                        const host = request.headers.get('host') || '';
                        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || host.replace('www.', '');

                        // Clean root domain
                        const cleanRootDomain = rootDomain.replace('https://', '').replace('http://', '');

                        if (cleanRootDomain.includes('vercel.app')) {
                            return NextResponse.redirect(`${protocol}://${cleanRootDomain}/store/${store.slug}/admin`)
                        } else {
                            return NextResponse.redirect(`${protocol}://${store.slug}.${cleanRootDomain}/admin`)
                        }
                    }
                }

                // Default: New User or User without store -> Create Store
                return NextResponse.redirect(`${origin}/create-store`)

            } catch (err) {
                console.error('Error in smart redirect:', err)
                // Fallback
                return NextResponse.redirect(`${origin}/create-store`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
