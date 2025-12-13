"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Loader2, Check, CreditCard, Shield } from "lucide-react";
import { PLANS } from "@/lib/stripe";
import { getStoreBySlug } from "@/lib/stores";

export default function BillingPage({ params }: { params: { site: string } }) {
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [store, setStore] = useState<any>(null);

    useEffect(() => {
        loadStore();
    }, [params.site]);

    async function loadStore() {
        try {
            const data = await getStoreBySlug(params.site);
            setStore(data);
        } catch (error) {
            console.error("Error loading store:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubscribe(planSlug: string) {
        setProcessing(planSlug);
        try {
            const res = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeId: store.id,
                    planSlug
                })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Error creating checkout session");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to start subscription");
        } finally {
            setProcessing(null);
        }
    }

    async function handleManage() {
        setProcessing('manage');
        try {
            const res = await fetch('/api/billing/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeId: store.id
                })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Error accessing billing portal");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to access portal");
        } finally {
            setProcessing(null);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    const currentPlan = store?.plan_type || 'free';
    const isSubscribed = store?.subscription_status === 'active' || store?.subscription_status === 'trialing';

    return (
        <div className="space-y-8 max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">الاشتراكات والفواتير</h1>
                <p className="text-muted-foreground">اختر الخطة المناسبة لنمو متجرك</p>
            </div>

            {isSubscribed && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-green-500">اشتراكك فعال</h3>
                            <p className="text-sm text-muted-foreground">
                                أنت حالياً على خطة <span className="font-bold capitalize">{currentPlan}</span>.
                                {store.current_period_end && ` يتجدد في ${new Date(store.current_period_end).toLocaleDateString('ar-EG')}`}
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleManage} disabled={!!processing} variant="outline" className="gap-2">
                        {processing === 'manage' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                        إدارة الاشتراك
                    </Button>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                {PLANS.map((plan) => (
                    <div key={plan.slug} className={`relative rounded-2xl border p-8 shadow-sm transition-all ${currentPlan === plan.slug ? 'border-purple-500 ring-1 ring-purple-500 bg-purple-500/5' : 'bg-card hover:border-purple-500/50'}`}>
                        {currentPlan === plan.slug && (
                            <div className="absolute -top-3 right-8 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                                الخطة الحالية
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-2xl font-bold">{plan.name}</h3>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                <span className="text-muted-foreground">ج.م / شهرياً</span>
                            </div>
                        </div>

                        <ul className="space-y-3 mb-8">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Button
                            onClick={() => handleSubscribe(plan.slug)}
                            disabled={!!processing || currentPlan === plan.slug}
                            className="w-full"
                            variant={currentPlan === plan.slug ? "outline" : "default"}
                        >
                            {processing === plan.slug ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : currentPlan === plan.slug ? (
                                "الخطة الحالية"
                            ) : (
                                "اشترك الآن"
                            )}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
