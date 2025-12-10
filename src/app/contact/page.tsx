"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, MapPin, Phone, Send, ArrowRight, Clock, Globe } from "lucide-react";
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
                            <ContactCard
                                icon={<MapPin className="h-6 w-6" />}
                                title="الموقع"
                                content="القاهرة، التجمع الخامس"
                                subContent="108 شارع التسعين الشمالي"
                                delay={0.4}
                            />

                            {/* Map Preview */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="h-64 mt-8 rounded-3xl overflow-hidden border border-white/10 relative group cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                                <div className="absolute bottom-6 right-6 flex items-center gap-2 text-white">
                                    <div className="h-10 w-10 rounded-full bg-primary/90 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:bg-primary transition-colors">
                                        <Globe className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium">عرض على الخريطة</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Contact Form (Right Side) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="lg:col-span-7"
                        >
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none" />

                                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                    <Send className="h-6 w-6 text-primary" />
                                    أرسل رسالة
                                </h2>

                                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">الاسم</label>
                                            <Input
                                                placeholder="اسمك بالكامل"
                                                className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-primary/50 h-12 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">البريد الإلكتروني</label>
                                            <Input
                                                type="email"
                                                placeholder="example@domain.com"
                                                className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-primary/50 h-12 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">الموضوع</label>
                                        <Input
                                            placeholder="كيف يمكننا مساعدتك؟"
                                            className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-primary/50 h-12 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">الرسالة</label>
                                        <textarea
                                            className="flex min-h-[150px] w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm ring-offset-background placeholder:text-slate-600 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                            placeholder="اكتب رسالتك هنا..."
                                        />
                                    </div>

                                    <Button size="lg" className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/20 transition-all duration-300 group">
                                        إرسال الرسالة
                                        <ArrowRight className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                                    </Button>
                                </form>
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
