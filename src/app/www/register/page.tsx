"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Store, ArrowRight, LayoutTemplate, Palette } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "حدث خطأ أثناء إنشاء الحساب");
                return;
            }

            // Redirect to landing page so user can see the "Create Store" button
            window.location.href = '/';

        } catch (error: any) {
            console.error("Error registering:", error);
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

            <Link href="/" className="absolute top-8 right-8 z-20 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ArrowRight className="w-5 h-5" />
                <span>العودة للرئيسية</span>
            </Link>

            <div className="w-full max-w-lg space-y-8 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl z-10 shadow-2xl">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 mb-4 shadow-lg shadow-purple-500/20">
                        <Store className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">إنشاء حساب جديد</h1>
                    <p className="text-slate-400">انضم إلينا وابدأ رحلتك في التجارة الإلكترونية</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">البريد الإلكتروني</label>
                            <Input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="bg-slate-900/50 border-white/10 focus:border-purple-500/50 transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">كلمة المرور</label>
                            <Input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="bg-slate-900/50 border-white/10 focus:border-purple-500/50 transition-colors"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/20"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "إنشاء الحساب"}
                    </Button>

                    <div className="text-center text-sm text-slate-400">
                        لديك حساب بالفعل؟{" "}
                        <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                            تسجيل الدخول
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
