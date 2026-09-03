import Markdown from "npm:react-markdown@^10";

import { directory, file, index, json, jsx, site } from "deno-static/mod.ts";

import { BaseLayout } from "./layouts/base.tsx";

await site({
  [index]: jsx(
    <BaseLayout title="deno-static">
      <main>
        <Markdown>
          {(await import("../README.md", { with: { type: "text" } })).default}
        </Markdown>
      </main>
    </BaseLayout>,
  ),
  "hello.json": json({ items: [1, 2, 3] }),
  "example.xml": file("application/xml", "<parent><child/></parent>"),
  "assets": directory(new URL(import.meta.resolve("./assets/"))),
});
