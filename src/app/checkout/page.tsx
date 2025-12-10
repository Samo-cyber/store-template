"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, CreditCard, ShoppingBag, ArrowRight, ArrowLeft, User, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitOrder } from "@/lib/orders";
import { getShippingRateForGovernorate, getShippingRates, ShippingRate } from "@/lib/shipping";
import { getFreeShippingSettings } from "@/lib/settings";
import FreeShippingBanner from "@/components/FreeShippingBanner";

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);
    const [governorates, setGovernorates] = useState<ShippingRate[]>([]);
    const [isFreeShipping, setIsFreeShipping] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        governorate: ""
    });

    // Fetch initial data
    useEffect(() => {
        const loadData = async () => {
            const [rates, freeSettings] = await Promise.all([
                getShippingRates(),
                getFreeShippingSettings()
            ]);

            setGovernorates(rates);

            // Check if free shipping is active
            let isFree = false;
            if (freeSettings.isActive) {
                if (!freeSettings.endDate) {
                    isFree = true;
                } else {
                    const endDate = new Date(freeSettings.endDate);
                    const now = new Date();
                    if (endDate > now) {
                        isFree = true;
                    }
                }
            }

            setIsFreeShipping(isFree);

            // Set default governorate if available
            if (rates.length > 0) {
                const defaultGov = rates[0].governorate;
                setFormData(prev => ({ ...prev, governorate: defaultGov }));

                // IMPORTANT: Pass the calculated isFree value directly, don't rely on state yet
                if (isFree) {
                    setShippingCost(0);
                } else {
                    updateShippingCost(defaultGov, false); // Force not free initially
                }
            }
        };
        loadData();
    }, []);

    const updateShippingCost = async (governorate: string, forceNotFree: boolean = false) => {
        // Use the state unless forced (during initial load)
        if (!forceNotFree && isFreeShipping) {
            setShippingCost(0);
            return;
        }
        const cost = await getShippingRateForGovernorate(governorate);
        setShippingCost(cost);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === "governorate") {
            updateShippingCost(value);
        }
    };

    const validateStep1 = () => {
        const requiredFields = ['fullName', 'phone', 'address', 'governorate'];
        for (const field of requiredFields) {
            if (!formData[field as keyof typeof formData]) {
                alert("يرجى ملء جميع البيانات المطلوبة");
                return false;
            }
        }
        return true;
    };

    const nextStep = () => {
        if (currentStep === 1 && !validateStep1()) return;
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);

        const orderData = {
            customer_name: formData.fullName,
            customer_phone: formData.phone,
            address: {
                street: formData.address,
                governorate: formData.governorate,
            },
            items: items.map(item => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            total_amount: cartTotal + shippingCost,
            shipping_cost: shippingCost
        };

        const result = await submitOrder(orderData);

        if (result.success) {
            clearCart();
            router.push(`/checkout/success?orderId=${result.orderId}`);
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
            <FreeShippingBanner />

            <div className="container mx-auto px-4 py-24 md:py-32 flex-1 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">إتمام الشراء</h1>

                    {/* Steps Indicator */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${step === currentStep ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/25' :
                                    step < currentStep ? 'bg-green-500 text-white' : 'bg-white/10 text-slate-400'
                                    }`}>
                                    {step < currentStep ? <CheckCircle2 className="h-6 w-6" /> : step}
                                </div>
                                {step < 3 && (
                                    <div className={`w-12 h-1 mx-2 rounded-full transition-all ${step < currentStep ? 'bg-green-500' : 'bg-white/10'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-16 mt-2 text-sm text-slate-400">
                        <span>البيانات</span>
                        <span>الدفع</span>
                        <span>تأكيد</span>
                    </div>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    {/* Main Content Area */}
                    <motion.div
                        layout
                        className="space-y-8"
                    >
                        <AnimatePresence mode="wait">
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Personal Info */}
                                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                            <User className="h-6 w-6 text-primary" />
                                            البيانات الشخصية
                                        </h2>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">الاسم بالكامل</label>
                                                <input name="fullName" value={formData.fullName} onChange={handleInputChange} required type="text" className="w-full h-12 rounded-xl border border-white/10 bg-slate-950/50 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">رقم الهاتف</label>
                                                <input name="phone" value={formData.phone} onChange={handleInputChange} required type="tel" className="w-full h-12 rounded-xl border border-white/10 bg-slate-950/50 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Info */}
                                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                            <MapPin className="h-6 w-6 text-primary" />
                                            عنوان التوصيل
                                        </h2>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">العنوان بالتفصيل</label>
                                                <input name="address" value={formData.address} onChange={handleInputChange} required type="text" placeholder="اسم الشارع، رقم العمارة، الشقة" className="w-full h-12 rounded-xl border border-white/10 bg-slate-950/50 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                                            </div>
                                            <div className="grid grid-cols-1 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-300">المحافظة</label>
                                                    <select name="governorate" value={formData.governorate} onChange={handleInputChange} className="w-full h-12 rounded-xl border border-white/10 bg-slate-950/50 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">
                                                        {governorates.map((gov) => (
                                                            <option key={gov.id} value={gov.governorate} className="bg-slate-900">
                                                                {gov.governorate}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6"
                                >
                                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                        <CreditCard className="h-6 w-6 text-primary" />
                                        طريقة الدفع
                                    </h2>
                                    <div className="flex items-center space-x-4 space-x-reverse p-6 border-2 border-primary rounded-2xl bg-primary/10 cursor-pointer transition-all">
                                        <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center">
                                            <div className="h-3 w-3 rounded-full bg-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-bold text-white block">الدفع عند الاستلام (Cash on Delivery)</span>
                                            <span className="text-sm text-slate-400">ادفع نقداً عند استلام طلبك</span>
                                        </div>
                                        <CreditCard className="h-6 w-6 text-primary" />
                                    </div>
                                    <p className="text-sm text-slate-400 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                                        حالياً نوفر خدمة الدفع عند الاستلام فقط لضمان راحتكم وأمانكم.
                                    </p>
                                </motion.div>
                            )}

                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6"
                                >
                                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                        <CheckCircle2 className="h-6 w-6 text-primary" />
                                        مراجعة الطلب
                                    </h2>

                                    <div className="space-y-4 text-sm border-b border-white/10 pb-6">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">الاسم:</span>
                                            <span className="text-white">{formData.fullName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">رقم الهاتف:</span>
                                            <span className="text-white">{formData.phone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">العنوان:</span>
                                            <span className="text-white">{formData.address}, {formData.governorate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">طريقة الدفع:</span>
                                            <span className="text-white">الدفع عند الاستلام</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-medium text-white flex items-center gap-2">
                                            <ShoppingBag className="h-4 w-4 text-primary" />
                                            المنتجات ({items.length})
                                        </h3>
                                        <div className="space-y-3 max-h-[200px] overflow-auto pr-2 custom-scrollbar bg-white/5 p-4 rounded-xl border border-white/5">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex gap-3 items-center">
                                                    <div className="h-12 w-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 border border-white/10">
                                                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                                                        <p className="text-xs text-slate-400">الكمية: {item.quantity}</p>
                                                    </div>
                                                    <span className="text-sm font-bold text-primary whitespace-nowrap">{(item.price * item.quantity).toFixed(2)} ج.م</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-white/10 pt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">المجموع الفرعي</span>
                                            <span className="text-white">{cartTotal.toFixed(2)} ج.م</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">الشحن ({formData.governorate})</span>
                                            <span className="text-green-400 font-medium">
                                                {shippingCost === 0 ? "مجاني" : `${shippingCost.toFixed(2)} ج.م`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10 mt-2">
                                            <span className="text-white">الإجمالي</span>
                                            <span className="text-primary">{(cartTotal + shippingCost).toFixed(2)} ج.م</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 pt-4">
                            {currentStep > 1 && (
                                <Button
                                    onClick={prevStep}
                                    variant="outline"
                                    className="flex-1 h-12 text-lg gap-2"
                                    disabled={isSubmitting}
                                >
                                    <ArrowRight className="h-5 w-5" />
                                    السابق
                                </Button>
                            )}

                            {currentStep < 3 ? (
                                <Button
                                    onClick={nextStep}
                                    className="flex-1 h-12 text-lg gap-2 bg-primary hover:bg-primary/90"
                                >
                                    التالي
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleFinalSubmit}
                                    className="flex-1 h-12 text-lg gap-2 bg-green-600 hover:bg-green-700"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "جاري التأكيد..." : "تأكيد الطلب"}
                                    {!isSubmitting && <CheckCircle2 className="h-5 w-5" />}
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
