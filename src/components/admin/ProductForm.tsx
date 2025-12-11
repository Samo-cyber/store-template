"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Save, ArrowRight, Upload, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Product } from "@/lib/products";
import { COOKIE_NAME } from "@/lib/auth-config";

interface ProductFormProps {
    initialData?: Product;
    isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Safely initialize Supabase client
    const [supabase] = useState(() => process.env.NEXT_PUBLIC_SUPABASE_URL
        ? createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookieOptions: { name: COOKIE_NAME } }
        )
        : null);

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        price: initialData?.price || 0,
        category: initialData?.category || "",
        image_url: initialData?.image_url || "",
        images: initialData?.images || (initialData?.image_url ? [initialData.image_url] : []),
        description: initialData?.description || "",
        stock: initialData?.stock || 0,
    });

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await uploadFiles(Array.from(e.dataTransfer.files));
        }
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await uploadFiles(Array.from(e.target.files));
        }
    };

    const uploadFiles = async (files: File[]) => {
        try {
            setUploading(true);

            if (!supabase) {
                alert("رفع الصور غير متاح في الوضع التجريبي");
                setUploading(false);
                return;
            }

            const newImages: string[] = [];

            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('products').getPublicUrl(filePath);
                newImages.push(data.publicUrl);
            }

            setFormData(prev => {
                const updatedImages = [...prev.images, ...newImages];
                return {
                    ...prev,
                    images: updatedImages,
                    image_url: updatedImages[0] || prev.image_url // Update main image if needed
                };
            });

        } catch (error: any) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (indexToRemove: number) => {
        setFormData(prev => {
            const updatedImages = prev.images.filter((_, index) => index !== indexToRemove);
            return {
                ...prev,
                images: updatedImages,
                image_url: updatedImages.length > 0 ? updatedImages[0] : ""
            };
        });
    };

    const handleUrlAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const url = e.currentTarget.value;
            if (url) {
                setFormData(prev => {
                    const updatedImages = [...prev.images, url];
                    return {
                        ...prev,
                        images: updatedImages,
                        image_url: updatedImages[0]
                    };
                });
                e.currentTarget.value = "";
            }
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
            const dataToSubmit = {
                ...formData,
                // Ensure image_url is set to the first image for backward compatibility
                image_url: formData.images.length > 0 ? formData.images[0] : formData.image_url
            };

            if (isEdit && initialData) {
                const { error } = await supabase
                    .from('products')
                    .update(dataToSubmit)
                    .eq('id', initialData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([dataToSubmit]);
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
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                        <label className="text-sm font-medium">الوصف</label>
                        <textarea
                            className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="وصف تفصيلي للمنتج..."
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-medium">صور المنتج</label>

                    {/* Drag and Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                            border-2 border-dashed rounded-lg p-8 text-center transition-colors
                            ${isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'}
                        `}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                اسحب الصور هنا أو اضغط للاختيار
                            </p>
                            <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                                disabled={uploading}
                                className="hidden"
                                id="image-upload"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => document.getElementById('image-upload')?.click()}
                                disabled={uploading}
                            >
                                اختيار صور
                            </Button>
                        </div>
                    </div>

                    {/* URL Input */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="أو أضف رابط صورة واضغط Enter"
                            onKeyDown={handleUrlAdd}
                        />
                    </div>

                    {/* Image Previews */}
                    {formData.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            {formData.images.map((url, index) => (
                                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                                    <img
                                        src={url}
                                        alt={`Product ${index + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 p-1 rounded-full bg-destructive/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    {index === 0 && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 text-center">
                                            الصورة الرئيسية
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {uploading && (
                        <div className="flex items-center gap-2 text-sm text-blue-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>جاري رفع الصور...</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t">
                <Button type="submit" disabled={loading || uploading} className="gap-2 min-w-[150px]">
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
