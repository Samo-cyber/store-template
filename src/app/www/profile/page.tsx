"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Save, User, Lock, Mail } from "lucide-react";
import LandingNavbar from "@/components/LandingNavbar";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: "",
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
            setFormData(prev => ({ ...prev, email: data.email }));
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            alert("كلمة المرور الجديدة غير متطابقة");
            setSaving(false);
            return;
        }

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.newPassword || undefined,
                    currentPassword: formData.currentPassword
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            alert("تم تحديث الملف الشخصي بنجاح");
            setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
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

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <LandingNavbar user={user} />

            <div className="container mx-auto px-4 py-24">
                <div className="max-w-xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold">الملف الشخصي</h1>
                        <p className="text-slate-400">إدارة معلومات حسابك</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-purple-400" />
                                    البريد الإلكتروني
                                </label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-slate-900/50 border-white/10"
                                    required
                                />
                            </div>

                            <div className="border-t border-white/10 my-6 pt-6 space-y-6">
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-purple-400" />
                                    تغيير كلمة المرور
                                </h3>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">كلمة المرور الحالية (مطلوبة للتعديل)</label>
                                    <Input
                                        type="password"
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        className="bg-slate-900/50 border-white/10"
                                        placeholder="********"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">كلمة المرور الجديدة</label>
                                        <Input
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            className="bg-slate-900/50 border-white/10"
                                            placeholder="********"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">تأكيد كلمة المرور</label>
                                        <Input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="bg-slate-900/50 border-white/10"
                                            placeholder="********"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" disabled={saving} className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                حفظ التغييرات
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
