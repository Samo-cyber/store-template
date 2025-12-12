"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface StoreAnalytics {
    store_id: string;
    store_name: string;
    store_slug: string;
    owner_email: string;
    total_revenue: number;
    total_orders: number;
    created_at: string;
}

export default function StoresPage() {
    const [stores, setStores] = useState<StoreAnalytics[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function loadStores() {
            try {
                const { data, error } = await supabase.rpc('get_all_stores_analytics');
                if (error) throw error;
                setStores(data as StoreAnalytics[]);
            } catch (error) {
                console.error('Error loading stores:', error);
            } finally {
                setLoading(false);
            }
        }

        loadStores();
    }, [supabase]);

    const filteredStores = stores.filter(store =>
        store.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.owner_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.store_slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">إدارة المتاجر</h1>
                    <p className="text-muted-foreground">عرض وإدارة جميع المتاجر المسجلة في المنصة.</p>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="بحث باسم المتجر، الرابط، أو البريد الإلكتروني..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md border-none shadow-none focus-visible:ring-0"
                />
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-medium text-slate-500">اسم المتجر</th>
                                <th className="px-6 py-4 font-medium text-slate-500">المالك</th>
                                <th className="px-6 py-4 font-medium text-slate-500">تاريخ الإنشاء</th>
                                <th className="px-6 py-4 font-medium text-slate-500">الطلبات</th>
                                <th className="px-6 py-4 font-medium text-slate-500">الإيرادات</th>
                                <th className="px-6 py-4 font-medium text-slate-500">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredStores.map((store) => (
                                <tr key={store.store_id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{store.store_name}</div>
                                        <div className="text-xs text-slate-500">{store.store_slug}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {store.owner_email || "غير معروف"}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {new Date(store.created_at).toLocaleDateString('ar-EG')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {store.total_orders}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-green-600">
                                        {store.total_revenue.toLocaleString()} ج.م
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/store/${store.store_slug}/admin`} target="_blank">
                                                <ExternalLink className="h-4 w-4 ml-2" />
                                                زيارة
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredStores.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        لا توجد نتائج مطابقة للبحث
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
