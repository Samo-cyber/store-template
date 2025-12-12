"use client";

import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">إضافة منتج جديد</h1>
                <p className="text-muted-foreground">أدخل تفاصيل المنتج الجديد</p>
            </div>
            <ProductForm />
        </div>
    );
}
