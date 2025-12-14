"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { COOKIE_NAME } from "@/lib/auth-config";

export default function AdminLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { site: string };
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isDenied, setIsDenied] = useState(false);
    const [debugInfo, setDebugInfo] = useState<any>(null);

    // Safely initialize Supabase client
    const [supabase] = useState(() => process.env.NEXT_PUBLIC_SUPABASE_URL
        ? createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookieOptions: { name: COOKIE_NAME } }
        )
        : null);

    const isLoginPage = pathname === "/admin/login";

    useEffect(() => {
        const checkAuth = async () => {
            if (isLoginPage) {
                setIsLoading(false);
                return;
            }

            if (!supabase) {
                // Allow access if Supabase is not configured (demo mode)
                setIsLoading(false);
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    console.log("AdminLayout: No session found, redirecting to login");
                    router.push("/admin/login?source=client");
                    return;
                }

                // Check if user owns THIS specific store
                console.log(`AdminLayout: Checking ownership for store slug: ${params.site}`);
                const { data: storeData } = await supabase
                    .from('stores')
                    .select('owner_id, onboarding_completed')
                    .eq('slug', params.site)
                    .single();

                if (!storeData) {
                    console.log("AdminLayout: Store not found for slug:", params.site);
                    router.push("/"); // Or 404
                    return;
                }

                if (storeData.owner_id !== session.user.id) {
                    console.log(`AdminLayout: User ${session.user.id} does not own store ${params.site} (owner: ${storeData.owner_id})`);
                    setDebugInfo({
                        userId: session.user.id,
                        storeOwnerId: storeData.owner_id,
                        slug: params.site
                    });
                    setIsDenied(true);
                    setIsLoading(false);
                    return;
                }

                if (!storeData.onboarding_completed && !pathname?.includes('/onboarding')) {
                    if (pathname?.startsWith('/store/')) {
                        const slug = pathname.split('/')[2];
                        router.push(`/store/${slug}/admin/onboarding`);
                    } else {
                        router.push("/admin/onboarding");
                    }
                    return;
                }
            } catch (e) {
                console.error("Auth check failed", e);
                router.push("/admin/login?source=error");
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase?.auth.onAuthStateChange((event, session) => {
            console.log("Auth state changed:", event, session);
            if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
                if (!isLoginPage) {
                    console.log("AdminLayout: Auth event triggered redirect");
                    router.push("/admin/login?source=auth_event");
                }
            }
        }) ?? { data: { subscription: null } };

        return () => {
            subscription?.unsubscribe();
        };
    }, [pathname, router, isLoginPage, supabase, params.site]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isDenied) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center max-w-md">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">تم رفض الوصول</h1>
                    <p className="text-slate-400 mb-6">
                        هذا المتجر لا يتبع لحسابك الحالي.
                    </p>

                    <div className="mb-6 p-4 bg-black/30 rounded text-left text-xs font-mono text-slate-500 overflow-hidden" dir="ltr">
                        <p>User ID: {debugInfo?.userId}</p>
                        <p>Store Owner: {debugInfo?.storeOwnerId}</p>
                        <p>Slug: {debugInfo?.slug}</p>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            العودة للرئيسية
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-background flex-col md:flex-row">
            <AdminSidebar siteSlug={params.site} />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto pt-16 md:pt-8">
                {children}
            </main>
        </div>
    );
}
