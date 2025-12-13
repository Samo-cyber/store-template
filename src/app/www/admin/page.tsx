"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2 } from "lucide-react";

export default function RootAdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthAndRedirect = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            // 1. Check Session
            const { data: { session } } = await supabase.auth.getSession();

            // Also check custom cookie if using custom auth
            const hasCustomCookie = document.cookie.includes('user_session');

            if (!session && !hasCustomCookie) {
                router.push('/login?next=/admin');
                return;
            }

            // 2. Get User's Stores
            // We need the user ID. If using Supabase Auth, it's session.user.id.
            // If using custom auth, we might need to decode the token or fetch from an API.
            // Since the client-side might not have the custom token decoded easily without a library,
            // let's try to fetch stores via an API endpoint or Supabase directly if RLS allows.

            // Attempt to fetch stores directly (assuming RLS allows "Users can view their own stores")
            // Note: For custom auth, we might need to rely on the API if RLS depends on `auth.uid()` which might be missing/different.
            // However, our custom auth sets a cookie. If we use `supabase-js` client, it might not send that cookie automatically 
            // unless we configured it to use that cookie name for auth, which we did in `src/lib/auth-config.ts`?
            // Actually, `createBrowserClient` uses `sb-access-token` by default.
            // Our custom auth uses `user_session`.

            // Let's use a simple API endpoint to get "my stores" to be safe and consistent with custom auth.
            // Or we can just try to fetch from 'stores' table. If it returns empty, maybe auth isn't working for direct DB access.

            // Let's try fetching from 'stores' first.
            const { data: stores, error } = await supabase.from('stores').select('slug').limit(1);

            if (stores && stores.length > 0) {
                const slug = stores[0].slug;
                const protocol = window.location.protocol;
                let rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || window.location.host.replace('www.', '');

                if (rootDomain) {
                    rootDomain = rootDomain.replace('https://', '').replace('http://', '');
                }

                // Redirect to the first store
                if (rootDomain?.includes('vercel.app')) {
                    window.location.href = `${protocol}//${rootDomain}/store/${slug}/admin`;
                } else {
                    window.location.href = `${protocol}//${slug}.${rootDomain}/admin`;
                }
            } else {
                // No stores found, redirect to create store
                router.push('/register');
            }
        };

        checkAuthAndRedirect();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
            <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
                <p className="text-slate-400">جاري توجيهك إلى لوحة التحكم...</p>
            </div>
        </div>
    );
}
