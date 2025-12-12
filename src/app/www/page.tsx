import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-3xl text-center space-y-8">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    أنشئ متجرك الإلكتروني في دقائق
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    منصة متكاملة لبناء متجرك الإلكتروني بهوية فريدة وأدوات قوية. ابدأ رحلتك في التجارة الإلكترونية اليوم.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                </div>
            </div>
        </main>
    );
}
