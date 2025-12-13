"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Save } from "lucide-react";
import { COOKIE_NAME } from "@/lib/auth-config";
import { getStoreBySlug } from "@/lib/stores";

export default function AdminSettingsPage({ params }: { params: { site: string } }) {
    const [storeName, setStoreName] = useState("");
    const [storeSlug, setStoreSlug] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [storeId, setStoreId] = useState<string | null>(null);

    // Safely initialize Supabase client
    const [supabase] = useState(() => process.env.NEXT_PUBLIC_SUPABASE_URL
        ? createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookieOptions: { name: COOKIE_NAME } }
        )
        : null);

    useEffect(() => {
        loadStoreData();
    }, [params.site]);

    async function loadStoreData() {
        setLoading(true);
        try {
            const store = await getStoreBySlug(params.site);
            if (store) {
                setStoreName(store.name);
                setStoreSlug(store.slug);
                setStoreId(store.id);
            }
        } catch (error) {
            console.error("Error loading store data:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!storeId || !supabase) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('stores')
                .update({ name: storeName })
                .eq('id', storeId);

            if (error) throw error;
            alert("تم حفظ التغييرات بنجاح");
        } catch (error) {
            console.error("Error updating store:", error);
            alert("حدث خطأ أثناء الحفظ");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">إعدادات المتجر</h1>
                <p className="text-muted-foreground">إدارة تفاصيل متجرك</p>
            </div>

            <div className="p-6 rounded-xl border bg-card shadow-sm">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">اسم المتجر</label>
                        <Input
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">رابط المتجر (Slug)</label>
                        <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 border rounded-md px-3 h-10">
                            <span className="text-xs">.domain.com</span>
                            <span className="flex-1 text-right font-mono">{storeSlug}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">لا يمكن تغيير رابط المتجر حالياً</p>
                    </div>

                    <Button type="submit" disabled={saving} className="gap-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        حفظ التغييرات
                    </Button>
                </form>
            </div>
        </div>
    );
}
