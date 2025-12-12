"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2 } from "lucide-react";

export default function CreateStorePage() {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check for session cookie
        const hasSession = document.cookie.includes('user_session');
        if (!hasSession) {
            router.push('/login?next=/create-store');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/stores/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, slug }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "حدث خطأ أثناء إنشاء المتجر");
                return;
            }

            // Redirect to the new store's admin dashboard
            const protocol = window.location.protocol;
            let rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || window.location.host.replace('www.', '');
            if (rootDomain) {
                rootDomain = rootDomain.replace('https://', '').replace('http://', '');
            }

            // In production, we redirect to the subdomain
            if (rootDomain?.includes('vercel.app')) {
                // Fallback for Vercel free domains: use path-based routing
                window.location.href = `${protocol}//${rootDomain}/store/${slug}/admin`;
            } else {
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
