"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Users, Store, DollarSign, TrendingUp } from "lucide-react";
import { Loader2 } from "lucide-react";

interface PlatformStats {
    totalStores: number;
    totalUsers: number;
    totalRevenue: number;
}

export default function PlatformAdminDashboard() {
    const [stats, setStats] = useState<PlatformStats>({
        totalStores: 0,
        totalUsers: 0,
        totalRevenue: 0,
    });
    const [loading, setLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function loadStats() {
            try {
                const { data, error } = await supabase.rpc('get_platform_stats');
                if (error) throw error;
                setStats(data as PlatformStats);
            } catch (error) {
                console.error('Error loading platform stats:', error);
            } finally {
                setLoading(false);
            }
        }

        loadStats();
    }, [supabase]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">نظرة عامة على المنصة</h1>
                <p className="text-muted-foreground">إحصائيات شاملة لجميع المتاجر والمستخدمين.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-6 rounded-xl border bg-white shadow-sm">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground">إجمالي المتاجر</p>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
                            <Store className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">{stats.totalStores}</h3>
                            <p className="text-xs text-muted-foreground">متجر نشط</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl border bg-white shadow-sm">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground">إجمالي المستخدمين</p>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="p-3 bg-purple-500/10 rounded-full text-purple-500">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                            <p className="text-xs text-muted-foreground">مستخدم مسجل</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl border bg-white shadow-sm">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</p>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="p-3 bg-green-500/10 rounded-full text-green-500">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} ج.م</h3>
                            <p className="text-xs text-muted-foreground">من جميع المتاجر</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
