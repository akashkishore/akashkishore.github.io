import type { WritingCategory, WritingHeading, WritingMeta, WritingPost } from "../types";

type MdxModule = {
  default: WritingPost["Content"];
  frontmatter?: WritingMeta;
  tableOfContents?: WritingHeading[];
};

const categoryOrder: WritingCategory[] = ["Papers", "Cooking", "Science", "Misc"];
const categorySet = new Set<WritingCategory>(categoryOrder);

const postModules = import.meta.glob("./posts/*.mdx", { eager: true }) as Record<string, MdxModule>;
const rawPostModules = import.meta.glob("./posts/*.mdx?raw", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function ensureMeta(value: WritingMeta | undefined, modulePath: string): WritingMeta {
  if (!value) {
    throw new Error(`Writing module "${modulePath}" is missing frontmatter`);
  }

  const requiredFields: Array<keyof WritingMeta> = ["slug", "title", "date", "excerpt", "category"];
  for (const field of requiredFields) {
    if (!value[field]) {
      throw new Error(`Writing module "${modulePath}" is missing required field "${field}"`);
    }
  }

  if (!categorySet.has(value.category)) {
    throw new Error(`Writing module "${modulePath}" has invalid category "${value.category}"`);
  }

  if (Number.isNaN(Date.parse(value.date))) {
    throw new Error(`Writing module "${modulePath}" has invalid date "${value.date}"`);
  }

  const fileSlug = modulePath.split("/").pop()?.replace(/\.mdx$/, "");
  if (fileSlug && fileSlug !== value.slug) {
    throw new Error(`Writing module "${modulePath}" slug "${value.slug}" must match filename "${fileSlug}"`);
  }

  return value;
}

function stripMdxForWordCount(source: string): string {
  return source
    .replace(/^---[\s\S]*?---\s*/u, "")
    .replace(/^import\s.+$/gmu, "")
    .replace(/^export\s.+$/gmu, "")
    .replace(/```[\s\S]*?```/gu, " ")
    .replace(/`[^`]+`/gu, " ")
    .replace(/<[^>\n]+\/>/gu, " ")
    .replace(/<[^>\n]+>[\s\S]*?<\/[^>\n]+>/gu, " ")
    .replace(/\{[^}]+\}/gu, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/gu, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/gu, "$1")
    .replace(/[>#*_~-]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function buildSearchText(source: string, meta: WritingMeta): string {
  return [
    meta.title,
    meta.excerpt,
    ...(meta.tags ?? []),
    stripMdxForWordCount(source),
  ]
    .join(" ")
    .toLowerCase();
}

function formatWordCount(source: string): string {
  const words = stripMdxForWordCount(source).split(/\s+/u).filter(Boolean).length;
  return `${words} words`;
}

export const writingPosts: WritingPost[] = Object.entries(postModules)
  .map(([modulePath, moduleValue]) => {
    const meta = ensureMeta(moduleValue.frontmatter, modulePath);
    const rawSource =
      rawPostModules[modulePath] ??
      rawPostModules[`${modulePath}?raw`] ??
      [meta.title, meta.excerpt, ...(moduleValue.tableOfContents ?? []).map((heading) => heading.text)].join(" ");

    return {
      ...meta,
      Content: moduleValue.default,
      wordCount: formatWordCount(rawSource),
      searchText: buildSearchText(rawSource, meta),
      headings: moduleValue.tableOfContents ?? [],
    };
  })
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

export const writingCategories = categoryOrder;

export function getWritingPostBySlug(slug: string | undefined): WritingPost | undefined {
  return writingPosts.find((post) => post.slug === slug);
}

export function getFeaturedWritingPosts(): WritingPost[] {
  return writingPosts.filter((post) => post.featured);
}

export function getRelatedWritingPosts(post: WritingPost, limit = 2): WritingPost[] {
  return writingPosts.filter((candidate) => candidate.slug !== post.slug && candidate.category === post.category).slice(0, limit);
}
