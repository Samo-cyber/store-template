"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { COOKIE_NAME } from "@/lib/auth-config";

const navItems = [
    {
        title: "نظرة عامة",
        href: "/platform-admin",
        icon: LayoutDashboard,
    },
    {
        title: "المتاجر",
        href: "/platform-admin/stores",
        icon: Store,
    },
];

export default function PlatformAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [supabase] = useState(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookieOptions: { name: COOKIE_NAME } }
    ));

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/admin/login");
                return;
            }

            // Verify Super Admin Role
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (profile?.role !== 'super_admin') {
                // Redirect unauthorized users
                router.push("/");
                return;
            }

            setIsLoading(false);
        };

        checkAuth();
    }, [supabase, router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
    };

    const toggleSidebar = () => setIsOpen(!isOpen);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex min-h-screen bg-background flex-col md:flex-row">
            {/* Mobile Toggle Button */}
            <div className="md:hidden fixed top-4 right-4 z-50">
                <Button variant="outline" size="icon" onClick={toggleSidebar} className="bg-background">
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={cn(
                "fixed inset-y-0 right-0 z-40 w-64 bg-slate-900 text-white border-l border-white/10 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:flex md:flex-col",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold tracking-tight text-white">إدارة المنصة</h2>
                    <p className="text-sm text-slate-400">لوحة التحكم الرئيسية</p>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-white/10 text-slate-300 hover:text-white"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.title}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-white/10 mt-auto">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5" />
                        تسجيل الخروج
                    </Button>
                </div>
            </div>

            <main className="flex-1 p-4 md:p-8 overflow-y-auto pt-16 md:pt-8 bg-slate-50">
                {children}
            </main>
        </div>
    );
}
