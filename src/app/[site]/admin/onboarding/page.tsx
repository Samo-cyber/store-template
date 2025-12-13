"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Store, Package, CheckCircle2, ArrowRight, ArrowLeft, Upload } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { COOKIE_NAME } from "@/lib/auth-config";

export default function OnboardingPage({ params }: { params: { site: string } }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [storeName, setStoreName] = useState("");
    const [storeDescription, setStoreDescription] = useState("");
    const [productName, setProductName] = useState("");
    const [productPrice, setProductPrice] = useState("");

    // Safely initialize Supabase client
    const [supabase] = useState(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookieOptions: { name: COOKIE_NAME } }
    ));

    const handleStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Update store details
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const { error } = await supabase
                .from('stores')
                .update({
                    name: storeName,
                    description: storeDescription
                })
                .eq('owner_id', user.id);

            if (error) throw error;
            setStep(2);
        } catch (error) {
            console.error("Error updating store:", error);
            alert("حدث خطأ أثناء حفظ البيانات");
        } finally {
            setLoading(false);
        }
    };

    const handleStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            // Get store id
            const { data: store } = await supabase
                .from('stores')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (!store) throw new Error("Store not found");

            // Create first product
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: productName,
                    price: parseFloat(productPrice),
                    store_id: store.id,
                    description: "أول منتج في متجرك!",
                    stock: 10,
                    category: "عام",
                    images: [] // Placeholder for now
                }),
            });

            if (!res.ok) throw new Error("Failed to create product");

            setStep(3);
        } catch (error) {
            console.error("Error creating product:", error);
            alert("حدث خطأ أثناء إضافة المنتج");
        } finally {
            setLoading(false);
        }
    };

    const handleStep3 = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            // Mark onboarding as completed
            const { error } = await supabase
                .from('stores')
                .update({ onboarding_completed: true })
                .eq('owner_id', user.id);

            if (error) throw error;

            // Redirect to dashboard
            router.push(`/store/${params.site}/admin`);
            router.refresh();
        } catch (error) {
            console.error("Error completing onboarding:", error);
            alert("حدث خطأ أثناء إتمام الإعداد");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Progress Bar */}
                <div className="bg-slate-100 h-2 w-full">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-8 md:p-12">
                    {/* Step 1: Store Identity */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary mb-4">
                                    <Store className="w-8 h-8" />
                                </div>
                                <h1 className="text-2xl font-bold">لنبدأ بتجهيز متجرك</h1>
                                <p className="text-muted-foreground">أخبرنا قليلاً عن نشاطك التجاري</p>
                            </div>

                            <form onSubmit={handleStep1} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">اسم المتجر</label>
                                    <Input
                                        required
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        placeholder="مثال: متجر الأناقة"
                                        className="h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">وصف قصير</label>
                                    <Input
                                        value={storeDescription}
                                        onChange={(e) => setStoreDescription(e.target.value)}
                                        placeholder="ماذا تبيع؟"
                                        className="h-12"
                                    />
                                </div>
                                <Button type="submit" className="w-full h-12 text-lg gap-2" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" /> : (
                                        <>
                                            التالي <ArrowLeft className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* Step 2: First Product */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-600 mb-4">
                                    <Package className="w-8 h-8" />
                                </div>
                                <h1 className="text-2xl font-bold">أضف أول منتج لك</h1>
                                <p className="text-muted-foreground">لا تقلق، يمكنك تعديله لاحقاً</p>
                            </div>

                            <form onSubmit={handleStep2} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">اسم المنتج</label>
                                    <Input
                                        required
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        placeholder="مثال: قميص قطني"
                                        className="h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">السعر</label>
                                    <Input
                                        required
                                        type="number"
                                        min="0"
                                        value={productPrice}
                                        onChange={(e) => setProductPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="h-12"
                                    />
                                </div>
                                <Button type="submit" className="w-full h-12 text-lg gap-2" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" /> : (
                                        <>
                                            إضافة ومتابعة <ArrowLeft className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => setStep(1)}
                                    disabled={loading}
                                >
                                    رجوع
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* Step 3: Completion */}
                    {step === 3 && (
                        <div className="space-y-8 text-center animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-6 animate-bounce">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold text-slate-900">رائع! متجرك جاهز</h1>
                                <p className="text-lg text-muted-foreground">لقد قمت بالخطوة الأولى نحو النجاح.</p>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-right space-y-3">
                                <div className="flex items-center gap-3 text-slate-700">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span>تم إنشاء هوية المتجر</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-700">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span>تم إضافة المنتج الأول</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-700">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span>لوحة التحكم جاهزة</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleStep3}
                                className="w-full h-14 text-xl rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "إطلاق المتجر 🚀"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
