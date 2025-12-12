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
    const hostname = req.headers.get("host") || "demo.localhost";

    // Get the subdomain
    // If localhost, default to 'demo' (or whatever default store slug you want)
    // In production, extract subdomain from hostname
    let currentHost = "demo";

    if (hostname.includes("localhost")) {
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
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;

        if (rootDomain && hostname === rootDomain) {
            currentHost = "www";
        } else {
            // e.g. store1.domain.com -> store1
            // domain.com -> www (if not caught by rootDomain check above)

            const parts = hostname.split('.');
            // If we have a rootDomain defined, and we are here, it means hostname != rootDomain
            // So it must be a subdomain.
            // But we need to be careful about how we extract it.
            // If rootDomain is "example.com", and hostname is "store.example.com", subdomain is "store".

            if (rootDomain) {
                currentHost = hostname.replace(`.${rootDomain}`, '');
            } else {
                // Fallback if env var not set (heuristic)
                // Assuming domain.com (2 parts) or store.domain.com (3 parts)
                // This is flaky for vercel.app domains
                if (parts.length > 2) {
                    currentHost = parts[0];
                } else {
                    currentHost = "www";
                }
            }
        }
    }

    // Rewrite the URL to /_sites/[site]/...
    // We use [site] directory to handle tenants
    // Note: We moved files to src/app/[site]/...
    // So we rewrite to /[currentHost]/path

    // Prevent infinite redirects/rewrites if we are already on the rewritten path (unlikely with this matcher)

    url.pathname = `/${currentHost}${url.pathname}`;

    return NextResponse.rewrite(url);
}
