"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, CreditCard, Truck, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { submitOrder } from "@/lib/orders";

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submitButtonRef = React.useRef<HTMLButtonElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);

        const orderData = {
            customer_name: `${formData.get('firstName')} ${formData.get('lastName')}`,
            customer_email: formData.get('email') as string,
            customer_phone: formData.get('phone') as string,
            address: {
                street: formData.get('address') as string,
                city: formData.get('city') as string,
                governorate: formData.get('governorate') as string,
            },
            items: items.map(item => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            total_amount: cartTotal
        };

        const result = await submitOrder(orderData);

        if (result.success) {
            clearCart();
            router.push("/checkout/success");
        } else {
            let errorMessage = "حدث خطأ أثناء إتمام الطلب. يرجى المحاولة مرة أخرى.";

            if (result.error && typeof result.error === 'string') {
                if (result.error.includes("Insufficient stock")) {
                    errorMessage = "عذراً، بعض المنتجات في سلتك نفذت كميتها. يرجى مراجعة السلة.";
                } else {
                    errorMessage = "حدث خطأ: " + result.error;
                }
            }

            alert(errorMessage);
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) {
        return (
            <main className="min-h-screen flex flex-col relative overflow-hidden">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center relative z-10">
                    <div className="h-24 w-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                        <ShoppingBag className="h-10 w-10 text-slate-400" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-white">السلة فارغة</h1>
                    <Link href="/products">
                        <Button size="lg" className="gap-2 rounded-xl">
                            العودة للتسوق
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col relative overflow-hidden">
            <Navbar />

            <div className="container mx-auto px-4 py-24 md:py-32 flex-1 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">إتمام الشراء</h1>
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                        <ShieldCheck className="h-5 w-5 text-green-500" />
                        <p>عملية دفع آمنة ومشفرة 100%</p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Checkout Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-7 space-y-8"
                    >
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Hidden Submit Button */}
                            <button type="submit" ref={submitButtonRef} className="hidden" />

                            {/* Personal Info */}
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">1</div>
                                    البيانات الشخصية
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">الاسم الأول</label>
                                        <input name="firstName" required type="text" className="w-full h-12 rounded-xl border border-white/10 bg-slate-950/50 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">اسم العائلة</label>
                                        <input name="lastName" required type="text" className="w-full h-12 rounded-xl border border-white/10 bg-slate-950/50 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-300">البريد الإلكتروني</label>
                                        <input name="email" required type="email" className="w-full h-12 rounded-xl border border-white/10 bg-slate-950/50 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-slate-300">رقم الهاتف</label>
                                        <input name="phone" required type="tel" className="w-full h-12 rounded-xl border border-white/10 bg-slate-950/50 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Info */}
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">2</div>
                                    عنوان التوصيل
                                </h2>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">العنوان بالتفصيل</label>
                                        <input name="address" required type="text" placeholder="اسم الشارع، رقم العمارة، الشقة" className="w-full h-12 rounded-xl border border-white/10 bg-slate-950/50 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">المدينة</label>
                                            <input name="city" required type="text" className="w-full h-12 rounded-xl border border-white/10 bg-slate-950/50 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">المحافظة</label>
                                            <select name="governorate" className="w-full h-12 rounded-xl border border-white/10 bg-slate-950/50 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">
                                                <option className="bg-slate-900">القاهرة</option>
                                                <option className="bg-slate-900">الجيزة</option>
                                                <option className="bg-slate-900">الإسكندرية</option>
                                                <option className="bg-slate-900">أخرى</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">3</div>
                                    طريقة الدفع
                                </h2>
                                <div className="flex items-center space-x-4 space-x-reverse p-6 border border-primary/50 rounded-2xl bg-primary/5 cursor-pointer transition-all hover:bg-primary/10">
                                    <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center">
                                        <div className="h-3 w-3 rounded-full bg-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-bold text-white block">الدفع عند الاستلام (Cash on Delivery)</span>
                                        <span className="text-sm text-slate-400">ادفع نقداً عند استلام طلبك</span>
                                    </div>
                                    <CreditCard className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        </form>
                    </motion.div>

                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-5"
                    >
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl sticky top-24 space-y-8">
                            <h2 className="text-xl font-bold text-white">ملخص الطلب</h2>
                            <div className="space-y-6 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="h-20 w-20 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 border border-white/10">
                                            <img src={item.image} alt={item.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-white line-clamp-2">{item.title}</h4>
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-md">الكمية: {item.quantity}</p>
                                                <p className="text-sm font-bold text-primary">{item.price.toFixed(2)} ج.م</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-white/10 pt-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">المجموع الفرعي</span>
                                    <span className="text-white">{cartTotal.toFixed(2)} ج.م</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">الشحن</span>
                                    <span className="text-green-400 font-medium flex items-center gap-1">
                                        <Truck className="h-3 w-3" />
                                        مجاني
                                    </span>
                                </div>
                                <div className="flex justify-between text-xl font-bold pt-4 border-t border-white/10 mt-4">
                                    <span className="text-white">الإجمالي</span>
                                    <span className="text-primary">{cartTotal.toFixed(2)} ج.م</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                onClick={() => submitButtonRef.current?.click()}
                                className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/20 transition-all duration-300 group"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    "جاري التأكيد..."
                                ) : (
                                    <span className="flex items-center gap-2">
                                        تأكيد الطلب <ArrowRight className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button>

                            <p className="text-xs text-center text-slate-500">
                                بتأكيد الطلب، أنت توافق على شروط الاستخدام وسياسة الخصوصية.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
