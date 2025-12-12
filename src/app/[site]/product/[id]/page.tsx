import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetails from "@/components/ProductDetails";
import { getProductById, getProductsByCategory } from "@/lib/products";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getStoreBySlug } from "@/lib/stores";

interface Props {
    params: { site: string; id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const store = await getStoreBySlug(params.site);
    const product = await getProductById(params.id, store?.id);

    if (!product) {
        return {
            title: "المنتج غير موجود",
        };
    }

    return {
        title: `${product.title} | ${store?.name || 'برستيج'}`,
        description: product.description,
        openGraph: {
            title: product.title,
            description: product.description || "",
            images: [product.image_url],
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const store = await getStoreBySlug(params.site);
    const product = await getProductById(params.id, store?.id);

    if (!product) {
        notFound();
    }

    const related = await getProductsByCategory(product.category, store?.id);
    const relatedProducts = related
        .filter(p => p.id !== product.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

    return (
        <main className="min-h-screen flex flex-col">
            <Navbar />
            <ProductDetails product={product} relatedProducts={relatedProducts} />
            <Footer />
        </main>
    );
}
