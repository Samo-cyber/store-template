"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, Mail, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next') || '/create-store';


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

            window.location.href = next;
        } catch (err: any) {
            setError(err.message || "حدث خطأ أثناء تسجيل الدخول");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        تسجيل الدخول
                    </h1>
                    <p className="text-slate-400">
                        سجل دخولك لإنشاء وإدارة متاجرك
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-lg">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">البريد الإلكتروني</label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pr-10 bg-slate-900/50 border-white/10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">كلمة المرور</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pr-10 bg-slate-900/50 border-white/10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button type="submit" className="w-full h-11" disabled={loading}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "تسجيل الدخول"}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-slate-950 px-2 text-slate-500">أو</span>
                                </div>
                            </div>

                            <Link href="/register" className="w-full">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full h-11 hover:bg-white/5"
                                >
                                    ليس لديك حساب؟ إنشاء متجر جديد
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
