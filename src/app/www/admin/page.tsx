"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, Store, Users, DollarSign, ExternalLink, Home, Settings, Package, X, TrendingUp, Activity, ShoppingBag, AlertCircle, CheckCircle, Ban, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
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
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [growthData, setGrowthData] = useState<any[]>([]);
    const [activityFeed, setActivityFeed] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

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

            // 4. Load Charts Data
            const { data: revenue } = await supabase.rpc('get_platform_monthly_revenue');
            if (revenue) setRevenueData(revenue);

            const { data: growth } = await supabase.rpc('get_platform_growth');
            if (growth) setGrowthData(growth);

            // 5. Load Activity Feed
            const { data: activity } = await supabase.rpc('get_admin_activity_feed');
            if (activity) setActivityFeed(activity);

            // 6. Load Recent Orders
            const { data: orders } = await supabase.rpc('get_global_recent_orders');
            if (orders) setRecentOrders(orders);

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

    async function suspendStore(storeId: string) {
        if (!confirm("هل أنت متأكد من إيقاف هذا المتجر؟")) return;
        try {
            const { error } = await supabase.rpc('suspend_store', { p_store_id: storeId });
            if (error) throw error;
            loadDashboardData(); // Reload to update status
        } catch (error) {
            console.error("Error suspending store:", error);
            alert("حدث خطأ أثناء إيقاف المتجر");
        }
    }

    async function activateStore(storeId: string) {
        try {
            const { error } = await supabase.rpc('activate_store', { p_store_id: storeId });
            if (error) throw error;
            loadDashboardData(); // Reload to update status
        } catch (error) {
            console.error("Error activating store:", error);
            alert("حدث خطأ أثناء تفعيل المتجر");
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
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">لوحة تحكم الإدارة</h1>
                        <p className="text-slate-400">نظرة عامة على أداء المنصة والنمو</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5 text-slate-300 hover:text-white">
                                <Home className="w-4 h-4" />
                                الرئيسية
                            </Button>
                        </Link>
                        <Button onClick={loadDashboardData} variant="outline" className="border-white/10 hover:bg-white/5 text-slate-300 hover:text-white">
                            تحديث البيانات
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/10">
                                <Store className="w-6 h-6" />
                            </div>
                            <div className="text-slate-400">إجمالي المتاجر</div>
                        </div>
                        <div className="text-3xl font-bold">{stats?.totalStores || 0}</div>
                        <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>نشط حالياً</span>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="text-slate-400">إجمالي المستخدمين</div>
                        </div>
                        <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
                        <div className="text-xs text-blue-400 mt-2">مسجل في المنصة</div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-green-500/20 text-green-400 shadow-lg shadow-green-500/10">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div className="text-slate-400">إجمالي المبيعات</div>
                        </div>
                        <div className="text-3xl font-bold">{stats?.totalRevenue?.toLocaleString() || 0} ج.م</div>
                        <div className="text-xs text-green-400 mt-2">إيرادات تراكمية</div>
                    </div>

                    {/* Settings Card */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400 shadow-lg shadow-orange-500/10">
                                <Settings className="w-6 h-6" />
                            </div>
                            <div className="text-slate-400">إعدادات الموقع</div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">السماح بالتسجيل</span>
                                <div
                                    className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings?.allow_registration ? 'bg-green-500' : 'bg-slate-700'}`}
                                    onClick={() => updateSetting('allow_registration', !settings?.allow_registration)}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings?.allow_registration ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">وضع الصيانة</span>
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

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Chart */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-white">نمو الإيرادات</h3>
                            <p className="text-sm text-slate-400">تحليل الإيرادات الشهرية للمنصة</p>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value: number) => [`${value.toLocaleString()} ج.م`, 'الإيرادات']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Growth Chart */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-white">نمو المنصة</h3>
                            <p className="text-sm text-slate-400">المتاجر والمستخدمين الجدد شهرياً</p>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={growthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="new_stores" name="متاجر جديدة" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="new_users" name="مستخدمين جدد" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Activity & Orders Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Orders */}
                    <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-blue-400" />
                                    أحدث الطلبات
                                </h3>
                                <p className="text-sm text-slate-400">طلبات حية من جميع المتاجر</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-white/5 text-slate-400">
                                    <tr>
                                        <th className="p-4">العميل</th>
                                        <th className="p-4">المتجر</th>
                                        <th className="p-4">القيمة</th>
                                        <th className="p-4">الحالة</th>
                                        <th className="p-4">منذ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {recentOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500">لا توجد طلبات حديثة</td>
                                        </tr>
                                    ) : (
                                        recentOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-medium">{order.customer_name}</td>
                                                <td className="p-4 text-slate-400">{order.store_name}</td>
                                                <td className="p-4 font-bold text-green-400">{order.total_amount} ج.م</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                                        order.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                                            'bg-slate-500/10 text-slate-400'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-500 text-xs">
                                                    {new Date(order.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-400" />
                            <h3 className="text-lg font-bold text-white">سجل النشاط</h3>
                        </div>
                        <div className="space-y-6">
                            {activityFeed.length === 0 ? (
                                <div className="text-center text-slate-500 py-8">لا يوجد نشاط حديث</div>
                            ) : (
                                activityFeed.map((log) => (
                                    <div key={log.id} className="relative pl-4 border-l border-white/10 pb-2 last:pb-0">
                                        <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full ${log.type === 'new_store' ? 'bg-purple-500' :
                                            log.type === 'new_user' ? 'bg-blue-500' :
                                                log.type === 'new_order' ? 'bg-green-500' :
                                                    'bg-slate-500'
                                            }`} />
                                        <div className="text-sm text-slate-300 mb-1">{log.message}</div>
                                        <div className="text-xs text-slate-500">{log.time_ago}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Stores Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">المتاجر المسجلة</h2>
                            <p className="text-sm text-slate-400 mt-1">إدارة ومراقبة جميع المتاجر في المنصة</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-white/10 text-slate-300">تصدير CSV</Button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-white/5 text-slate-400 text-sm">
                                <tr>
                                    <th className="p-4 font-medium">اسم المتجر</th>
                                    <th className="p-4 font-medium">المالك</th>
                                    <th className="p-4 font-medium">المبيعات</th>
                                    <th className="p-4 font-medium">الطلبات</th>
                                    <th className="p-4 font-medium">الحالة</th>
                                    <th className="p-4 font-medium">تاريخ الإنشاء</th>
                                    <th className="p-4 font-medium">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stores.map((store) => (
                                    <tr key={store.store_id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs font-bold">
                                                    {store.store_name.charAt(0)}
                                                </div>
                                                {store.store_name}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-400">{store.owner_email}</td>
                                        <td className="p-4 font-bold text-green-400">{store.total_revenue.toLocaleString()} ج.م</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs">
                                                {store.total_orders} طلب
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs flex w-fit items-center gap-1 ${store.status === 'suspended' ? 'bg-red-500/10 text-red-400' :
                                                store.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-green-500/10 text-green-400'
                                                }`}>
                                                {store.status === 'suspended' ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                                {store.status === 'suspended' ? 'موقوف' : 'نشط'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400">
                                            {new Date(store.created_at).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="p-4 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={`${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://${store.store_slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10">
                                                    <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            </a>

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
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

                                            {store.status === 'suspended' ? (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                                    onClick={() => activateStore(store.store_id)}
                                                    title="تفعيل المتجر"
                                                >
                                                    <Play className="w-4 h-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                    onClick={() => suspendStore(store.store_id)}
                                                    title="إيقاف المتجر"
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </Button>
                                            )}
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
