import { index, json, jsx, site } from "@/lib/static.ts";

await site({
  [index]: jsx(<h1>Hello</h1>),
  "hello.json": json({ items: [1, 2, 3] }),
});
