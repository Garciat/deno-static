# This is deno-static

A minimal, no-magic static site generator for [Deno](https://deno.com/).

**deno-static** favors a direct, WYSIWYG functional style over behavior through
convention.

Read more:

- [Design](#design) - the ideas behind the library

- [Usage](#usage) - how to set up your site

- [Helpers](#helpers) - various functions for common use cases

- [Patterns](#patterns) - ideas on how to structure your code effectively

- [Examples](#examples) - sites built using deno-static

## Design

The core data type is a recursive tree data structure represented by a record
whose keys are URL path segments (e.g. `/segment-1/segment-2/segment-3`) and
whose values are either plain
[Web API Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
objects or further tree nodes. (Note: only the Response's body is relevant.)

```typescript
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

```
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

```tsx
import { index, jsx } from "deno-static/mod.ts";

await site({
  [index]: jsx(<h1>Welcome!</h1>),
});
```

### `json`

Just a wrapper for
[Response.json()](https://developer.mozilla.org/en-US/docs/Web/API/Response/json_static).

```tsx
import { json } from "deno-static/mod.ts";

await site({
  "data.json": json([
    { id: 1, name: "Jake" },
    { id: 2, name: "John" },
  ]),
});
```

### `file`

Can be used to construct `Response`s from any object conforming to
[BodyInit](https://docs.deno.com/api/web/fetch/#BodyInit).

```tsx
import { file } from "deno-static/mod.ts";

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
import { jsx, tree } from "deno-static/mod.ts";

await site({
  "dynamic": tree(
    function* () {
      yield ["a.html", jsx(<h1>Hello!</h1>)];
      yield ["b.html", jsx(<h1>Bye!</h1>)];
    },
  ),
});
```

Also supports async generators.

### `directory`

Constructs a `Tree` from the specified file system directory.

```tsx
import { directory, index, jsx } from "deno-static/mod.ts";

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

## Patterns

### Compute, then render

Idea: separate the concerns of data computation from site rendering.

```tsx
// src/main.tsx

import { file, index, jsx, site, tree } from "deno-static/mod.ts";

import { computeAllSiteData } from "./data.ts";

import { HomePage } from "./pages/home.tsx";
import { PostPage } from "./pages/post.tsx";

// fetch & compute all of the data the site needs
const data = await computeAllSiteData();

// render it into files
await site({
  [index]: jsx(<HomePage posts={data.posts} />),
  "posts": tree(
    data.posts.map((post) => [post.slug, jsx(<PostPage post={post} />)]),
  ),
  "sitemap.xml": file(XML.stringify(data.sitemap)),
});
```

### Centralized paths

Idea: avoid hardcoded URL paths.

```tsx
// src/paths.ts

import { Post } from "./types.ts";

export const paths = {
  slugs: {
    posts: "posts",
    sitemap: "sitemap.xml",
  },
  home() {
    return "/" as const;
  },
  post(post: Post) {
    return `/${this.slugs.posts}/${post.slug}/`;
  },
};
```

```tsx
// src/main.tsx

// (redacted)

await site({
  [index]: jsx(<HomePage posts={data.posts} />),
  [paths.slugs.posts]: tree(
    data.posts.map((post) => [post.slug, jsx(<PostPage post={post} />)]),
  ),
  [paths.slugs.sitemap]: file(XML.stringify(data.sitemap)),
});
```

```tsx
// src/pages/home.tsx

import { helpers } from "deno-static/mod.ts";

import { paths } from "../paths.ts";
import { Post } from "../types.ts";

type HomePageProps = {
  posts: Post[];
};

export const HomePage: React.FC<HomePageProps> = ({ posts }) => (
  <main>
    <h1>
      <a href={helpers.url(paths.home())}>My Blog!</a>
    </h1>
    <ul>
      {posts.map((post) => (
        <li>
          <a href={helpers.url(paths.post(post))}>{post.title}</a>
        </li>
      ))}
    </ul>
  </main>
);
```

### More

Check out the [Examples](#examples) for other emerging patterns.

## Examples

- [Home page](https://garciat.com/deno-static/) -
  [source](https://github.com/Garciat/deno-static/tree/main/example)

- [Example Blog](https://garciat.com/deno-static/blog/) -
  [source](https://github.com/Garciat/deno-static/tree/main/example/blog)

- https://github.com/Garciat/lang-news

- https://github.com/Garciat/openjdk-jep-history

## Alternatives

- [Lume](https://github.com/lumeland/lume) is a _brilliant_, batteries-included,
  Deno-native SSG solution.

## Future Ideas

- [ ] Compile/bundle TS/TSX code with esbuild
