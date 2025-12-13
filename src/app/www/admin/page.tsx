"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, Store, Users, DollarSign, ExternalLink, Home, Settings, Package, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog";

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);
    const [selectedStoreProducts, setSelectedStoreProducts] = useState<any[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);

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
            const { data: statsData } = await supabase.rpc('get_platform_stats');
            if (statsData) setStats(statsData);

            // 2. Load Stores
            const { data: storesData } = await supabase.rpc('get_all_stores_analytics');
            if (storesData) setStores(storesData);

            // 3. Load Settings
            const { data: settingsData } = await supabase
                .from('platform_settings')
                .select('*')
                .single();
            if (settingsData) setSettings(settingsData);

        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setLoading(false);
        }
    }

    async function loadStoreProducts(storeId: string) {
        setProductsLoading(true);
        setSelectedStoreProducts([]);
        try {
            const { data } = await supabase.rpc('get_store_products_admin', { p_store_id: storeId });
            if (data) setSelectedStoreProducts(data);
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setProductsLoading(false);
        }
    }

    async function updateSetting(key: string, value: boolean) {
        if (!settings) return;

        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings); // Optimistic update

        const { error } = await supabase
            .from('platform_settings')
            .update({ [key]: value })
            .eq('id', 1);

        if (error) {
            console.error("Error updating settings:", error);
            // Revert on error
            loadDashboardData();
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
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">لوحة تحكم الإدارة</h1>
                        <p className="text-slate-400">نظرة عامة على المنصة</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
                                <Home className="w-4 h-4" />
                                الرئيسية
                            </Button>
                        </Link>
                        <Button onClick={loadDashboardData} variant="outline" className="border-white/10 hover:bg-white/5">
                            تحديث البيانات
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

                    {/* Settings Card */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400">
                                <Settings className="w-6 h-6" />
                            </div>
                            <div className="text-slate-400">إعدادات الموقع</div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">السماح بالتسجيل</span>
                                <div
                                    className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings?.allow_registration ? 'bg-green-500' : 'bg-slate-700'}`}
                                    onClick={() => updateSetting('allow_registration', !settings?.allow_registration)}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings?.allow_registration ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">وضع الصيانة</span>
                                <div
                                    className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings?.maintenance_mode ? 'bg-green-500' : 'bg-slate-700'}`}
                                    onClick={() => updateSetting('maintenance_mode', !settings?.maintenance_mode)}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings?.maintenance_mode ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        </div>
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
                                    <th className="p-4 font-medium">إجراءات</th>
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
                                        <td className="p-4 flex items-center gap-2">
                                            <a
                                                href={`http://${store.store_slug}.localhost:3000`} // Adjust for production
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-purple-400 hover:text-purple-300">
                                                    <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            </a>

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-blue-400 hover:text-blue-300"
                                                        onClick={() => loadStoreProducts(store.store_id)}
                                                    >
                                                        <Package className="w-4 h-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-3xl bg-slate-900 border-white/10 text-white">
                                                    <DialogHeader>
                                                        <DialogTitle>منتجات المتجر: {store.store_name}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="mt-4">
                                                        {productsLoading ? (
                                                            <div className="flex justify-center p-8">
                                                                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                                            </div>
                                                        ) : selectedStoreProducts.length === 0 ? (
                                                            <div className="text-center p-8 text-slate-400">
                                                                لا توجد منتجات في هذا المتجر
                                                            </div>
                                                        ) : (
                                                            <div className="max-h-[60vh] overflow-y-auto">
                                                                <table className="w-full text-right text-sm">
                                                                    <thead className="bg-white/5 text-slate-400 sticky top-0">
                                                                        <tr>
                                                                            <th className="p-3">الصورة</th>
                                                                            <th className="p-3">الاسم</th>
                                                                            <th className="p-3">السعر</th>
                                                                            <th className="p-3">القسم</th>
                                                                            <th className="p-3">المخزون</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-white/5">
                                                                        {selectedStoreProducts.map((product) => (
                                                                            <tr key={product.id}>
                                                                                <td className="p-3">
                                                                                    <div className="w-10 h-10 rounded bg-white/10 overflow-hidden">
                                                                                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                                                                    </div>
                                                                                </td>
                                                                                <td className="p-3">{product.title}</td>
                                                                                <td className="p-3">{product.price} ج.م</td>
                                                                                <td className="p-3">
                                                                                    <span className="px-2 py-1 rounded-full bg-white/10 text-xs">
                                                                                        {product.category}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="p-3">{product.stock}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
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
