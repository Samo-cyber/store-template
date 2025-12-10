"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getShippingRates, updateShippingRate, addShippingRate, ShippingRate } from "@/lib/shipping";
import { getFreeShippingSettings, updateSetting, FreeShippingSettings } from "@/lib/settings";
import { Save, Truck, Loader2, Plus, Timer, ToggleLeft, ToggleRight, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function ShippingPage() {
    const [rates, setRates] = useState<ShippingRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    // New Governorate State
    const [newGov, setNewGov] = useState("");
    const [newPrice, setNewPrice] = useState("50");
    const [adding, setAdding] = useState(false);

    // Free Shipping State
    const [freeShipping, setFreeShipping] = useState<FreeShippingSettings>({ isActive: false, endDate: null });
    const [savingSettings, setSavingSettings] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [ratesData, settingsData] = await Promise.all([
            getShippingRates(),
            getFreeShippingSettings()
        ]);
        setRates(ratesData);
        setFreeShipping(settingsData);
        if (settingsData.endDate) {
            setDate(new Date(settingsData.endDate));
        }
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

    const handleAddGov = async () => {
        if (!newGov) return;
        setAdding(true);
        const result = await addShippingRate(newGov, parseFloat(newPrice) || 0);
        if (result.success) {
            setNewGov("");
            setNewPrice("50");
            const updatedRates = await getShippingRates();
            setRates(updatedRates);
        } else {
            alert("حدث خطأ أثناء إضافة المحافظة");
        }
        setAdding(false);
    };

    const handleToggleFreeShipping = async () => {
        const newState = { ...freeShipping, isActive: !freeShipping.isActive };
        setFreeShipping(newState);
        setSavingSettings(true);
        await updateSetting('free_shipping', newState);
        setSavingSettings(false);
    };

    const handleDateSelect = async (newDate: Date | undefined) => {
        setDate(newDate);
        if (newDate) {
            // Set time to end of day for better UX
            newDate.setHours(23, 59, 59, 999);
            const isoDate = newDate.toISOString();
            const newState = { ...freeShipping, endDate: isoDate };
            setFreeShipping(newState);
            setSavingSettings(true);
            await updateSetting('free_shipping', newState);
            setSavingSettings(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">إعدادات الشحن</h1>
                    <p className="text-muted-foreground mt-2">
                        إدارة تكلفة الشحن والعروض
                    </p>
                </div>
            </div>

            {/* Free Shipping Section */}
            <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b pb-4">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Timer className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">عرض الشحن المجاني</h3>
                        <p className="text-sm text-muted-foreground">تفعيل شحن مجاني لجميع الطلبات لفترة محدودة</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleToggleFreeShipping}
                            disabled={savingSettings}
                            className={`transition-colors ${freeShipping.isActive ? "text-green-500" : "text-slate-400"}`}
                        >
                            {freeShipping.isActive ? (
                                <ToggleRight className="h-12 w-12" />
                            ) : (
                                <ToggleLeft className="h-12 w-12" />
                            )}
                        </button>
                        <span className="font-medium">
                            {freeShipping.isActive ? "العرض مفعل" : "العرض متوقف"}
                        </span>
                    </div>

                    {freeShipping.isActive && (
                        <div className="flex-1 w-full md:w-auto">
                            <label className="text-sm font-medium text-muted-foreground mb-2 block">تاريخ انتهاء العرض</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[280px] justify-start text-right font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="ml-2 h-4 w-4" />
                                        {date ? format(date, "PPP", { locale: ar }) : <span>اختر تاريخ</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={handleDateSelect}
                                        initialFocus
                                        disabled={(date) => date < new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                </div>
            </div>

            {/* Shipping Rates Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">أسعار المحافظات</h2>
                </div>

                {/* Add New Governorate */}
                <div className="bg-muted/50 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">اسم المحافظة</label>
                        <Input
                            placeholder="مثال: المنوفية"
                            value={newGov}
                            onChange={(e) => setNewGov(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-32">
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">السعر</label>
                        <Input
                            type="number"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleAddGov} disabled={adding || !newGov} className="w-full md:w-auto">
                        {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        <span className="mr-2">إضافة</span>
                    </Button>
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
        </div>
    );
}
