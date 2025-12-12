import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        "/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)",
    ],
};

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get("host") || process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost";
    const userSession = req.cookies.get('user_session');
    const sbToken = req.cookies.get('sb-access-token') || req.cookies.get('sb-refresh-token'); // Check for Supabase token

    // Protected Routes Logic
    const isProtected = url.pathname.startsWith('/create-store') ||
        (url.pathname.includes('/admin') && !url.pathname.includes('/login'));

    // Super Admin Route
    const isSuperAdminRoute = url.pathname.startsWith('/platform-admin');

    if (isSuperAdminRoute) {
        // Super Admin must have Supabase Token (handled by Supabase Auth)
        // We can let the client-side check handle the specific role, but basic auth check here is good
        // For now, we rely on the layout.tsx check for role, but we could check token existence here
    }

    if (isProtected) {
        // Check for Custom User Session
        if (!userSession) {
            // Redirect to login
            const loginUrl = new URL('/login', req.url);
            loginUrl.searchParams.set('next', url.pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Get the subdomain
    // If localhost, default to 'demo' (or whatever default store slug you want)
    // In production, extract subdomain from hostname
    let currentHost = "demo";

    if (process.env.NODE_ENV === 'development' && hostname.includes("localhost")) {
        // For local development, you can use subdomains if you edit /etc/hosts
        // e.g. store1.localhost
        const parts = hostname.split('.');
        if (parts.length > 1 && parts[0] !== 'localhost') {
            currentHost = parts[0];
        } else {
            // Default to 'www' for localhost:3000 to show landing page
            currentHost = "www";
        }
    } else {
        // Production logic
        let rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
        if (rootDomain) {
            rootDomain = rootDomain.replace('https://', '').replace('http://', '');
        }

        if (rootDomain && hostname === rootDomain) {
            // Special case for testing on Vercel without custom domain
            // Allow accessing stores via domain.com/store/slug
            if (url.pathname.startsWith('/store/')) {
                // /store/store1/dashboard -> /store1/dashboard
                const pathParts = url.pathname.split('/');
                const storeSlug = pathParts[2]; // store1
                const newPath = pathParts.slice(3).join('/');

                url.pathname = `/${storeSlug}/${newPath}`;
                return NextResponse.rewrite(url);
            }

            currentHost = "www";
        } else {
            // e.g. store1.domain.com -> store1
            // domain.com -> www (if not caught by rootDomain check above)
            const parts = hostname.split('.');
            if (rootDomain) {
                currentHost = hostname.replace(`.${rootDomain}`, '');
            } else {
                if (parts.length > 2) {
                    currentHost = parts[0];
                } else {
                    currentHost = "www";
                }
            }
        }
    }

    // Rewrite the URL to /_sites/[site]/...
    url.pathname = `/${currentHost}${url.pathname}`;

    return NextResponse.rewrite(url);
}
