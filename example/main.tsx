import remarkGfm from "npm:remark-gfm@4.0.1";

import { directory, index, jsx, site } from "deno-static/mod.ts";
import { MarkdownModule, syntaxHighlighting } from "deno-static/markdown.tsx";

import { BaseLayout } from "./layouts/base.tsx";

import blog from "./blog/mod.tsx";

await site({
  [index]: jsx(
    <BaseLayout title="deno-static">
      <main>
        <MarkdownModule
          remarkPlugins={[remarkGfm]}
          components={{ ...syntaxHighlighting() }}
        >
          {import("../README.md", { with: { type: "text" } })}
        </MarkdownModule>
      </main>
    </BaseLayout>,
  ),
  "assets": directory(import.meta.resolve("./assets/")),

  // Blog
  ["blog"]: blog("/blog/"),
});
