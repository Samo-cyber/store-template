import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
            <h1 className="text-9xl font-bold text-primary/20">404</h1>
            <h2 className="text-2xl md:text-4xl font-bold mt-4 mb-2">الصفحة غير موجودة</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
                عذراً، الصفحة التي تحاول الوصول إليها غير موجودة أو تم نقلها.
            </p>
            <Link href="/">
                <Button size="lg" className="gap-2">
                    <ArrowRight className="h-4 w-4" />
                    العودة للرئيسية
                </Button>
            </Link>
        </div>
    );
}
