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
    const [debugInfo, setDebugInfo] = useState<any>(null);

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

                // Verify Super Admin Role (Check public.admins)
                const { data: adminUser, error } = await supabase
                    .from('admins')
                    .select('id')
                    .eq('id', session.user.id)
                    .single();

                if (error || !adminUser) {
                    console.error("SuperAdminLayout: Not found in admins table");
                    setIsDenied(true);
                    setIsLoading(false);
                    return;
                }

                console.log("SuperAdminLayout: User is admin");
                setDebugInfo({ userId: session.user.id, role: 'super_admin' });

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

                    {/* Debug Info */}
                    <div className="mb-6 p-4 bg-black/30 rounded text-left text-xs font-mono text-slate-500 overflow-hidden">
                        <p>User ID: {debugInfo?.userId}</p>
                        <p>Role: {debugInfo?.role || 'null'}</p>
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

    return (
        <div className="min-h-screen bg-slate-950">
            {children}
        </div>
    );
}
