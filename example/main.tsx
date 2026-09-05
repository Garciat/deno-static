import remarkGfm from "npm:remark-gfm@4.0.1";
import rehypeSlug from "npm:rehype-slug@6";
import rehypeHighlight from "npm:rehype-highlight@7";

import { directory, index, jsx, site } from "deno-static/mod.ts";
import { MarkdownModule } from "deno-static/markdown.tsx";

import { BaseLayout } from "./layouts/base.tsx";

import blog from "./blog/mod.tsx";

await site({
  [index]: jsx(
    <BaseLayout title="deno-static">
      <main>
        <MarkdownModule
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug, rehypeHighlight]}
        >
          {import("../README.md", { with: { type: "text" } })}
        </MarkdownModule>
      </main>
    </BaseLayout>,
  ),
  "assets": directory(import.meta.resolve("./assets/")),

  // Example Blog
  ["blog"]: blog,
});
