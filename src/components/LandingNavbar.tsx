"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Store, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface LandingNavbarProps {
    user?: {
        id: string;
        email: string;
        role?: string;
    } | null;
    storeSlug?: string | null;
}

export default function LandingNavbar({ user, storeSlug }: LandingNavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        // Clear cookies via API or client-side if possible (but HttpOnly cookies need API)
        // Since we don't have a logout API yet, we can try to expire the cookie or redirect to a logout route.
        // Let's assume we need to redirect to /login which handles clearing or we just overwrite it?
        // Actually, best practice is a logout endpoint.
        // For now, let's just redirect to login and let the user know.
        // Or better, create a logout route quickly? 
        // I'll just use document.cookie to clear if it wasn't HttpOnly, but it IS HttpOnly.
        // So I need a server action or API route.
        // I'll add a simple fetch to /api/auth/logout (which I should create) or just redirect to /login and hope it clears?
        // No, /login doesn't clear.
        // I will create a logout route later or now?
        // Let's just redirect to /login for now, but ideally we should clear the cookie.
        // I'll add a TODO.

        // Temporary: Just redirect to login, user might still be logged in.
        // Wait, I can't leave it like that.
        // I'll use a client-side trick: set the cookie to empty with past expiry?
        // I can't touch HttpOnly cookies from JS.
        // So I MUST have an API route.
        // I'll assume /api/auth/logout exists or I will create it.
        // I will create it in the next step.

        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.refresh();
            window.location.href = '/';
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-4" : "bg-transparent py-6"
                }`}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all">
                        <Store className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        برستيج
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        المميزات
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        الأسعار
                    </Link>
                    <Link href="#about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        عن المنصة
                    </Link>
                </div>

                {/* Auth Buttons / User Menu */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                            >
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-slate-200 px-2">{user.email.split('@')[0]}</span>
                            </button>

                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                                    >
                                        <div className="p-1">
                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                                            >
                                                <User className="w-4 h-4" />
                                                الملف الشخصي
                                            </Link>
                                            <Link
                                                href={user.role === 'super_admin' ? '/admin' : (storeSlug ? `/store/${storeSlug}/admin` : '/create-store')}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                لوحة التحكم
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                تسجيل الخروج
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5">
                                    تسجيل الدخول
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-white text-slate-950 hover:bg-slate-200 font-semibold rounded-full px-6">
                                    ابدأ مجاناً
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-slate-300 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-slate-950 border-b border-white/10 overflow-hidden"
                    >
                        <div className="p-4 space-y-4">
                            <Link href="#features" className="block text-slate-300 hover:text-white py-2">المميزات</Link>
                            <Link href="#pricing" className="block text-slate-300 hover:text-white py-2">الأسعار</Link>
                            <div className="border-t border-white/10 pt-4 space-y-4">
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span>{user.email}</span>
                                        </div>
                                        <Link href={user.role === 'super_admin' ? '/admin' : (storeSlug ? `/store/${storeSlug}/admin` : '/create-store')}>
                                            <Button className="w-full justify-start gap-2" variant="outline">
                                                <LayoutDashboard className="w-4 h-4" />
                                                لوحة التحكم
                                            </Button>
                                        </Link>
                                        <Button
                                            onClick={handleLogout}
                                            className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            variant="ghost"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            تسجيل الخروج
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="block">
                                            <Button variant="ghost" className="w-full justify-start">تسجيل الدخول</Button>
                                        </Link>
                                        <Link href="/register" className="block">
                                            <Button className="w-full bg-white text-slate-950 hover:bg-slate-200">ابدأ مجاناً</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
