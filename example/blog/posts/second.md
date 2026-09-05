---
title: A new project
date: 2026-07-04
author: Gabriel G
tags:
  - Deno
  - Markdown
excerpt: |
  Take a look at these markdown features!
---

The markdown in this post is rendered by
[react-markdown](https://github.com/remarkjs/react-markdown) and its
[remark-gfm](https://github.com/remarkjs/remark-gfm) plugin.

This enables several extensions to markdown like footnotes[^1].

- [x] And checklists too!
- [ ] Cool, right?

Here is some code rendered by
[rehype-highlight](https://github.com/rehypejs/rehype-highlight):

```typescript
export async function timed<T>(
  task: Promise<T> | (() => T | Promise<T>),
): Promise<{ value: T; duration: Temporal.Duration }> {
  const start = performance.now();
  const value = await (typeof task === "function" ? task() : task);
  const end = performance.now();
  return {
    value,
    duration: Temporal.Duration.from({
      microseconds: Math.round(1_000 * (end - start)),
    }),
  };
}
```

[^1]: This is a cool footnote!
