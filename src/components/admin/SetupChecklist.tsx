"use client";

import { CheckCircle2, Circle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SetupChecklistProps {
    storeId: string;
    storeSlug: string;
    hasProducts: boolean;
    hasOrders: boolean;
    isCustomized: boolean; // e.g. has logo/description
    onboardingCompleted?: boolean;
}

export function SetupChecklist({ storeId, storeSlug, hasProducts, hasOrders, isCustomized, onboardingCompleted }: SetupChecklistProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleVisitStore = async () => {
        if (onboardingCompleted) return;

        setLoading(true);
        try {
            await fetch('/api/stores/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeId,
                    updates: { onboarding_completed: true }
                })
            });
            router.refresh();
        } catch (error) {
            console.error("Failed to update onboarding status", error);
        } finally {
            setLoading(false);
        }
    };

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
            completed: !!onboardingCompleted,
            href: `/store/${storeSlug}`,
            action: 'زيارة المتجر',
            external: true,
            onClick: handleVisitStore
        }
    ];

    const completedCount = tasks.filter(t => t.completed).length;
    const progress = (completedCount / tasks.length) * 100;

    if (completedCount === tasks.length) return null; // Hide if all done

    return (
        <div className="bg-card rounded-xl border border-border p-6 mb-8 shadow-sm">
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
            <div className="h-2 w-full bg-secondary/20 rounded-full mb-6 overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="space-y-4">
                {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/10 transition-colors border border-transparent hover:border-border/50">
                        <div className="flex items-center gap-3">
                            {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                                <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                            <div>
                                <div className={`font-medium ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                    {task.title}
                                </div>
                                <div className="text-xs text-muted-foreground">{task.description}</div>
                            </div>
                        </div>
                        {!task.completed && (
                            <Link
                                href={task.href}
                                target={task.external ? "_blank" : undefined}
                                onClick={task.onClick}
                            >
                                <Button size="sm" variant="outline" className="gap-2 bg-background hover:bg-secondary/20 border-border">
                                    {loading && task.id === 'visit' ? <Loader2 className="w-3 h-3 animate-spin" /> : task.action}
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
