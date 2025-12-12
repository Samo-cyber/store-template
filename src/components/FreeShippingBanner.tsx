"use client";

import { useState, useEffect } from "react";
import { getFreeShippingSettings, FreeShippingSettings } from "@/lib/settings";
import { Timer, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FreeShippingBanner() {
    const [settings, setSettings] = useState<FreeShippingSettings | null>(null);
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const loadSettings = async () => {
            const data = await getFreeShippingSettings();
            setSettings(data);
        };
        loadSettings();
    }, []);

    useEffect(() => {
        if (!settings?.isActive) return;

        // If no end date, it's indefinite
        if (!settings.endDate) {
            setTimeLeft("");
            return;
        }

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(settings.endDate!).getTime();
            const distance = end - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft("EXPIRED");
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${days} يوم ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`);
        }, 1000);

        return () => clearInterval(interval);
    }, [settings]);

    if (!settings?.isActive) return null;
    if (settings.endDate && timeLeft === "EXPIRED") return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="bg-gradient-to-r from-violet-600 via-primary to-indigo-600 text-white relative z-40 overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] animate-shimmer"></div>

                <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-sm font-medium relative">
                    <div className="flex items-center gap-2.5 animate-pulse">
                        <div className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                            <Truck className="h-4 w-4" />
                        </div>
                        <span className="tracking-wide">شحن مجاني لفترة محدودة!</span>
                    </div>

                    {settings.endDate && timeLeft && (
                        <div className="flex items-center gap-2 bg-black/20 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-sm">
                            <Timer className="h-3.5 w-3.5 text-yellow-300" />
                            <span className="font-bold font-mono dir-ltr tracking-wider text-yellow-100">{timeLeft}</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
