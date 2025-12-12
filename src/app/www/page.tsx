import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ExternalLink, Store } from "lucide-react";

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

    const { data: { session } } = await supabase.auth.getSession();

    // Fetch user's store if logged in
    let userStore = null;
    if (session) {
        const { data } = await supabase
            .from('stores')
            .select('slug')
            .eq('owner_id', session.user.id)
            .single();
        userStore = data;
    }

    // Fetch all public stores
    const { data: allStores } = await supabase
        .from('stores')
        .select('name, slug, description')
        .order('created_at', { ascending: false });

    return (
        <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-4 pt-20">
            <div className="max-w-3xl text-center space-y-8 mb-20">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    أنشئ متجرك الإلكتروني في دقائق
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    منصة متكاملة لبناء متجرك الإلكتروني بهوية فريدة وأدوات قوية. ابدأ رحلتك في التجارة الإلكترونية اليوم.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {!session ? (
                        <>
                            <Link href="/create-store">
                                <Button size="lg" className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary/90">
                                    ابدأ مجاناً
                                </Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-full border-white/10 hover:bg-white/5">
                                    تسجيل الدخول
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            {userStore ? (
                                <Link href={`/store/${userStore.slug}/admin`}>
                                    <Button size="lg" className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary/90">
                                        لوحة التحكم
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/create-store">
                                    <Button size="lg" className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary/90">
                                        أنشئ متجرك الآن
                                    </Button>
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Stores List Section */}
            <div className="w-full max-w-6xl space-y-8">
                <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                    <Store className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">المتاجر المميزة</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allStores?.map((store) => (
                        <Link
                            key={store.slug}
                            href={`/store/${store.slug}`}
                            className="group block p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xl">
                                    {store.name.charAt(0)}
                                </div>
                                <ExternalLink className="h-5 w-5 text-slate-500 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{store.name}</h3>
                            <p className="text-slate-400 text-sm line-clamp-2">
                                {store.description || "متجر رائع يقدم أفضل المنتجات والخدمات."}
                            </p>
                        </Link>
                    ))}
                    {allStores?.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            لا توجد متاجر حالياً. كن أول من ينشئ متجراً!
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
