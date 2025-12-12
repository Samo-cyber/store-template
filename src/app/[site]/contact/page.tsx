"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, MapPin, Phone, Send, ArrowRight, Clock, Globe, Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-hidden">
            <Navbar />

            <section className="flex-1 relative z-10 pt-24 pb-16 md:pt-32 md:pb-24">
                <div className="container mx-auto px-4">
                    {/* Hero Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16 md:mb-24 max-w-3xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white">
                            تواصل <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">معنا</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                            نحن هنا لتحويل استفساراتك إلى حلول. فريقنا متاح على مدار الساعة لتقديم تجربة دعم استثنائية تليق بك.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                        {/* Contact Info Cards (Left Side) */}
                        <div className="lg:col-span-5 space-y-6">
                            <ContactCard
                                icon={<Mail className="h-6 w-6" />}
                                title="البريد الإلكتروني"
                                content="info@prestige-store.com"
                                subContent="نرد خلال 24 ساعة"
                                delay={0.2}
                            />
                            <ContactCard
                                icon={<Phone className="h-6 w-6" />}
                                title="الهاتف"
                                content="+20 100 123 4567"
                                subContent="متاح من 9 ص - 5 م"
                                delay={0.3}
                            />
                        </div>

                        {/* Social Media (Right Side) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="lg:col-span-7"
                        >
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden h-full flex flex-col justify-center">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none" />

                                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                    <Globe className="h-6 w-6 text-primary" />
                                    تواصل معنا عبر السوشيال ميديا
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <SocialLink
                                        href="#"
                                        icon={<Facebook className="h-6 w-6" />}
                                        label="Facebook"
                                        color="bg-[#1877F2]"
                                    />
                                    <SocialLink
                                        href="#"
                                        icon={<Instagram className="h-6 w-6" />}
                                        label="Instagram"
                                        color="bg-[#E4405F]"
                                    />
                                    <SocialLink
                                        href="#"
                                        icon={<Twitter className="h-6 w-6" />}
                                        label="Twitter"
                                        color="bg-[#1DA1F2]"
                                    />
                                    <SocialLink
                                        href="#"
                                        icon={<Linkedin className="h-6 w-6" />}
                                        label="LinkedIn"
                                        color="bg-[#0A66C2]"
                                    />
                                    <SocialLink
                                        href="#"
                                        icon={<Youtube className="h-6 w-6" />}
                                        label="YouTube"
                                        color="bg-[#FF0000]"
                                    />
                                    <SocialLink
                                        href="#"
                                        icon={<Send className="h-6 w-6" />}
                                        label="Telegram"
                                        color="bg-[#0088cc]"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}

function ContactCard({ icon, title, content, subContent, delay }: { icon: React.ReactNode, title: string, content: string, subContent: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="group flex items-start gap-5 p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 cursor-default"
        >
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shrink-0 text-white group-hover:scale-110 group-hover:text-primary transition-all duration-300 shadow-lg">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-lg text-white mb-1">{title}</h3>
                <p className="text-primary font-medium mb-1">{content}</p>
                <p className="text-sm text-slate-500">{subContent}</p>
            </div>
        </motion.div>
    );
}

function SocialLink({ href, icon, label, color }: { href: string, icon: React.ReactNode, label: string, color: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
        >
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${color}`}>
                {icon}
            </div>
            <span className="font-medium text-white group-hover:text-primary transition-colors">{label}</span>
            <ArrowRight className="h-4 w-4 text-slate-500 mr-auto group-hover:text-white group-hover:-translate-x-1 transition-all" />
        </a>
    );
}
