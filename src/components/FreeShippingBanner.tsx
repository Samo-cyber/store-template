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
        if (!settings?.isActive || !settings.endDate) return;

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

            setTimeLeft(`${days}ي ${hours}س ${minutes}د ${seconds}ث`);
        }, 1000);

        return () => clearInterval(interval);
    }, [settings]);

    if (!settings?.isActive || !settings.endDate || timeLeft === "EXPIRED") return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="bg-gradient-to-r from-primary to-purple-600 text-white relative z-[100]"
            >
                <div className="container mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm font-medium">
                    <div className="flex items-center gap-2 animate-pulse">
                        <Truck className="h-4 w-4" />
                        <span>شحن مجاني لفترة محدودة!</span>
                    </div>

                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                        <Timer className="h-3 w-3" />
                        <span className="font-bold font-mono dir-ltr">{timeLeft}</span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
