import remarkGfm from "npm:remark-gfm@4.0.1";

import {
  directory,
  file,
  index,
  json,
  jsx,
  MarkdownModule,
  site,
  tree,
} from "deno-static/mod.ts";

import { BaseLayout } from "./layouts/base.tsx";

const content = [
  { key: "one", value: <h1>Hello</h1> },
  { key: "two", value: <h2>Hello</h2> },
];

await site({
  [index]: jsx(
    <BaseLayout title="deno-static">
      <main>
        <MarkdownModule remarkPlugins={[remarkGfm]}>
          {import("../README.md", { with: { type: "text" } })}
        </MarkdownModule>
      </main>
    </BaseLayout>,
  ),
  "hello.json": json({ items: [1, 2, 3] }),
  "example.xml": file("<parent><child/></parent>"),
  "content": tree(
    content.map(({ key, value }) => [key, { [index]: jsx(value) }]),
  ),
  "async": tree(async function* () {
    yield ["x", { [index]: jsx(<p>Pokemon X</p>) }];
    yield ["y", { [index]: jsx(<p>Pokemon Y</p>) }];
  }),
  "assets": directory(import.meta.resolve("./assets/")),
});
