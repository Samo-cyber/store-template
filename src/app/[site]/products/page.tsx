"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";

import { useEffect } from "react";
import { getProducts, Product } from "@/lib/products";
import { Loader2 } from "lucide-react";

import { getStoreBySlug } from "@/lib/stores";

export default function ProductsPage({ params }: { params: { site: string } }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("الكل");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            try {
                const store = await getStoreBySlug(params.site);
                if (store) {
                    const data = await getProducts(store.id);
                    setProducts(data);
                } else {
                    // Handle store not found or fallback
                    const data = await getProducts(); // Fallback to mock/all
                    setProducts(data);
                }
            } catch (error) {
                console.error("Error loading products:", error);
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, [params.site]);

    const categories = ["الكل", "إلكترونيات", "ملابس", "منزل", "إكسسوارات"];

    const filteredProducts = products.filter((product) => {
        const matchesCategory = selectedCategory === "الكل" || product.category === selectedCategory;
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <main className="min-h-screen flex flex-col">
            <Navbar />
            <section className="container mx-auto px-4 py-12 flex-1">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                        <h1 className="text-4xl font-bold tracking-tight">جميع المنتجات</h1>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="ابحث عن منتج..."
                                className="pr-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 mb-12">
                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? "default" : "outline"}
                                onClick={() => setSelectedCategory(category)}
                                className="rounded-full px-6"
                            >
                                {category}
                            </Button>
                        ))}
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center py-24">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} {...product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24">
                            <p className="text-xl text-muted-foreground">لا توجد منتجات تطابق بحثك.</p>
                            <Button
                                variant="link"
                                onClick={() => {
                                    setSelectedCategory("الكل");
                                    setSearchQuery("");
                                }}
                                className="mt-2"
                            >
                                مسح الفلاتر
                            </Button>
                        </div>
                    )}
                </motion.div>
            </section>
            <Footer />
        </main>
    );
}
