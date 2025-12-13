import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { getStoreBySlug } from "@/lib/stores";
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default async function StoreLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { site: string };
}) {
    const cookieStore = cookies();
    const token = cookieStore.get('user_session')?.value;

    let userId: string | undefined;

    if (token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            userId = payload.userId as string;
        } catch (e) {
            // Invalid token
        }
    }

    // Get store to check ownership
    const store = await getStoreBySlug(params.site);
    const isOwner = userId === store?.owner_id;

    return (
        <div className="relative min-h-screen">
            {isOwner && store && (
                <div className="fixed bottom-6 left-6 z-50">
                    <Link href={`/store/${store.slug}/admin`}>
                        <button className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full shadow-xl hover:bg-purple-700 transition-all hover:scale-105 font-bold">
                            <LayoutDashboard className="w-5 h-5" />
                            لوحة التحكم
                        </button>
                    </Link>
                </div>
            )}
            {children}
        </div>
    );
}
