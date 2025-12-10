"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Search, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/products";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const searchProducts = async () => {
            if (query.trim().length === 0) {
                setResults([]);
                return;
            }

            setLoading(true);

            if (!supabase) {
                // Mock search or empty
                setResults([]);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .ilike('title', `%${query}%`)
                .limit(5);

            if (data) {
                setResults(data as Product[]);
            }
            setLoading(false);
        };

        const debounce = setTimeout(searchProducts, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-white/10">
                <DialogHeader className="px-4 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <input
                            className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground"
                            placeholder="ابحث عن منتجات..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    </div>
                </DialogHeader>
                <div className="max-h-[400px] overflow-y-auto p-2">
                    {results.length > 0 ? (
                        <div className="space-y-1">
                            {results.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.id}`}
                                    onClick={onClose}
                                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                                >
                                    <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden relative">
                                        <Image
                                            src={product.image_url}
                                            alt={product.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium group-hover:text-primary transition-colors">{product.title}</h4>
                                        <p className="text-sm text-muted-foreground">{product.price} ج.م</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : query.length > 0 && !loading ? (
                        <div className="p-8 text-center text-muted-foreground">
                            لا توجد نتائج لـ "{query}"
                        </div>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            ابدأ الكتابة للبحث عن المنتجات
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
