"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getShippingRates, updateShippingRate, ShippingRate } from "@/lib/shipping";
import { Save, Truck, Loader2 } from "lucide-react";

export default function ShippingPage() {
    const [rates, setRates] = useState<ShippingRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        loadRates();
    }, []);

    const loadRates = async () => {
        const data = await getShippingRates();
        setRates(data);
        setLoading(false);
    };

    const handlePriceChange = (id: string, newPrice: string) => {
        setRates(rates.map(rate =>
            rate.id === id ? { ...rate, price: parseFloat(newPrice) || 0 } : rate
        ));
    };

    const handleSave = async (id: string, price: number) => {
        setSaving(id);
        await updateShippingRate(id, price);
        setSaving(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">أسعار الشحن</h1>
                    <p className="text-muted-foreground mt-2">
                        إدارة تكلفة الشحن لكل محافظة
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rates.map((rate) => (
                    <div key={rate.id} className="bg-card border rounded-xl p-6 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Truck className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg">{rate.governorate}</h3>
                        </div>

                        <div className="flex items-end gap-3">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">سعر الشحن (ج.م)</label>
                                <Input
                                    type="number"
                                    value={rate.price}
                                    onChange={(e) => handlePriceChange(rate.id, e.target.value)}
                                    className="text-lg font-bold"
                                />
                            </div>
                            <Button
                                onClick={() => handleSave(rate.id, rate.price)}
                                disabled={saving === rate.id}
                                className="mb-[2px]"
                            >
                                {saving === rate.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {rate.price === 0 ? "شحن مجاني" : `يتم إضافة ${rate.price} ج.م إلى إجمالي الطلب`}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
