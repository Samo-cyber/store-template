import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts, getBestSellers, getNewArrivals, getOffers } from "@/lib/products";
import FreeShippingBanner from "@/components/FreeShippingBanner";
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface StoreTemplateProps {
    storeId: string;
    ownerId?: string;
}

export default async function StoreTemplate({ storeId, ownerId }: StoreTemplateProps) {
    const featuredProducts = await getFeaturedProducts(4, storeId);
    const bestSellers = await getBestSellers(4, storeId);
    const newArrivals = await getNewArrivals(4, storeId);
    const offers = await getOffers(4, storeId);


    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = user?.id === ownerId;

    return (
        <main className="min-h-screen flex flex-col relative">
            {isOwner && (
                <div className="fixed bottom-6 left-6 z-50">
                    <Link href={`/store/${(await supabase.from('stores').select('slug').eq('id', storeId).single()).data?.slug}/admin`}>
                        <button className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full shadow-xl hover:bg-purple-700 transition-all hover:scale-105 font-bold">
                            <LayoutDashboard className="w-5 h-5" />
                            لوحة التحكم
                        </button>
                    </Link>
                </div>
            )}
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
