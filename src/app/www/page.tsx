import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ExternalLink, Store, Shield, Zap, BarChart3, CheckCircle2 } from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar";

export default async function LandingPage() {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    );

    const userSession = cookieStore.get('user_session')?.value;
    let user = null;

    if (userSession) {
        try {
            const { jwtVerify } = await import('jose');
            const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
            const { payload } = await jwtVerify(userSession, secret);
            user = {
                id: payload.userId as string,
                email: payload.email as string,
                role: payload.role as string
            };
        } catch (e) {
            console.error("Invalid session:", e);
        }
    }

    // Fetch user's store if logged in
    let userStore = null;
    if (user?.id) {
        const { data } = await supabase
            .from('stores')
            .select('slug')
            .eq('owner_id', user.id)
            .single();
        userStore = data;
    }

    // Fetch all public stores
    const { data: allStores } = await supabase
        .from('stores')
        .select('name, slug, description')
        .order('created_at', { ascending: false })
        .limit(6);

    return (
        <main className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30">
            <LandingNavbar user={user} storeSlug={userStore?.slug} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-sm font-medium text-slate-300">المنصة الأسرع نمواً في الشرق الأوسط</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent max-w-4xl mx-auto leading-tight">
                        أطلق متجرك الإلكتروني <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">بلمسة احترافية</span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        منصة متكاملة تمنحك كل ما تحتاجه للنجاح في التجارة الإلكترونية. تصميم عصري، لوحة تحكم قوية، ودعم فني متواصل.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/register">
                            <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-xl shadow-white/10 hover:scale-105">
                                ابدأ تجربتك المجانية
                            </Button>
                        </Link>
                        <Link href="#features">
                            <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-white/10 hover:bg-white/5 hover:text-white transition-all">
                                اكتشف المميزات
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-900/50 border-y border-white/5">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">لماذا تختار برستيج؟</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">نقدم لك مجموعة من الأدوات القوية التي تساعدك على إدارة متجرك وتنمية مبيعاتك بكل سهولة.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors group">
                            <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">سرعة فائقة</h3>
                            <p className="text-slate-400 leading-relaxed">متاجرنا مصممة بأحدث التقنيات لضمان سرعة تحميل فائقة وتجربة مستخدم سلسة.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors group">
                            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">حماية وأمان</h3>
                            <p className="text-slate-400 leading-relaxed">نضمن لك ولعملائك أعلى مستويات الحماية والأمان لبياناتكم ومعاملاتكم المالية.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/50 transition-colors group">
                            <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">تحليلات متقدمة</h3>
                            <p className="text-slate-400 leading-relaxed">لوحة تحكم شاملة توفر لك تقارير دقيقة عن المبيعات والزوار لتتخذ قرارات مدروسة.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Stores Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2">متاجر مميزة</h2>
                            <p className="text-slate-400">اكتشف بعض المتاجر الرائعة التي تم إنشاؤها عبر منصتنا</p>
                        </div>
                        <Link href="/stores" className="hidden md:flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                            عرض الكل <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allStores?.map((store) => (
                            <Link
                                key={store.slug}
                                href={`/store/${store.slug}`}
                                className="group block p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-white font-bold text-xl border border-white/10">
                                        {store.name.charAt(0)}
                                    </div>
                                    <div className="p-2 rounded-full bg-white/5 text-slate-400 group-hover:text-white transition-colors">
                                        <ExternalLink className="h-5 w-5" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">{store.name}</h3>
                                <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                                    {store.description || "متجر رائع يقدم أفضل المنتجات والخدمات."}
                                </p>
                            </Link>
                        ))}
                        {allStores?.length === 0 && (
                            <div className="col-span-full text-center py-20 rounded-3xl bg-white/5 border border-white/10 border-dashed">
                                <Store className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-500 text-lg">لا توجد متاجر حالياً. كن أول من ينشئ متجراً!</p>
                                <Link href="/register" className="inline-block mt-6">
                                    <Button variant="outline">أنشئ متجرك الآن</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-slate-950 pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">جاهز للبدء؟</h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
                        انضم إلى آلاف التجار الذين يثقون في منصتنا لبناء متاجرهم الإلكترونية.
                    </p>
                    <Link href="/register">
                        <Button size="lg" className="h-16 px-10 text-xl rounded-full bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-xl shadow-white/10">
                            أنشئ متجرك مجاناً
                        </Button>
                    </Link>
                    <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> تجربة مجانية 14 يوم</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> لا يحتاج بطاقة ائتمان</span>
                    </div>
                </div>
            </section>
        </main>
    );
}
