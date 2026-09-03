import {
  directory,
  file,
  index,
  json,
  jsx,
  MarkdownModule,
  site,
} from "deno-static/mod.ts";

import { BaseLayout } from "./layouts/base.tsx";

await site({
  [index]: jsx(
    <BaseLayout title="deno-static">
      <main>
        <MarkdownModule>
          {import("../README.md", { with: { type: "text" } })}
        </MarkdownModule>
      </main>
    </BaseLayout>,
  ),
  "hello.json": json({ items: [1, 2, 3] }),
  "example.xml": file("<parent><child/></parent>"),
  "assets": directory(new URL(import.meta.resolve("./assets/"))),
});
