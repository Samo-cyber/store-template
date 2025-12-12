"use client";

import { useEffect, useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Product } from "@/lib/products";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { COOKIE_NAME } from "@/lib/auth-config";

export default function EditProductPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    // Safely initialize Supabase client
    const [supabase] = useState(() => process.env.NEXT_PUBLIC_SUPABASE_URL
        ? createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookieOptions: { name: COOKIE_NAME } }
        )
        : null);

    useEffect(() => {
        async function loadProduct() {
            if (!supabase) {
                // Use getProductById which handles mock data if Supabase is missing
                const { getProductById } = await import("@/lib/products");
                const productData = await getProductById(params.id as string);
                if (productData) setProduct(productData);
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('id', params.id)
                .single();

            if (data) setProduct(data as Product);
            setLoading(false);
        }
        loadProduct();
    }, [params.id, supabase]);

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
