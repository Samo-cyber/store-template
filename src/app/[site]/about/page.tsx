"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Award, PenTool, Users, Star } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen flex flex-col relative overflow-hidden">
            <Navbar />

            <section className="flex-1 relative z-10">
                {/* Hero Section */}
                <div className="py-24 md:py-32 text-center container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white">
                            قصتنا <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">وإلهامنا</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                            نحن نؤمن بأن الفخامة ليست مجرد مظهر، بل هي أسلوب حياة. رحلتنا بدأت بشغف للتفاصيل ورغبة في تقديم الأفضل.
                        </p>
                    </motion.div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 pb-24 space-y-24">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                                <Star className="h-4 w-4 fill-primary" />
                                <span className="text-sm font-medium">التميز هو معيارنا</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                برستيج: <span className="text-primary">عنوان الفخامة</span> في مصر
                            </h2>
                            <p className="text-slate-400 leading-relaxed text-lg">
                                بدأت رحلة "برستيج" في عام 2015 من قلب القاهرة، برؤية طموحة لإعادة تعريف مفهوم التسوق الفاخر. لم نكن مجرد متجر، بل كنا نسعى لخلق تجربة استثنائية تليق بالنخبة.
                            </p>
                            <p className="text-slate-400 leading-relaxed text-lg">
                                اليوم، نفخر بكوننا الوجهة الأولى لكل من يبحث عن التميز. نختار كل قطعة بعناية فائقة من أرقى دور الأزياء العالمية والمحلية، لنضمن لعملائنا مظهراً متفرداً يعكس شخصيتهم القوية. في "برستيج"، الجودة ليست خياراً، بل هي الأساس الذي نبني عليه كل شيء.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                                alt="About Us"
                                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                            />
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Award className="h-8 w-8" />}
                            title="الجودة أولاً"
                            description="نلتزم بأعلى معايير الجودة العالمية في كل قطعة نقدمها لضمان رضاكم التام."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<PenTool className="h-8 w-8" />}
                            title="تصميم عصري"
                            description="نواكب أحدث صيحات الموضة والتصميم لنقدم لكم منتجات فريدة ومتميزة."
                            delay={0.3}
                        />
                        <FeatureCard
                            icon={<Users className="h-8 w-8" />}
                            title="خدمة متميزة"
                            description="فريق دعم محترف متواجد دائماً لخدمتكم والإجابة على كافة استفساراتكم."
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 group"
        >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center mb-6 text-white group-hover:scale-110 group-hover:text-primary transition-all duration-300 shadow-lg">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-4 text-white group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{description}</p>
        </motion.div>
    );
}
