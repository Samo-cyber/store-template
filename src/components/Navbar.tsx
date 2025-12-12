"use client";

import Link from "next/link";
import { ShoppingCart, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useCart } from "@/context/CartContext";

import { SearchModal } from "@/components/SearchModal";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { toggleCart, cartCount } = useCart();
    // Use window.location.pathname to avoid hydration mismatch if possible, but usePathname is safer in Next.js
    // We need to be careful about hydration.
    // Let's use a simple heuristic: if we are in a /store/[slug] route, we prefix.
    // Since this is a client component, we can use usePathname.
    // However, we need to import it.

    // Note: We need to import usePathname at the top. 
    // I will assume I can add the import in a separate edit or if it's already there.
    // Wait, Navbar doesn't have usePathname imported. I need to add it.

    return (
        <>
            <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/70 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/60 transition-all duration-300">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    {/* Logo */}
                    <Link href={typeof window !== 'undefined' && window.location.pathname.startsWith('/store/') ? window.location.pathname.match(/^\/store\/[^/]+/)?.[0] || "/" : "/"} className="text-xl font-bold tracking-tighter">
                        برستيج<span className="text-primary/50">.</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href={typeof window !== 'undefined' && window.location.pathname.startsWith('/store/') ? `${window.location.pathname.match(/^\/store\/[^/]+/)?.[0]}/` : "/"} className="hover:text-primary transition-colors">
                            الرئيسية
                        </Link>
                        <Link href={typeof window !== 'undefined' && window.location.pathname.startsWith('/store/') ? `${window.location.pathname.match(/^\/store\/[^/]+/)?.[0]}/products` : "/products"} className="hover:text-primary transition-colors">
                            المنتجات
                        </Link>
                        <Link href={typeof window !== 'undefined' && window.location.pathname.startsWith('/store/') ? `${window.location.pathname.match(/^\/store\/[^/]+/)?.[0]}/about` : "/about"} className="hover:text-primary transition-colors">
                            من نحن
                        </Link>
                        <Link href={typeof window !== 'undefined' && window.location.pathname.startsWith('/store/') ? `${window.location.pathname.match(/^\/store\/[^/]+/)?.[0]}/contact` : "/contact"} className="hover:text-primary transition-colors">
                            اتصل بنا
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setIsSearchOpen(true)}>
                            <Search className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="relative" onClick={toggleCart}>
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary"></span>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden border-t bg-background"
                        >
                            <div className="flex flex-col p-4 gap-4">
                                <Link
                                    href={typeof window !== 'undefined' && window.location.pathname.startsWith('/store/') ? `${window.location.pathname.match(/^\/store\/[^/]+/)?.[0]}/` : "/"}
                                    className="text-sm font-medium hover:text-primary"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    الرئيسية
                                </Link>
                                <Link
                                    href={typeof window !== 'undefined' && window.location.pathname.startsWith('/store/') ? `${window.location.pathname.match(/^\/store\/[^/]+/)?.[0]}/products` : "/products"}
                                    className="text-sm font-medium hover:text-primary"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    المنتجات
                                </Link>
                                <Link
                                    href={typeof window !== 'undefined' && window.location.pathname.startsWith('/store/') ? `${window.location.pathname.match(/^\/store\/[^/]+/)?.[0]}/about` : "/about"}
                                    className="text-sm font-medium hover:text-primary"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    من نحن
                                </Link>
                                <Link
                                    href={typeof window !== 'undefined' && window.location.pathname.startsWith('/store/') ? `${window.location.pathname.match(/^\/store\/[^/]+/)?.[0]}/contact` : "/contact"}
                                    className="text-sm font-medium hover:text-primary"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    اتصل بنا
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
