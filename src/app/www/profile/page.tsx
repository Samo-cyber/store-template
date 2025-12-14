"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Save, User, Lock, Mail, Phone, FileText, Settings, Bell, Shield, Store } from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: "",
        full_name: "",
        phone: "",
        bio: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const res = await fetch('/api/user/profile');
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch profile');
            const data = await res.json();
            setUser(data);
            setFormData(prev => ({
                ...prev,
                email: data.email || "",
                full_name: data.full_name || "",
                phone: data.phone || "",
                bio: data.bio || ""
            }));
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        if (activeTab === "security" && formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            alert("كلمة المرور الجديدة غير متطابقة");
            setSaving(false);
            return;
        }

        try {
            const payload: any = {
                currentPassword: formData.currentPassword
            };

            if (activeTab === "profile") {
                payload.email = formData.email;
                payload.full_name = formData.full_name;
                payload.phone = formData.phone;
                payload.bio = formData.bio;
            } else if (activeTab === "security") {
                payload.password = formData.newPassword || undefined;
            }

            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            alert("تم تحديث الملف الشخصي بنجاح");
            if (activeTab === "security") {
                setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
            }
            fetchProfile(); // Refresh data
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    const tabs = [
        { id: "profile", label: "المعلومات الشخصية", icon: User },
        { id: "security", label: "الأمان وكلمة المرور", icon: Shield },
        { id: "settings", label: "الإعدادات", icon: Settings },
    ];

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <LandingNavbar user={user} />

            <div className="container mx-auto px-4 py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">الملف الشخصي</h1>
                        <p className="text-slate-400">إدارة معلومات حسابك وتفضيلاتك</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                                            ? "bg-purple-600/10 text-purple-400 border border-purple-600/20"
                                            : "hover:bg-white/5 text-slate-400 hover:text-white"
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            ))}

                            <div className="pt-4 mt-4 border-t border-white/10">
                                <Link href="/create-store">
                                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                                        <Store className="w-5 h-5" />
                                        <span className="font-medium">إنشاء متجر جديد</span>
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {activeTab === "profile" && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium flex items-center gap-2 text-slate-300">
                                                        <User className="w-4 h-4 text-purple-400" />
                                                        الاسم الكامل
                                                    </label>
                                                    <Input
                                                        value={formData.full_name}
                                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                        className="bg-slate-900/50 border-white/10 focus:border-purple-500/50"
                                                        placeholder="الاسم الكامل"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium flex items-center gap-2 text-slate-300">
                                                        <Mail className="w-4 h-4 text-purple-400" />
                                                        البريد الإلكتروني
                                                    </label>
                                                    <Input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="bg-slate-900/50 border-white/10 focus:border-purple-500/50"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium flex items-center gap-2 text-slate-300">
                                                        <Phone className="w-4 h-4 text-purple-400" />
                                                        رقم الهاتف
                                                    </label>
                                                    <Input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="bg-slate-900/50 border-white/10 focus:border-purple-500/50"
                                                        placeholder="+966..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium flex items-center gap-2 text-slate-300">
                                                    <FileText className="w-4 h-4 text-purple-400" />
                                                    نبذة عنك
                                                </label>
                                                <textarea
                                                    value={formData.bio}
                                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                    className="w-full h-32 bg-slate-900/50 border border-white/10 rounded-md p-3 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                                                    placeholder="اكتب نبذة قصيرة عنك..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "security" && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">كلمة المرور الحالية (مطلوبة للتعديل)</label>
                                                <Input
                                                    type="password"
                                                    value={formData.currentPassword}
                                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                                    className="bg-slate-900/50 border-white/10 focus:border-purple-500/50"
                                                    placeholder="********"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-300">كلمة المرور الجديدة</label>
                                                    <Input
                                                        type="password"
                                                        value={formData.newPassword}
                                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                        className="bg-slate-900/50 border-white/10 focus:border-purple-500/50"
                                                        placeholder="********"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-300">تأكيد كلمة المرور</label>
                                                    <Input
                                                        type="password"
                                                        value={formData.confirmPassword}
                                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                        className="bg-slate-900/50 border-white/10 focus:border-purple-500/50"
                                                        placeholder="********"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "settings" && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <Bell className="w-5 h-5 text-purple-400" />
                                                    <div>
                                                        <div className="font-medium">الإشعارات</div>
                                                        <div className="text-xs text-slate-400">تلقي إشعارات حول نشاط حسابك</div>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab !== "settings" && (
                                        <div className="pt-6 border-t border-white/10">
                                            <Button type="submit" disabled={saving} className="w-full md:w-auto gap-2 bg-purple-600 hover:bg-purple-700 min-w-[150px]">
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                حفظ التغييرات
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
