"use client";

import { useEffect, useState } from "react";
import { Loader2, DollarSign, ShoppingBag, Package, TrendingUp, AlertTriangle } from "lucide-react";
import {
    getDashboardStats,
    getMonthlySales,
    getTopProducts,
    DashboardStats,
    MonthlySales,
    TopProduct
} from "@/lib/analytics";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

import { getStoreBySlug } from "@/lib/stores";
import { SetupChecklist } from "@/components/admin/SetupChecklist";

export default function AdminDashboard({ params }: { params: { site: string } }) {
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        lowStockCount: 0
    });
    const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCustomized, setIsCustomized] = useState(false);

    const [store, setStore] = useState<any>(null);

    useEffect(() => {
        async function loadData() {
            try {
                // Fetch store first
                const storeData = await getStoreBySlug(params.site);

                if (!storeData) {
                    console.error('Store not found');
                    return;
                }
                setStore(storeData);

                // Check customization
                setIsCustomized(!!storeData.description && storeData.description.length > 0);

                const response = await fetch(`/api/analytics?storeId=${storeData.id}`);
                if (!response.ok) throw new Error('Failed to fetch analytics');

                const data = await response.json();

                setStats(data.stats);
                // Sort monthly sales
                const sortedSales = (data.monthlySales || []).sort((a: any, b: any) => a.month.localeCompare(b.month));
                setMonthlySales(sortedSales);
                setTopProducts(data.topProducts);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [params.site]);

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
                <h1 className="text-3xl font-bold tracking-tight">نظرة عامة</h1>
                <p className="text-muted-foreground">مرحباً بك في لوحة تحكم TARGO.</p>
            </div>

            <SetupChecklist
                storeId={store?.id}
                storeSlug={params.site}
                hasProducts={stats.totalProducts > 0}
                hasOrders={stats.totalOrders > 0}
                isCustomized={isCustomized}
                onboardingCompleted={store?.onboarding_completed}
            />

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground">إجمالي المبيعات</p>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} ج.م</h3>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground">إجمالي الطلبات</p>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground">عدد المنتجات</p>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-full text-purple-500">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-muted-foreground">تنبيهات المخزون</p>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-full text-orange-500">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">{stats.lowStockCount}</h3>
                            <p className="text-xs text-muted-foreground">منتجات قاربت على النفاذ</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Sales Chart */}
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 flex flex-col space-y-3">
                        <h3 className="font-semibold leading-none tracking-tight">المبيعات الشهرية</h3>
                        <p className="text-sm text-muted-foreground">نظرة عامة على الإيرادات خلال الأشهر الماضية</p>
                    </div>
                    <div className="p-6 pt-0 pl-2 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlySales}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="month"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: number) => [`${value.toLocaleString()} ج.م`, 'الإيرادات']}
                                />
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#8b5cf6"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 flex flex-col space-y-3">
                        <h3 className="font-semibold leading-none tracking-tight">المنتجات الأكثر مبيعاً</h3>
                        <p className="text-sm text-muted-foreground">أفضل 5 منتجات من حيث عدد مرات الشراء</p>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="space-y-8">
                            {topProducts.map((product) => (
                                <div key={product.product_id} className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                                        <img
                                            src={product.product_image}
                                            alt={product.product_title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="mr-4 space-y-1 flex-1">
                                        <p className="text-sm font-medium leading-none truncate max-w-[150px]">{product.product_title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {product.total_sold} عملية بيع
                                        </p>
                                    </div>
                                    <div className="font-medium text-sm">
                                        {product.total_revenue.toLocaleString()} ج.م
                                    </div>
                                </div>
                            ))}
                            {topProducts.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">لا توجد بيانات كافية</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
