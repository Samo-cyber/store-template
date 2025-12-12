"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2 } from "lucide-react";

export default function CreateStorePage() {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check if user is logged in
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // Redirect to login if not authenticated
                // In a real app, we might want to capture the intent and redirect back
                router.push('/login?next=/create-store');
                return;
            }

            // Create store
            const { data, error } = await supabase
                .from('stores')
                .insert([
                    {
                        name,
                        slug,
                        owner_id: session.user.id
                    }
                ])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') { // Unique violation for slug
                    alert("هذا الرابط مستخدم بالفعل، يرجى اختيار رابط آخر");
                } else {
                    alert("حدث خطأ أثناء إنشاء المتجر: " + error.message);
                }
                return;
            }

            // Redirect to the new store's admin dashboard
            // We need to redirect to the subdomain
            // e.g. slug.domain.com/admin
            // For localhost, we might redirect to slug.localhost:3000/admin

            const protocol = window.location.protocol;
            const host = window.location.host;
            // Use env var for root domain if available, otherwise fallback to current host
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || host.replace('www.', '');

            if (host.includes('localhost')) {
                alert(`تم إنشاء المتجر بنجاح! \nالرابط: http://${slug}.${rootDomain.split(':')[0]}:3000\n(تأكد من إعداد ملف hosts للوصول إليه محلياً)`);
            } else {
                // Production redirect
                window.location.href = `${protocol}//${slug}.${rootDomain}/admin`;
            }

        } catch (error: any) {
            console.error("Error creating store:", error);
            alert("حدث خطأ غير متوقع");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 bg-white/5 p-8 rounded-3xl border border-white/10">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">أنشئ متجرك الجديد</h1>
                    <p className="text-slate-400 mt-2">أدخل تفاصيل متجرك للبدء</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">اسم المتجر</label>
                        <Input
                            required
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                // Auto-generate slug
                                if (!slug) {
                                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                                }
                            }}
                            placeholder="مثال: متجر الأناقة"
                            className="bg-slate-900/50 border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">رابط المتجر (Slug)</label>
                        <div className="flex items-center gap-2 text-slate-400 bg-slate-900/50 border border-white/10 rounded-md px-3">
                            <span className="text-xs">.domain.com</span>
                            <input
                                required
                                value={slug}
                                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                                className="flex-1 bg-transparent border-none focus:ring-0 h-10 text-white text-right"
                                placeholder="my-store"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : "إنشاء المتجر"}
                    </Button>
                </form>
            </div>
        </main>
    );
}
