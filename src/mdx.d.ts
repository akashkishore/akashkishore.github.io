declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { WritingHeading, WritingMeta } from "./content/types";

  const MDXContent: ComponentType<Record<string, unknown>>;
  export const frontmatter: WritingMeta;
  export const tableOfContents: WritingHeading[];
  export default MDXContent;
}
