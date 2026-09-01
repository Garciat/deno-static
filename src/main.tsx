import Markdown from "npm:react-markdown";

import { file, index, json, jsx, site } from "@/lib/static.ts";

import { BaseLayout } from "@/src/layouts/base.tsx";

await site({
  [index]: jsx(
    <BaseLayout title="deno-static">
      <Markdown>
        {(await import("../README.md", { with: { type: "text" } })).default}
      </Markdown>
    </BaseLayout>,
  ),
  "hello.json": json({ items: [1, 2, 3] }),
  "example.xml": file("application/xml", "<parent><child/></parent>"),
});
