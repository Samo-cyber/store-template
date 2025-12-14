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

    // 1. Determine Hostname (Subdomain/Custom Domain)
    let currentHost = "demo";
    if (process.env.NODE_ENV === 'development' && hostname.includes("localhost")) {
        const parts = hostname.split('.');
        if (parts.length > 1 && parts[0] !== 'localhost') {
            currentHost = parts[0];
        } else {
            currentHost = "www";
        }
    } else {
        let rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
        if (rootDomain) {
            rootDomain = rootDomain.replace('https://', '').replace('http://', '');
        }

        if (rootDomain && hostname === rootDomain) {
            // Special case for testing on Vercel without custom domain
            if (url.pathname.startsWith('/store/')) {
                const pathParts = url.pathname.split('/');
                const storeSlug = pathParts[2];
                const newPath = pathParts.slice(3).join('/');
                url.pathname = `/${storeSlug}/${newPath}`;
                return NextResponse.rewrite(url);
            }
            currentHost = "www";
        } else {
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

    // 2. Identify Route Types
    const isSuperAdminRoute = currentHost === 'www' && url.pathname.startsWith('/admin');
    const isStoreAdminRoute = currentHost !== 'www' && url.pathname.startsWith('/admin');
    const isLoginPage = url.pathname === '/login' || url.pathname === '/admin/login';
    const isProtected = (isSuperAdminRoute || isStoreAdminRoute) && !isLoginPage;

    // 3. Protection Logic
    if (isProtected) {
        if (!userSession) {
            const loginUrl = new URL('/login', req.url);
            loginUrl.searchParams.set('next', url.pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // 4. Rewrite URL
    url.pathname = `/${currentHost}${url.pathname}`;

    return NextResponse.rewrite(url);
}
