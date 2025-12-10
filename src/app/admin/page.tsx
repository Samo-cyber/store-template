"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, DollarSign, ShoppingBag, Package } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                if (!supabase) {
                    setStats({
                        totalRevenue: 0,
                        totalOrders: 0,
                        totalProducts: 0,
                    });
                    setLoading(false);
                    return;
                }

                // Fetch Orders Count & Revenue
                const { data: orders } = await supabase
                    .from('orders')
                    .select('total_amount');

                const totalOrders = orders?.length || 0;
                const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

                // Fetch Products Count
                const { count: productsCount } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true });

                setStats({
                    totalRevenue,
                    totalOrders,
                    totalProducts: productsCount || 0,
                });
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setLoading(false);
            }
        }

        loadStats();
    }, []);

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
                <p className="text-muted-foreground">مرحباً بك في لوحة تحكم برستيج.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">إجمالي المبيعات</p>
                            <h3 className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} ج.م</h3>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">إجمالي الطلبات</p>
                            <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-full text-purple-500">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">عدد المنتجات</p>
                            <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
