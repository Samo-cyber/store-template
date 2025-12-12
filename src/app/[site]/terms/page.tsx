import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
    return (
        <main className="min-h-screen flex flex-col">
            <Navbar />
            <section className="flex-1 py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="text-3xl font-bold mb-8">الشروط والأحكام</h1>
                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                        <p>
                            مرحباً بكم في "برستيج". يرجى قراءة الشروط والأحكام التالية بعناية قبل استخدام موقعنا الإلكتروني.
                        </p>

                        <h3 className="text-foreground font-bold text-lg">1. قبول الشروط</h3>
                        <p>
                            من خلال الوصول إلى هذا الموقع واستخدامه، فإنك توافق على الالتزام بهذه الشروط والأحكام وجميع القوانين واللوائح المعمول بها.
                        </p>

                        <h3 className="text-foreground font-bold text-lg">2. الملكية الفكرية</h3>
                        <p>
                            جميع المحتويات الموجودة على هذا الموقع، بما في ذلك النصوص والرسومات والشعارات والصور، هي ملك لـ "برستيج" ومحمية بموجب قوانين حقوق النشر.
                        </p>

                        <h3 className="text-foreground font-bold text-lg">3. المنتجات والأسعار</h3>
                        <p>
                            نحن نسعى جاهدين لعرض منتجاتنا وأسعارنا بدقة. ومع ذلك، نحتفظ بالحق في تغيير الأسعار أو إيقاف المنتجات في أي وقت دون إشعار مسبق.
                        </p>

                        <h3 className="text-foreground font-bold text-lg">4. حساب المستخدم</h3>
                        <p>
                            إذا قمت بإنشاء حساب على موقعنا، فأنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور وتقييد الوصول إلى جهاز الكمبيوتر الخاص بك.
                        </p>

                        <h3 className="text-foreground font-bold text-lg">5. القانون الواجب التطبيق</h3>
                        <p>
                            تخضع هذه الشروط والأحكام وتفسر وفقاً لقوانين جمهورية مصر العربية.
                        </p>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
