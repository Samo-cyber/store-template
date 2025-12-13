"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, LogOut, Truck, Menu, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { COOKIE_NAME } from "@/lib/auth-config";

const navItems = [
    {
        title: "الرئيسية",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "المنتجات",
        href: "/admin/products",
        icon: Package,
    },
    {
        title: "الطلبات",
        href: "/admin/orders",
        icon: ShoppingCart,
    },
    {
        title: "أسعار الشحن",
        href: "/admin/shipping",
        icon: Truck,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // Safely initialize Supabase client
    const [supabase] = useState(() => process.env.NEXT_PUBLIC_SUPABASE_URL
        ? createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookieOptions: { name: COOKIE_NAME } }
        )
        : null);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const toggleSidebar = () => setIsOpen(!isOpen);

    // Dynamic navigation items based on current path
    const getNavItems = () => {
        const basePath = pathname?.match(/^\/store\/[^/]+/)?.[0] || "";

        return navItems.map(item => ({
            ...item,
            href: `${basePath}${item.href}`
        }));
    };

    const currentNavItems = getNavItems();

    return (
        <>
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
                "fixed inset-y-0 right-0 z-40 w-64 bg-card border-l transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:flex md:flex-col",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold tracking-tight">لوحة التحكم</h2>
                    <p className="text-sm text-muted-foreground">برستيج ستور</p>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {currentNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.title}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t mt-auto space-y-2">
                    <Link href={pathname?.match(/^\/store\/[^/]+/)?.[0] || "/"} target="_blank">
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-3"
                        >
                            <ExternalLink className="h-5 w-5" />
                            زيارة المتجر
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5" />
                        تسجيل الخروج
                    </Button>
                </div>
            </div>
        </>
    );
}
