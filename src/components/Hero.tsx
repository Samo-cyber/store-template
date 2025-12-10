"use client";

import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative h-[85vh] min-h-[500px] w-full overflow-hidden flex items-center justify-center">
            {/* Background Image with Ken Burns Effect */}
            <motion.div
                className="absolute inset-0 z-0"
                initial={{ scale: 1 }}
                animate={{ scale: 1.1 }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear"
                }}
            >
                <img
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
                    alt="Hero Background"
                    className="object-cover w-full h-full"
                />
            </motion.div>

            {/* Dark Overlay for Readability */}
            <div className="absolute inset-0 z-10 bg-black/50" />

            {/* Content */}
            <div className="container relative z-20 mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{
                        opacity: 1,
                        y: [0, -10, 0]
                    }}
                    transition={{
                        opacity: { duration: 0.8, ease: "easeOut" },
                        y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="max-w-3xl mx-auto space-y-8"
                >
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                        ارتقِ بأسلوب حياتك
                        <br />
                        <span className="text-gray-200 font-light">بلمسة من الفخامة</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto px-4">
                        اكتشف مجموعتنا الحصرية من المنتجات التي تجمع بين التصميم العصري والجودة الاستثنائية.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link href="/products">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 rounded-xl bg-white text-black hover:bg-gray-100 transition-colors border-0"
                            >
                                تسوق الآن
                                <ArrowRight className="mr-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/#featured">
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 rounded-xl border-2 border-white text-white hover:bg-white/10 hover:text-white bg-transparent"
                            >
                                تصفح المجموعة
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
