"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Store, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CreateStorePage() {
    const [storeName, setStoreName] = useState("");
    const [storeSlug, setStoreSlug] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/stores/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeName, storeSlug }),
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

            if (rootDomain?.includes('vercel.app')) {
                window.location.href = `${protocol}//${rootDomain}/store/${storeSlug}/admin`;
            } else {
                window.location.href = `${protocol}//${storeSlug}.${rootDomain}/admin`;
            }

        } catch (error: any) {
            console.error("Error creating store:", error);
            alert("حدث خطأ غير متوقع");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]" />
            </div>

            <Link href="/profile" className="absolute top-8 right-8 z-20 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ArrowRight className="w-5 h-5" />
                <span>رجوع</span>
            </Link>

            <div className="w-full max-w-lg space-y-8 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl z-10 shadow-2xl">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 mb-4 shadow-lg shadow-purple-500/20">
                        <Store className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">أنشئ متجرك</h1>
                    <p className="text-slate-400">أدخل تفاصيل متجرك للبدء</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">اسم المتجر</label>
                            <Input
                                required
                                value={storeName}
                                onChange={(e) => {
                                    setStoreName(e.target.value);
                                    if (!storeSlug) {
                                        setStoreSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                                    }
                                }}
                                placeholder="مثال: متجر الأناقة"
                                className="bg-slate-900/50 border-white/10 focus:border-purple-500/50 transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">رابط المتجر (Slug)</label>
                            <div className="flex items-center gap-2 text-slate-400 bg-slate-900/50 border border-white/10 rounded-md px-3 focus-within:border-purple-500/50 transition-colors">
                                <span className="text-xs text-slate-500">.domain.com</span>
                                <input
                                    required
                                    value={storeSlug}
                                    onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                                    className="flex-1 bg-transparent border-none focus:ring-0 h-10 text-white text-right placeholder:text-slate-600"
                                    placeholder="my-store"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/20"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "إنشاء المتجر"}
                    </Button>
                </form>
            </div>
        </main>
    );
}
