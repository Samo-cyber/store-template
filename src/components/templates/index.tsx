import ModernTemplate from "./ModernTemplate";
import ClassicTemplate from "./ClassicTemplate";

export const templates = {
    modern: ModernTemplate,
    classic: ClassicTemplate,
};

export type TemplateType = keyof typeof templates;
