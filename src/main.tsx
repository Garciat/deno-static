import Markdown from "npm:react-markdown";

import { index, json, jsx, site } from "@/lib/static.ts";

import { BaseLayout } from "@/src/layouts/base.tsx";

await site({
  [index]: jsx(
    <BaseLayout title="deno-static">
      <Markdown>
        {(await import("./index.md", { with: { type: "text" } })).default}
      </Markdown>
    </BaseLayout>,
  ),
  "hello.json": json({ items: [1, 2, 3] }),
});
