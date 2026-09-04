# This is deno-static

A minimal, no-magic static site generator for [Deno](https://deno.com/).

## Principles

- Avoid behavior through conventions and prefer plain explicit code.

## Design

The core data type is a recursive tree data structure represented by a record
whose keys represent URL path segments (e.g. `/segment-1/segment-2/segment-3`)
and whose values are either plain `Response` objects or further tree nodes.

```tsx
type Tree = {
  [key: PathSegment]: TreeNode;
};

type PathSegment = string;

type TreeNode = Tree | TreeLeaf;

type TreeLeaf = Response;
```

(These types are simplified for demonstration.)

For example:

```typescript
import { Tree } from "deno-static/mod.ts";

const tree = {
  "pokemon": {
    "pikachu.html": new Response("pika!"),
    "charizard.png": new Response(await Deno.readFile("charizard.png")),
  },
  "blog": {
    "posts": {
      "first-post.html": new Response("<h1>Hello!</h1>"),
    },
  },
} satisfies Tree;
```

Represents the following file hierarchy:

```text
/pokemon/pikachu.html
/pokemon/charizard.png
/blog/posts/first-post.html
```

Additionally, there is a special key symbol `index` used to denote "pretty URLs"
(e.g. `/posts/first-post/`). For example:

```typescript
const tree = {
  [index]: new Response("home"),
  "blog": {
    [index]: new Response("My Blog!"),
  },
};
```

Represents:

```text
/
/blog/
```

Finally, the `site()` function takes a `Tree` and 'renders' it to the file
system.

(Also, a number of [helper functions](#helpers) exist to assist you in the
creation of `Response` objects and also dynamic `Tree` objects.)

## Usage

0. Set up your `deno.json` file:

```json
{
  "imports": {
    "deno-static/": "https://cdn.jsdelivr.net/gh/garciat/deno-static/"
  },
  "tasks": {
    "build": "deno run --allow-all src/main.tsx",
    "serve": "deno run --allow-all --watch=./src/ src/main.tsx --dev"
  },
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "npm:react@^19",
    "strict": true
  },
  "lint": {
    "rules": {
      "exclude": ["no-import-prefix"]
    }
  }
}
```

1. Write your site definition:

```tsx
// src/main.tsx

import { index, jsx, site } from "deno-static/mod.ts";

await site({
  [index]: jsx(<h1>Hello, world!</h1>),
});
```

2. Build your site:

```sh
deno task build
```

3. Check the output:

```text
# /_site/index.html

<h1>Hello, world!</h1>
```

4. Alternatively, browse the site live (intended for development/debugging):

```sh
deno task serve
```

5. Configure a GitHub workflow to build and deploy your static site.

   See
   [.github/workflows/deploy.yml](https://github.com/Garciat/deno-static/blob/main/.github/workflows/deploy.yml)

## Helpers

### `jsx`

Renders a `ReactNode` into a `Response`. Supports asynchronous components.

(See
[renderToReadableStream](https://react.dev/reference/react-dom/server/renderToReadableStream))

### `json`

Applies `JSON.stringify` on an arbitrary object and wraps the resulting string
in a `Response`.

```tsx
await site({
  "data.json": json([
    { id: 1, name: "Jake" },
    { id: 2, name: "John" },
  ]),
});
```

### `file`

Can be used to contruct `Response`s from any object conforming to
[BodyInit](https://docs.deno.com/api/web/fetch/#BodyInit).

```tsx
await site({
  "feed.xml": file(`<rss><channel /></rss>`),
  "favicon.ico": file(generateIconToBuffer()),
});
```

Remember: the served file's MIME type is derived from its file extension. (See
[docs](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site#mime-types-on-github-pages))

### `tree`

Constructs a `Tree` from dynamic entries. For example:

```tsx
await site({
  "dynamic": tree(
    function* () {
      yield ["a.html", jsx(<h1>Hello!</h1>)];
      yield ["b.ytml", jsx(<h1>Bye!</h1>)];
    },
  ),
});
```

Also supports async generators.

### `directory`

Constructs a `Tree` from the specified file system directory.

```tsx
await site({
  [index]: jsx(<Page />),
  "assets": directory(import.meta.resolve("./assets")),
});
```

### `helpers.url`

Adjusts an absolute path based on the `BASE_URL` environment variable.

It can also generate absolute URLs. (Useful for `<link rel="canonical">` tags.)

⚠️ This is necessary when your site gets deployed under a directory. (See
[docs](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site#next-steps))

## Examples

- [Home page](https://garciat.com/deno-static/) -
  [/example/](https://github.com/Garciat/deno-static/tree/main/example)

- [Example Blog](https://garciat.com/deno-static/blog/) -
  [/example/blog/](https://github.com/Garciat/deno-static/tree/main/example/blog)

- https://github.com/Garciat/lang-news

- https://github.com/Garciat/openjdk-jep-history

## Alternatives

- [Lume](https://github.com/lumeland/lume) is a _brilliant_, batteries-included,
  Deno-native SSG solution.

## Future Ideas

- [ ] Compile/bundle TS/TSX code with esbuild
