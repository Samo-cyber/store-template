"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next');


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // Redirect logic
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
                return;
            }

            if (next) {
                window.location.href = next;
                return;
            }

            // Redirect to landing page by default so user can see the "Dashboard" button
            // unless it's a super admin who might want to go to /admin directly (handled by data.redirectUrl)
            window.location.href = '/';

        } catch (err: any) {
            setError(err.message || "حدث خطأ أثناء تسجيل الدخول");
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

            <div className="w-full max-w-md space-y-8 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl z-10 shadow-2xl">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 mb-4 shadow-lg shadow-purple-500/20">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">تسجيل الدخول</h1>
                    <p className="text-slate-400">مرحباً بك مجدداً في TARGO</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg text-center border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">البريد الإلكتروني</label>
                            <Input
                                type="email"
                                placeholder="name@example.com"
                                className="bg-slate-900/50 border-white/10 focus:border-purple-500/50 transition-colors"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">كلمة المرور</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="bg-slate-900/50 border-white/10 focus:border-purple-500/50 transition-colors"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/20"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "تسجيل الدخول"}
                    </Button>

                    <div className="text-center text-sm text-slate-400">
                        ليس لديك حساب؟{" "}
                        <Link href="/register" className="text-purple-400 hover:text-purple-300 transition-colors">
                            إنشاء متجر جديد
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
