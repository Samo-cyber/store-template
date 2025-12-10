"use client";

import { Button } from "@/components/ui/Button";
import { ShoppingCart, ArrowRight, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/products";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { AccordionItem } from "@/components/ui/Accordion";
import ProductCard from "@/components/ProductCard";

interface ProductDetailsProps {
    product: Product;
    relatedProducts: Product[];
}

export default function ProductDetails({ product, relatedProducts }: ProductDetailsProps) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(product.image_url);

    // Use images array if available, otherwise fallback to single image
    const images = product.images && product.images.length > 0
        ? product.images
        : [product.image_url];

    const handleAddToCart = () => {
        addToCart({
            ...product,
            image: product.image_url
        }, quantity);
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <section className="container mx-auto px-4 py-8 md:py-12 flex-1">
                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-2">
                    <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
                    <span className="mx-2">/</span>
                    <Link href="/products" className="hover:text-primary transition-colors">المنتجات</Link>
                    <span className="mx-2">/</span>
                    <span className="text-foreground font-medium">{product.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Gallery Section */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-muted rounded-2xl overflow-hidden border shadow-sm relative group">
                            <Image
                                src={selectedImage}
                                alt={product.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />
                            <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium z-10">
                                {product.category}
                            </div>
                        </div>
                        {/* Gallery Thumbnails */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {images.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedImage(img)}
                                        className={`aspect-square rounded-xl overflow-hidden border cursor-pointer relative transition-all ${selectedImage === img ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-80'}`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`${product.title} - ${i + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 25vw, 10vw"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info Section */}
                    <div className="flex flex-col">
                        <div className="mb-8 border-b pb-8">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-foreground">
                                {product.title}
                            </h1>
                            <div className="flex items-center gap-4 mb-6">
                                <p className="text-3xl font-bold text-primary">
                                    {product.price.toFixed(2)} <span className="text-lg font-normal text-muted-foreground">ج.م</span>
                                </p>
                                <div className="flex items-center text-yellow-500 text-sm">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-current" />
                                    ))}
                                    <span className="text-muted-foreground mr-2 text-xs">(4.9 تقييم)</span>
                                </div>
                            </div>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {product.description || "استمتع بتجربة فريدة مع هذا المنتج المصمم خصيصاً ليناسب ذوقك الرفيع. جودة عالية وتفاصيل دقيقة تضمن لك الرضا التام."}
                            </p>
                        </div>

                        <div className="space-y-8 mb-8">
                            <div className="space-y-4">
                                <label className="text-sm font-medium">الكمية</label>
                                <div className="flex items-center gap-4">
                                    <QuantitySelector
                                        quantity={quantity}
                                        onIncrease={() => setQuantity(q => q + 1)}
                                        onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
                                    />
                                    <Button size="lg" className="flex-1 h-12 text-lg gap-2 rounded-xl" onClick={handleAddToCart}>
                                        <ShoppingCart className="h-5 w-5" />
                                        أضف للسلة
                                    </Button>
                                </div>
                            </div>

                            {/* Accordions */}
                            <div className="border rounded-xl px-4 divide-y">
                                <AccordionItem title="تفاصيل المنتج">
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        <li>خامات عالية الجودة</li>
                                        <li>تصميم عصري وأنيق</li>
                                        <li>متوفر بألوان متعددة</li>
                                        <li>ضمان لمدة سنة</li>
                                    </ul>
                                </AccordionItem>
                                <AccordionItem title="الشحن والتوصيل">
                                    <p className="text-sm">
                                        الشحن مجاني للطلبات فوق 1000 ج.م. يتم التوصيل خلال 2-5 أيام عمل لجميع المحافظات.
                                    </p>
                                </AccordionItem>
                                <AccordionItem title="سياسة الإرجاع">
                                    <p className="text-sm">
                                        يمكنك إرجاع المنتج خلال 14 يوم من تاريخ الاستلام بشرط أن يكون في حالته الأصلية.
                                    </p>
                                </AccordionItem>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-24 border-t pt-16">
                        <h2 className="text-2xl font-bold mb-8">قد يعجبك أيضاً</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p.id} {...p} />
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
