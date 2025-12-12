import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ShippingPage() {
    return (
        <main className="min-h-screen flex flex-col">
            <Navbar />
            <section className="flex-1 py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="text-3xl font-bold mb-8">سياسة الشحن والتوصيل</h1>
                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                        <p>
                            نحن في "برستيج" نسعى لتوصيل طلباتكم في أسرع وقت ممكن وبأفضل حالة.
                        </p>

                        <h3 className="text-foreground font-bold text-lg">1. مناطق التوصيل</h3>
                        <p>
                            نقوم حالياً بالتوصيل إلى جميع محافظات جمهورية مصر العربية.
                        </p>

                        <h3 className="text-foreground font-bold text-lg">2. تكلفة الشحن</h3>
                        <p>
                            تختلف تكلفة الشحن حسب المحافظة ووزن الطلب. سيتم عرض تكلفة الشحن النهائية عند إتمام الطلب.
                        </p>

                        <h3 className="text-foreground font-bold text-lg">3. مدة التوصيل</h3>
                        <ul className="list-disc list-inside">
                            <li>القاهرة والجيزة: 1-3 أيام عمل.</li>
                            <li>الإسكندرية ومحافظات الدلتا: 2-4 أيام عمل.</li>
                            <li>الصعيد وباقي المحافظات: 3-5 أيام عمل.</li>
                        </ul>

                        <h3 className="text-foreground font-bold text-lg">4. تتبع الطلب</h3>
                        <p>
                            بمجرد شحن طلبك، ستتلقى رسالة بريد إلكتروني تحتوي على رقم التتبع ورابط لمتابعة حالة الشحنة.
                        </p>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
