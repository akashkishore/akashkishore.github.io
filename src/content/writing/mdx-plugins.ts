import type { Root as HastRoot } from "hast";
import { toString } from "hast-util-to-string";
import { valueToEstree } from "estree-util-value-to-estree";
import { visit } from "unist-util-visit";
import type { WritingHeading } from "../types";

type VFileWithData = {
  data: {
    writingHeadings?: WritingHeading[];
  };
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[`’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function rehypeCollectWritingHeadings() {
  return (tree: HastRoot, file: VFileWithData): void => {
    const seen = new Map<string, number>();
    const headings: WritingHeading[] = [];

    visit(tree, "element", (node) => {
      if (node.tagName !== "h2" && node.tagName !== "h3") {
        return;
      }

      const text = toString(node).trim();
      if (!text) {
        return;
      }

      const baseId = slugify(text) || "section";
      const count = seen.get(baseId) ?? 0;
      seen.set(baseId, count + 1);
      const id = count === 0 ? baseId : `${baseId}-${count + 1}`;

      node.properties = {
        ...node.properties,
        id,
      };

      headings.push({
        depth: node.tagName === "h2" ? 2 : 3,
        id,
        text,
      });
    });

    file.data.writingHeadings = headings;
  };
}

export function recmaExportWritingTableOfContents() {
  return (tree: { body: unknown[] }, file: VFileWithData): void => {
    const headings = file.data.writingHeadings ?? [];

    tree.body.push({
      type: "ExportNamedDeclaration",
      declaration: {
        type: "VariableDeclaration",
        kind: "const",
        declarations: [
          {
            type: "VariableDeclarator",
            id: {
              type: "Identifier",
              name: "tableOfContents",
            },
            init: valueToEstree(headings),
          },
        ],
      },
      source: null,
      specifiers: [],
    });
  };
}
