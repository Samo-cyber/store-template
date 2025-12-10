import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

type CookieOptions = {
    name?: string
    value?: string
    maxAge?: number
    domain?: string
    path?: string
    expires?: Date
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'lax' | 'strict' | 'none'
    priority?: 'low' | 'medium' | 'high'
}

export const createMiddlewareClient = (
    { req, res }: { req: NextRequest; res: NextResponse },
    { supabaseUrl, supabaseKey }: { supabaseUrl: string; supabaseKey: string }
) => {
    return createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: true,
            storage: {
                getItem: (key) => {
                    return req.cookies.get(key)?.value ?? null
                },
                setItem: (key, value, options?: CookieOptions) => {
                    req.cookies.set({
                        name: key,
                        value,
                        ...(options as any),
                    })
                    res.cookies.set({
                        name: key,
                        value,
                        ...(options as any),
                    })
                },
                removeItem: (key, options?: CookieOptions) => {
                    req.cookies.set({
                        name: key,
                        value: '',
                        ...(options as any),
                        maxAge: 0,
                    })
                    res.cookies.set({
                        name: key,
                        value: '',
                        ...(options as any),
                        maxAge: 0,
                    })
                },
            },
        },
    })
}
