import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetails from "@/components/ProductDetails";
import { getProductById, getProductsByCategory } from "@/lib/products";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
    params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const product = await getProductById(params.id);

    if (!product) {
        return {
            title: "المنتج غير موجود",
        };
    }

    return {
        title: `${product.title} | برستيج`,
        description: product.description,
        openGraph: {
            title: product.title,
            description: product.description || "",
            images: [product.image_url],
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const product = await getProductById(params.id);

    if (!product) {
        notFound();
    }

    const related = await getProductsByCategory(product.category);
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
