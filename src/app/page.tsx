import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

import { useEffect, useState } from "react";
import { getFeaturedProducts, Product } from "@/lib/products";
import { Loader2 } from "lucide-react";

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadFeatured() {
            setLoading(true);
            const data = await getFeaturedProducts();
            setFeaturedProducts(data);
            setLoading(false);
        }
        loadFeatured();
    }, []);

    return (
        <main className="min-h-screen flex flex-col">
            <Navbar />
            <Hero />
            <section id="featured" className="container mx-auto px-4 py-24">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-bold tracking-tight">منتجات مميزة</h2>
                    <a href="/products" className="text-sm font-medium hover:text-primary transition-colors">
                        عرض الكل &larr;
                    </a>
                </div>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                )}
            </section>
            <Footer />
        </main>
    );
}
