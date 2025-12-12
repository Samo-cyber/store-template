"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <main className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6 max-w-md"
                >
                    <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">شكراً لطلبك!</h1>
                        <p className="text-muted-foreground text-lg">
                            تم استلام طلبك بنجاح. سنقوم بمراجعة الطلب والتواصل معك قريباً لتأكيد موعد التوصيل.
                        </p>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg border text-sm">
                        <p className="font-medium mb-1">رقم الطلب</p>
                        <p className="text-xl font-mono tracking-widest">
                            {orderId ? `#${orderId.slice(0, 8)}` : `#ORD-${Math.floor(Math.random() * 100000)}`}
                        </p>
                    </div>

                    <div className="pt-4">
                        <Link href="/">
                            <Button size="lg" className="w-full gap-2">
                                العودة للرئيسية
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </main>
    );
}
