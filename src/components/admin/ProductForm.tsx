"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Save, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Product } from "@/lib/products";

interface ProductFormProps {
    initialData?: Product;
    isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        price: initialData?.price || 0,
        category: initialData?.category || "",
        image_url: initialData?.image_url || "",
        description: initialData?.description || "",
        stock: initialData?.stock || 0,
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!supabase) {
                alert("رفع الصور غير متاح في الوضع التجريبي");
                setUploading(false);
                return;
            }

            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase!.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase!.storage.from('products').getPublicUrl(filePath);

            setFormData({ ...formData, image_url: data.publicUrl });
        } catch (error: any) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!supabase) {
            alert("حفظ التعديلات غير متاح في الوضع التجريبي");
            setLoading(false);
            return;
        }

        try {
            if (isEdit && initialData) {
                const { error } = await supabase!
                    .from('products')
                    .update(formData)
                    .eq('id', initialData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase!
                    .from('products')
                    .insert([formData]);
                if (error) throw error;
            }

            router.push("/admin/products");
            router.refresh();
        } catch (error) {
            console.error('Error saving product:', error);
            alert("حدث خطأ أثناء حفظ المنتج");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">اسم المنتج</label>
                    <Input
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="مثال: ساعة ذكية"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">السعر</label>
                        <Input
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">المخزون</label>
                        <Input
                            required
                            type="number"
                            min="0"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">القسم</label>
                    <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                    >
                        <option value="">اختر القسم...</option>
                        <option value="إلكترونيات">إلكترونيات</option>
                        <option value="ملابس">ملابس</option>
                        <option value="منزل">منزل</option>
                        <option value="إكسسوارات">إكسسوارات</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">صورة المنتج</label>
                    <div className="flex gap-4 items-start">
                        <div className="flex-1">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                                className="mb-2"
                            />
                            <p className="text-xs text-muted-foreground mb-2">أو أدخل رابط مباشر:</p>
                            <Input
                                required
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        {formData.image_url && (
                            <div className="h-32 w-32 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                                <img src={formData.image_url} alt="Preview" className="h-full w-full object-cover" />
                            </div>
                        )}
                    </div>
                    {uploading && <p className="text-sm text-blue-500">جاري رفع الصورة...</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">الوصف</label>
                    <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="وصف تفصيلي للمنتج..."
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button type="submit" disabled={loading || uploading} className="gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isEdit ? "حفظ التعديلات" : "إضافة المنتج"}
                </Button>
                <Link href="/admin/products">
                    <Button type="button" variant="outline">إلغاء</Button>
                </Link>
            </div>
        </form>
    );
}
