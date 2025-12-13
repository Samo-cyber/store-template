import { getStoreBySlug } from "@/lib/stores";
import { notFound } from "next/navigation";
import StoreTemplate from "@/components/templates/StoreTemplate";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({ params }: { params: { site: string } }) {
    const store = await getStoreBySlug(params.site);

    if (!store) {
        if (params.site !== 'demo') {
            notFound();
        }
    }

    const storeId = store ? store.id : "";
    const ownerId = store ? store.owner_id : "";

    return <StoreTemplate storeId={storeId} ownerId={ownerId} />;
}
