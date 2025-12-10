"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/products";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        setLoading(true);
        const { data } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setProducts(data as Product[]);
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (!error) {
            loadProducts();
        } else {
            alert("حدث خطأ أثناء الحذف");
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">المنتجات</h1>
                    <p className="text-muted-foreground">إدارة منتجات المتجر</p>
                </div>
                <Link href="/admin/products/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        إضافة منتج
                    </Button>
                </Link>
            </div>

            <div className="border rounded-xl overflow-hidden bg-card">
                <table className="w-full text-sm text-right">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="p-4 font-medium text-muted-foreground">الصورة</th>
                            <th className="p-4 font-medium text-muted-foreground">الاسم</th>
                            <th className="p-4 font-medium text-muted-foreground">السعر</th>
                            <th className="p-4 font-medium text-muted-foreground">القسم</th>
                            <th className="p-4 font-medium text-muted-foreground">المخزون</th>
                            <th className="p-4 font-medium text-muted-foreground">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                                <td className="p-4">
                                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                                        <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" />
                                    </div>
                                </td>
                                <td className="p-4 font-medium">{product.title}</td>
                                <td className="p-4">{product.price} ج.م</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                                        {product.category}
                                    </span>
                                </td>
                                <td className="p-4">{product.stock || 0}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/admin/products/${product.id}`}>
                                            <Button size="icon" variant="ghost" className="h-8 w-8">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                            onClick={() => handleDelete(product.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
