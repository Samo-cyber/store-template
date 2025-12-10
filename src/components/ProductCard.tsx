"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductPlaceholder } from "@/components/Illustrations";
import { useCart } from "@/context/CartContext";

export interface ProductCardProps {
    id: string;
    title: string;
    price: number;
    category: string;
    image_url: string;
    description?: string | null;
    stock?: number;
}

export default function ProductCard({ id, title, price, category, image_url, stock = 0 }: ProductCardProps) {
    const { addToCart } = useCart();
    const isOutOfStock = stock === 0;
    const isLastPiece = stock === 1;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation to product page
        if (isOutOfStock) return;

        addToCart({
            id,
            title,
            price,
            image: image_url, // Map image_url to image for CartContext
        });
    };

    const [imageError, setImageError] = useState(false);

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
        >
            <Link href={`/product/${id}`} className="block">
                <div className="aspect-square bg-muted/50 relative overflow-hidden flex items-center justify-center">
                    {/* Badges */}
                    <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                        {isOutOfStock && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                نفذ من المخزون
                            </span>
                        )}
                        {isLastPiece && !isOutOfStock && (
                            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">
                                آخر قطعة
                            </span>
                        )}
                    </div>

                    {!imageError ? (
                        <Image
                            src={image_url}
                            alt={title}
                            fill
                            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
                            onError={() => setImageError(true)}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="p-8 opacity-50 grayscale">
                            <ProductPlaceholder />
                        </div>
                    )}
                </div>
                <div className="p-3 sm:p-4">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">{category}</p>
                    <h3 className="font-medium leading-none tracking-tight mb-2 text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-1">
                        {title}
                    </h3>
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-sm sm:text-base">{price.toFixed(2)} ج.م</span>
                        <Button
                            size="icon"
                            variant="secondary"
                            disabled={isOutOfStock}
                            className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all active:scale-90 ${isOutOfStock ? 'cursor-not-allowed opacity-50' : ''}`}
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
