"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, Store, Users, DollarSign, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [supabase] = useState(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ));

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        setLoading(true);

        try {
            // 1. Load Stats
            const { data: statsData, error: statsError } = await supabase.rpc('get_platform_stats');
            if (statsData) setStats(statsData);

            // 2. Load Stores
            const { data: storesData, error: storesError } = await supabase.rpc('get_all_stores_analytics');
            if (storesData) setStores(storesData);

        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">لوحة تحكم الإدارة</h1>
                        <p className="text-slate-400">نظرة عامة على المنصة</p>
                    </div>
                    <Button onClick={loadDashboardData} variant="outline" className="border-white/10 hover:bg-white/5">
                        تحديث البيانات
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                                <Store className="w-6 h-6" />
                            </div>
                            <div className="text-slate-400">إجمالي المتاجر</div>
                        </div>
                        <div className="text-3xl font-bold">{stats?.totalStores || 0}</div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="text-slate-400">إجمالي المستخدمين</div>
                        </div>
                        <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-green-500/20 text-green-400">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div className="text-slate-400">إجمالي المبيعات</div>
                        </div>
                        <div className="text-3xl font-bold">{stats?.totalRevenue || 0} ج.م</div>
                    </div>
                </div>

                {/* Stores Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold">المتاجر المسجلة</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-white/5 text-slate-400 text-sm">
                                <tr>
                                    <th className="p-4 font-medium">اسم المتجر</th>
                                    <th className="p-4 font-medium">المالك</th>
                                    <th className="p-4 font-medium">المبيعات</th>
                                    <th className="p-4 font-medium">الطلبات</th>
                                    <th className="p-4 font-medium">تاريخ الإنشاء</th>
                                    <th className="p-4 font-medium">رابط</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stores.map((store) => (
                                    <tr key={store.store_id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-medium">{store.store_name}</td>
                                        <td className="p-4 text-slate-400">{store.owner_email}</td>
                                        <td className="p-4 font-bold text-green-400">{store.total_revenue} ج.م</td>
                                        <td className="p-4">{store.total_orders}</td>
                                        <td className="p-4 text-slate-400">
                                            {new Date(store.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="p-4">
                                            <a
                                                href={`http://${store.store_slug}.localhost:3000`} // Adjust for production
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-purple-400 hover:text-purple-300"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
