"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    // Safely initialize Supabase client
    const [supabase] = useState(() => process.env.NEXT_PUBLIC_SUPABASE_URL
        ? createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        : null);

    const handleLogout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        router.push("/admin/login");
    };

    return (
        <div className="w-64 border-l bg-card h-screen flex flex-col sticky top-0">
            <div className="p-6 border-b">
                <h2 className="text-2xl font-bold tracking-tight">لوحة التحكم</h2>
                <p className="text-sm text-muted-foreground">برستيج ستور</p>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
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
            <div className="p-4 border-t">
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
    );
}
