"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, ArrowRight, ChevronDown, Send, Youtube } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FooterSection = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-slate-800 md:border-none">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-4 md:py-0 md:mb-6 group"
            >
                <h4 className="font-bold text-white group-hover:text-primary transition-colors">{title}</h4>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 md:hidden ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out md:h-auto md:opacity-100 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 md:max-h-none"}`}
            >
                <div className="pb-4 md:pb-0">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-slate-200 pt-12 md:pt-20 pb-10 border-t border-slate-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-16">
                    {/* Brand & Newsletter - Always Visible */}
                    <div className="space-y-6 md:col-span-1 pb-8 md:pb-0 border-b border-slate-800 md:border-none">
                        <div>
                            <h3 className="text-2xl font-bold text-white tracking-tighter mb-2">برستيج.</h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-4">
                                حيث تلتقي الفخامة بالأناقة. وجهتك الأولى للمنتجات العصرية الفاخرة في مصر.
                            </p>
                            <div className="text-sm text-slate-400 space-y-1">
                                <p dir="ltr" className="text-right">+20 100 123 4567</p>
                                <p>info@prestige-store.com</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-white">اشترك في نشرتنا</h4>
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    placeholder="بريدك الإلكتروني"
                                    className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-slate-700"
                                />
                                <Button size="icon" variant="secondary" className="shrink-0">
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Shopping Links */}
                    <FooterSection title="التسوق">
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li>
                                <Link href="/products" className="hover:text-white transition-colors">
                                    جميع المنتجات
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="hover:text-white transition-colors">
                                    الأكثر مبيعاً
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="hover:text-white transition-colors">
                                    وصل حديثاً
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="hover:text-white transition-colors">
                                    العروض الخاصة
                                </Link>
                            </li>
                        </ul>
                    </FooterSection>

                    {/* Support Links */}
                    <FooterSection title="الدعم والمساعدة">
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li>
                                <Link href="/contact" className="hover:text-white transition-colors">
                                    تواصل معنا
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-white transition-colors">
                                    عن المتجر
                                </Link>
                            </li>
                            <li>
                                <Link href="/shipping" className="hover:text-white transition-colors">
                                    سياسة الشحن
                                </Link>
                            </li>
                            <li>
                                <Link href="/returns" className="hover:text-white transition-colors">
                                    سياسة الإرجاع
                                </Link>
                            </li>
                        </ul>
                    </FooterSection>

                    {/* Social Links */}
                    <FooterSection title="تابعنا">
                        <div className="flex gap-4">
                            <Link href="#" className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-[#1877F2] hover:text-white transition-all duration-300">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-[#E4405F] hover:text-white transition-all duration-300">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-[#1DA1F2] hover:text-white transition-all duration-300">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-[#0088cc] hover:text-white transition-all duration-300">
                                <Send className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-[#FF0000] hover:text-white transition-all duration-300">
                                <Youtube className="h-5 w-5" />
                            </Link>
                        </div>
                    </FooterSection>
                </div>

                <div className="mt-8 md:mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} برستيج. جميع الحقوق محفوظة.</p>
                    <div className="flex gap-6">
                        <Link href="/terms" className="hover:text-white transition-colors">الشروط والأحكام</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
