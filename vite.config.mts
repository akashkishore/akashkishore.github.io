import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import rehypePrettyCode from "rehype-pretty-code";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import { recmaExportWritingTableOfContents, rehypeCollectWritingHeadings } from "./src/content/writing/mdx-plugins";

export default defineConfig({
  base: "/",
  plugins: [
    mdx({
      remarkPlugins: [
        remarkGfm,
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: "frontmatter" }],
      ],
      rehypePlugins: [
        rehypeCollectWritingHeadings,
        [
          rehypePrettyCode,
          {
            defaultLang: {
              block: "plaintext",
            },
            filterMetaString: (meta) =>
              meta.includes("showLineNumbers") ? meta : `${meta} showLineNumbers`.trim(),
            keepBackground: false,
            theme: {
              dark: "github-dark",
              light: "github-light",
            },
          },
        ],
      ],
      recmaPlugins: [recmaExportWritingTableOfContents],
    }),
    react(),
    svgr(),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
    css: true,
  },
});
