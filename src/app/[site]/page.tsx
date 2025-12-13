import { getStoreBySlug } from "@/lib/stores";
import { notFound } from "next/navigation";
import { templates, TemplateType } from "@/components/templates";

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
    // Default to 'modern' if template is missing or invalid
    // Force 'modern' template (Prestige) as requested
    const TemplateComponent = templates.modern;

    return <TemplateComponent storeId={storeId} ownerId={ownerId} />;
}
