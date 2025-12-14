"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isDenied, setIsDenied] = useState(false);

    const [supabase] = useState(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ));

    useEffect(() => {
        const checkAuth = async () => {
            try {
                console.log("SuperAdminLayout: Checking session...");
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    console.log("SuperAdminLayout: No session, redirecting to login");
                    router.push("/login?next=/admin");
                    return;
                }

                console.log("SuperAdminLayout: Session found for user:", session.user.id);

                // Verify Super Admin Role
                const { data: userRole, error } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.error("SuperAdminLayout: Error fetching role:", error);
                    setIsDenied(true);
                    setIsLoading(false);
                    return;
                }

                console.log("SuperAdminLayout: User role:", userRole?.role);

                if (userRole?.role !== 'super_admin') {
                    console.log("SuperAdminLayout: Not super_admin, access denied");
                    setIsDenied(true);
                    setIsLoading(false);
                    return;
                }

                setIsLoading(false);
            } catch (e) {
                console.error("Auth check failed", e);
                setIsDenied(true);
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router, supabase]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <span className="ml-2 text-slate-400">جاري التحقق من الصلاحيات...</span>
            </div>
        );
    }

    if (isDenied) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center max-w-md">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">تم رفض الوصول</h1>
                    <p className="text-slate-400 mb-6">
                        ليس لديك صلاحية للوصول إلى لوحة تحكم السوبر أدمن.
                        يرجى التأكد من تسجيل الدخول بالحساب الصحيح.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        العودة للرئيسية
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            {children}
        </div>
    );
}
