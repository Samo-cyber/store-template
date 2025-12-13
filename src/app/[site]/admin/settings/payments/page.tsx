"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { createBrowserClient } from "@supabase/ssr";
import { COOKIE_NAME } from "@/lib/auth-config";
import { toast } from "sonner";
import { Loader2, CreditCard, Lock } from "lucide-react";

export default function PaymentSettingsPage({ params }: { params: { site: string } }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [keys, setKeys] = useState({
        stripe_publishable_key: "",
        stripe_secret_key: ""
    });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookieOptions: { name: COOKIE_NAME } }
    );

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('stores')
                .select('stripe_publishable_key, stripe_secret_key')
                .eq('slug', params.site)
                .single();

            if (error) throw error;

            if (data) {
                setKeys({
                    stripe_publishable_key: data.stripe_publishable_key || "",
                    stripe_secret_key: data.stripe_secret_key || ""
                });
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast.error("فشل تحميل الإعدادات");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('stores')
                .update({
                    stripe_publishable_key: keys.stripe_publishable_key,
                    stripe_secret_key: keys.stripe_secret_key
                })
                .eq('slug', params.site);

            if (error) throw error;

            toast.success("تم حفظ إعدادات الدفع بنجاح");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("فشل حفظ الإعدادات");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">إعدادات الدفع</h1>
                <p className="text-muted-foreground">قم بربط حساب Stripe الخاص بك لاستقبال المدفوعات الإلكترونية.</p>
            </div>

            <div className="bg-card border rounded-xl p-6 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg text-primary mb-6">
                    <CreditCard className="w-6 h-6" />
                    <div>
                        <h3 className="font-bold">Stripe Integration</h3>
                        <p className="text-sm opacity-90">استقبل المدفوعات عبر البطاقات الائتمانية بأمان.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Publishable Key</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={keys.stripe_publishable_key}
                                onChange={(e) => setKeys({ ...keys, stripe_publishable_key: e.target.value })}
                                placeholder="pk_test_..."
                                className="w-full p-3 bg-background border rounded-lg pl-10 font-mono text-sm"
                            />
                            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        <p className="text-xs text-muted-foreground">المفتاح العام الذي يستخدم في واجهة المتجر.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Secret Key</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={keys.stripe_secret_key}
                                onChange={(e) => setKeys({ ...keys, stripe_secret_key: e.target.value })}
                                placeholder="sk_test_..."
                                className="w-full p-3 bg-background border rounded-lg pl-10 font-mono text-sm"
                            />
                            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        <p className="text-xs text-muted-foreground">المفتاح السري الذي يستخدم في العمليات الآمنة. لا تشاركه مع أحد.</p>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full md:w-auto"
                    >
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        حفظ الإعدادات
                    </Button>
                </div>
            </div>
        </div>
    );
}
