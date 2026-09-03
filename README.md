# This is deno-static

A minimal, no-magic static site generator for Deno.

## Principles

- Avoid behavior through conventions and prefer plain explicit code.

## Usage

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
deno run src/main.tsx
```

3. Check the output:

```
# /_site/index.html

<h1>Hello, world!</h1>
```

4. Alternatively, browse the site live (intended for development/debugging):

```sh
deno watch --allow-all --watch=./src/ src/main.tsx --dev
```

## Examples

- The source for [this readme page](https://garciat.com/deno-static/) is
  [here](https://github.com/Garciat/deno-static/tree/main/example).

## Ideas

- [ ] Compile/bundle TS/TSX code with esbuild
