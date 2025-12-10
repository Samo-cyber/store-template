import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen flex flex-col">
            <Navbar />
            <section className="flex-1 py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="text-3xl font-bold mb-8">سياسة الخصوصية</h1>
                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                        <p>
                            نحن في "برستيج" نولي اهتماماً كبيراً لخصوصية زوارنا وعملائنا. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية.
                        </p>

                        <h3 className="text-foreground font-bold text-lg">1. المعلومات التي نجمعها</h3>
                        <p>
                            قد نجمع معلومات شخصية مثل الاسم، وعنوان البريد الإلكتروني، ورقم الهاتف، وعنوان الشحن عند قيامك بالشراء أو التسجيل في موقعنا.
                        </p>

                        <h3 className="text-foreground font-bold text-lg">2. كيفية استخدام المعلومات</h3>
                        <p>
                            نستخدم المعلومات التي نجمعها لمعالجة طلباتك، وتحسين تجربتك في التسوق، وإرسال تحديثات حول منتجاتنا وعروضنا (بموافقتك).
                        </p>

                        <h3 className="text-foreground font-bold text-lg">3. حماية المعلومات</h3>
                        <p>
                            نحن نتخذ إجراءات أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الإفصاح أو الإتلاف.
                        </p>

                        <h3 className="text-foreground font-bold text-lg">4. ملفات تعريف الارتباط (Cookies)</h3>
                        <p>
                            يستخدم موقعنا ملفات تعريف الارتباط لتحسين تجربة المستخدم وتحليل حركة المرور على الموقع.
                        </p>

                        <h3 className="text-foreground font-bold text-lg">5. مشاركة المعلومات</h3>
                        <p>
                            نحن لا نبيع أو نتاجر أو نؤجر معلوماتك الشخصية لأطراف ثالثة.
                        </p>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
