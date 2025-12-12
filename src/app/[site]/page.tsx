import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

import { getFeaturedProducts, getBestSellers, getNewArrivals, getOffers, Product } from "@/lib/products";

import FreeShippingBanner from "@/components/FreeShippingBanner";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getStoreBySlug } from "@/lib/stores";
import { notFound } from "next/navigation";

export default async function Home({ params }: { params: { site: string } }) {
    const store = await getStoreBySlug(params.site);

    if (!store) {
        // If store not found, maybe show a 404 or a "Create Store" page
        // For now, let's assume 'demo' is a valid fallback or just 404
        if (params.site !== 'demo') {
            notFound();
        }
        // If demo and not found in DB, we might want to show mock data
        // But getStoreBySlug returns null if not found.
        // Let's proceed with null storeId which triggers mock data in getProducts
    }

    const storeId = store?.id;

    const featuredProducts = await getFeaturedProducts(4, storeId);
    const bestSellers = await getBestSellers(4, storeId);
    const newArrivals = await getNewArrivals(4, storeId);
    const offers = await getOffers(4, storeId);

    return (
        <main className="min-h-screen flex flex-col">
            <Navbar />
            <FreeShippingBanner />
            <Hero />

            {/* Best Sellers */}
            <section className="container mx-auto px-4 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold tracking-tight text-white">الأكثر مبيعا</h2>
                    <a href="/products" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                        عرض الكل &larr;
                    </a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                    {bestSellers.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </section>

            {/* New Arrivals */}
            <section className="container mx-auto px-4 py-16 bg-white/5 rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold tracking-tight text-white">وصل حديثا</h2>
                    <a href="/products" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                        عرض الكل &larr;
                    </a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                    {newArrivals.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </section>

            {/* Offers */}
            <section className="container mx-auto px-4 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold tracking-tight text-white">عروض خاصة</h2>
                    <a href="/products" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                        عرض الكل &larr;
                    </a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                    {offers.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    );
}
