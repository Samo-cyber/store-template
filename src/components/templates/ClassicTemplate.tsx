import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts, getNewArrivals } from "@/lib/products";

interface ClassicTemplateProps {
    storeId: string;
}

export default async function ClassicTemplate({ storeId }: ClassicTemplateProps) {
    const featuredProducts = await getFeaturedProducts(8, storeId);
    const newArrivals = await getNewArrivals(4, storeId);

    return (
        <main className="min-h-screen flex flex-col bg-white text-slate-900">
            <Navbar />

            {/* Classic Hero - Simple & Clean */}
            <div className="bg-slate-100 py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-slate-900">
                        أناقة وبساطة
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                        اكتشف مجموعتنا المختارة من المنتجات المميزة التي تناسب ذوقك الرفيع.
                    </p>
                    <a href="/products" className="inline-block bg-slate-900 text-white px-8 py-3 rounded-none hover:bg-slate-800 transition-colors">
                        تسوق الآن
                    </a>
                </div>
            </div>

            {/* Featured Collection */}
            <section className="container mx-auto px-4 py-20">
                <h2 className="text-2xl font-serif font-bold text-center mb-12 relative">
                    <span className="bg-white px-4 relative z-10">مختاراتنا لك</span>
                    <div className="absolute top-1/2 left-0 w-full h-px bg-slate-200 -z-0"></div>
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {featuredProducts.map((product) => (
                        <div key={product.id} className="group">
                            <ProductCard {...product} />
                        </div>
                    ))}
                </div>
            </section>

            {/* New Arrivals Banner */}
            <section className="bg-slate-900 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="md:w-1/3">
                            <h2 className="text-3xl font-serif font-bold mb-4">وصل حديثاً</h2>
                            <p className="text-slate-400 mb-8">
                                تصفح أحدث المنتجات التي انضمت إلى مجموعتنا. جودة عالية وتصاميم عصرية.
                            </p>
                            <a href="/products" className="inline-block border border-white px-8 py-3 hover:bg-white hover:text-slate-900 transition-colors">
                                عرض الكل
                            </a>
                        </div>
                        <div className="md:w-2/3 grid grid-cols-2 gap-4">
                            {newArrivals.slice(0, 2).map((product) => (
                                <ProductCard key={product.id} {...product} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
