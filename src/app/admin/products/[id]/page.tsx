"use client";

import { useEffect, useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/products";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function EditProductPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProduct() {
            // Use getProductById which handles mock data if Supabase is missing
            const { getProductById } = await import("@/lib/products");
            const productData = await getProductById(params.id as string);

            if (productData) setProduct(productData);
            setLoading(false);
        }
        loadProduct();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!product) return <div>المنتج غير موجود</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">تعديل المنتج</h1>
                <p className="text-muted-foreground">تعديل تفاصيل {product.title}</p>
            </div>
            <ProductForm initialData={product} isEdit />
        </div>
    );
}
