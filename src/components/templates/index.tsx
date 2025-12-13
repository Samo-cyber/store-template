import ModernTemplate from "./ModernTemplate";
import ClassicTemplate from "./ClassicTemplate";

export const templates: Record<string, (props: { storeId: string; ownerId?: string }) => Promise<JSX.Element> | JSX.Element> = {
    modern: ModernTemplate,
    classic: ClassicTemplate,
};

export type TemplateType = keyof typeof templates;
