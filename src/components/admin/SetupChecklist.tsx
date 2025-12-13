"use client";

import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface SetupChecklistProps {
    storeSlug: string;
    hasProducts: boolean;
    hasOrders: boolean;
    isCustomized: boolean; // e.g. has logo/description
}

export function SetupChecklist({ storeSlug, hasProducts, hasOrders, isCustomized }: SetupChecklistProps) {
    const tasks = [
        {
            id: 'products',
            title: 'أضف منتجاتك',
            description: 'ابدأ بإضافة أول منتج لمتجرك',
            completed: hasProducts,
            href: `/store/${storeSlug}/admin/products/new`,
            action: 'إضافة منتج'
        },
        {
            id: 'customize',
            title: 'خصص متجرك',
            description: 'أضف شعاراً ووصفاً يعبر عن هويتك',
            completed: isCustomized,
            href: `/store/${storeSlug}/admin/settings`,
            action: 'تخصيص'
        },
        {
            id: 'visit',
            title: 'زر متجرك',
            description: 'شاهد كيف يرى العملاء متجرك',
            completed: false, // Always show as action? Or mark done if visited? Let's keep it simple.
            href: `/store/${storeSlug}`,
            action: 'زيارة المتجر',
            external: true
        }
    ];

    const completedCount = tasks.filter(t => t.completed).length;
    const progress = (completedCount / tasks.length) * 100;

    if (completedCount === tasks.length) return null; // Hide if all done

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-bold">تجهيز المتجر</h2>
                    <p className="text-sm text-muted-foreground">أكمل هذه الخطوات لإطلاق متجرك بنجاح</p>
                </div>
                <div className="text-sm font-medium text-primary">
                    {completedCount} من {tasks.length} مكتملة
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-100 rounded-full mb-6 overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="space-y-4">
                {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="flex items-center gap-3">
                            {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                                <Circle className="w-5 h-5 text-slate-300" />
                            )}
                            <div>
                                <div className={`font-medium ${task.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                    {task.title}
                                </div>
                                <div className="text-xs text-muted-foreground">{task.description}</div>
                            </div>
                        </div>
                        {!task.completed && (
                            <Link href={task.href} target={task.external ? "_blank" : undefined}>
                                <Button size="sm" variant="outline" className="gap-2">
                                    {task.action}
                                    <ArrowRight className="w-3 h-3" />
                                </Button>
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
