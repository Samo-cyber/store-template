import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ReturnsPage() {
    return (
        <main className="min-h-screen flex flex-col">
            <Navbar />
            <section className="flex-1 py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="text-3xl font-bold mb-8">سياسة الإرجاع والاستبدال</h1>
                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                        <p>
                            نحن في "برستيج" نريد أن تكونوا راضين تماماً عن مشترياتكم. إذا لم تكونوا سعداء بمنتج ما، فنحن هنا للمساعدة.
                        </p>

                        <h3 className="text-foreground font-bold text-lg">1. فترة الإرجاع</h3>
                        <p>
                            يمكنكم إرجاع أو استبدال المنتجات خلال 14 يوماً من تاريخ الاستلام.
                        </p>

                        <h3 className="text-foreground font-bold text-lg">2. شروط الإرجاع</h3>
                        <ul className="list-disc list-inside">
                            <li>يجب أن يكون المنتج في حالته الأصلية وغير مستخدم.</li>
                            <li>يجب أن يكون المنتج في عبوته الأصلية مع جميع الملصقات.</li>
                            <li>يجب تقديم إيصال الشراء أو رقم الطلب.</li>
                        </ul>

                        <h3 className="text-foreground font-bold text-lg">3. المنتجات غير القابلة للإرجاع</h3>
                        <p>
                            لا يمكن إرجاع المنتجات الشخصية (مثل الملابس الداخلية ومستحضرات التجميل) لأسباب صحية، إلا إذا كانت معيبة.
                        </p>

                        <h3 className="text-foreground font-bold text-lg">4. استرداد الأموال</h3>
                        <p>
                            بمجرد استلامنا للمنتج المرتجع وفحصه، سنقوم بإبلاغكم بالموافقة أو الرفض. في حالة الموافقة، سيتم استرداد المبلغ بنفس طريقة الدفع الأصلية خلال 5-10 أيام عمل.
                        </p>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
