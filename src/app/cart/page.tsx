"use client";

import { Button } from "@/components/ui/Button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
    const { items, removeFromCart, cartTotal } = useCart();

    if (items.length === 0) {
        return (
            <main className="min-h-screen flex flex-col bg-background">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 px-4 text-center">
                    <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center">
                        <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">سلة التسوق فارغة</h1>
                        <p className="text-muted-foreground">لم تقم بإضافة أي منتجات للسلة بعد.</p>
                    </div>
                    <Link href="/products">
                        <Button size="lg" className="gap-2">
                            ابدأ التسوق الآن
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-12 flex-1">
                <h1 className="text-3xl font-bold tracking-tight mb-8">سلة التسوق</h1>

                <div className="grid gap-12 md:grid-cols-3">
                    {/* Cart Items */}
                    <div className="md:col-span-2 space-y-4">
                        {items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-4 p-4 border rounded-xl bg-card shadow-sm"
                            >
                                <div className="h-24 w-24 rounded-lg overflow-hidden bg-muted border flex-shrink-0">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-lg truncate">{item.title}</h3>
                                    <p className="text-primary font-bold mt-1">
                                        {item.price.toFixed(2)} ج.م
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        الكمية: {item.quantity}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="md:col-span-1">
                        <div className="p-6 border rounded-xl bg-card shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold mb-6">ملخص الطلب</h2>
                            <div className="space-y-3 mb-6 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">المجموع الفرعي</span>
                                    <span>{cartTotal.toFixed(2)} ج.م</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">الشحن</span>
                                    <span className="text-green-600 font-medium">مجاني</span>
                                </div>
                                <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
                                    <span>الإجمالي</span>
                                    <span>{cartTotal.toFixed(2)} ج.م</span>
                                </div>
                            </div>
                            <Link href="/checkout" className="block w-full mb-4">
                                <Button className="w-full h-12 text-lg gap-2">
                                    إتمام الشراء <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link
                                href="/products"
                                className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                تابع التسوق
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
