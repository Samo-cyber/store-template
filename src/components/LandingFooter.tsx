import Link from "next/link";
import { Store, Twitter, Instagram, Linkedin, Facebook, Mail, Phone, MapPin } from "lucide-react";

export default function LandingFooter() {
    return (
        <footer className="bg-slate-950 border-t border-white/10 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Store className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                TARGO
                            </span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            منصتك المتكاملة لبناء متجر إلكتروني احترافي. نوفر لك كل الأدوات التي تحتاجها للنجاح في عالم التجارة الرقمية.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-purple-600 hover:text-white transition-all">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-purple-600 hover:text-white transition-all">
                                <Instagram className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-purple-600 hover:text-white transition-all">
                                <Linkedin className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-purple-600 hover:text-white transition-all">
                                <Facebook className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6">روابط سريعة</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/" className="text-slate-400 hover:text-purple-400 transition-colors">الرئيسية</Link>
                            </li>
                            <li>
                                <Link href="#features" className="text-slate-400 hover:text-purple-400 transition-colors">المميزات</Link>
                            </li>
                            <li>
                                <Link href="#pricing" className="text-slate-400 hover:text-purple-400 transition-colors">الأسعار</Link>
                            </li>
                            <li>
                                <Link href="#about" className="text-slate-400 hover:text-purple-400 transition-colors">من نحن</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6">الدعم والمساعدة</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-purple-400 transition-colors">مركز المساعدة</Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-purple-400 transition-colors">الشروط والأحكام</Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-purple-400 transition-colors">سياسة الخصوصية</Link>
                            </li>
                            <li>
                                <Link href="#" className="text-slate-400 hover:text-purple-400 transition-colors">تواصل معنا</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6">تواصل معنا</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-slate-400">
                                <MapPin className="w-5 h-5 text-purple-500 shrink-0 mt-1" />
                                <span>الرياض، المملكة العربية السعودية<br />طريق الملك فهد</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400">
                                <Mail className="w-5 h-5 text-purple-500 shrink-0" />
                                <span>support@targo.com</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400">
                                <Phone className="w-5 h-5 text-purple-500 shrink-0" />
                                <span>+966 50 000 0000</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} TARGO. جميع الحقوق محفوظة.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                        <Link href="#" className="hover:text-white transition-colors">سياسة الاستخدام</Link>
                        <Link href="#" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
