import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

const cairo = Cairo({ subsets: ["arabic"] });

export const metadata: Metadata = {
    title: "برستيج | حيث تلتقي الفخامة بالأناقة",
    description: "متجر برستيج - وجهتك الأولى للمنتجات العصرية الفاخرة في مصر. تسوق أحدث الصيحات بجودة عالمية.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ar" dir="rtl" className="scroll-smooth dark">
            <body className={cn(cairo.className, "min-h-screen bg-slate-950 font-sans antialiased selection:bg-primary selection:text-primary-foreground overflow-x-hidden relative")}>
                <CartProvider>
                    <div className="relative z-10">
                        {children}
                        <CartDrawer />
                    </div>
                </CartProvider>
            </body>
        </html>
    );
}
