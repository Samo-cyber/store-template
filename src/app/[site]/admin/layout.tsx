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

                // Check onboarding status
                const { data: storeData } = await supabase
                    .from('stores')
                    .select('onboarding_completed')
                    .eq('owner_id', session.user.id)
                    .single();

                if (storeData && !storeData.onboarding_completed && !pathname?.includes('/onboarding')) {
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
    }, [pathname, router, isLoginPage, supabase]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
