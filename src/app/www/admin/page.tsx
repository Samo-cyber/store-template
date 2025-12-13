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
            const hasCustomCookie = document.cookie.includes('user_session');

            if (!session && !hasCustomCookie) {
                router.push('/login?next=/admin');
                return;
            }

            // 2. Check User Role via API
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const user = await res.json();

                    // Super Admin Redirect
                    if (user.role === 'super_admin') {
                        window.location.href = '/platform-admin';
                        return;
                    }

                    // Store Owner Redirect
                    // Fetch stores for this user
                    const { data: stores } = await supabase.from('stores').select('slug').eq('owner_id', user.id).limit(1);

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
                        return;
                    } else {
                        // No stores found, redirect to register
                        router.push('/register');
                        return;
                    }
                } else {
                    // Not authenticated
                    router.push('/login?next=/admin');
                }
            } catch (err) {
                console.error("Auth check failed", err);
                router.push('/login?next=/admin');
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
