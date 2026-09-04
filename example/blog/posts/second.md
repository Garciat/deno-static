---
title: A new project
date: 2026-07-04
author: Gabriel G
tags:
  - Deno
  - Markdown
---

The markdown in this post is rendered by
[react-markdown](https://github.com/remarkjs/react-markdown) and its
[remark-gfm](https://github.com/remarkjs/remark-gfm) plugin.

This enables several extensions to markdown like footnotes[^1].

- [x] And checklists too!
- [ ] Cool, right?

Here is some Haskell code rendered by
[react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter):

```haskell
fibs = 1 : 1 : zipWith (+) fibs (tail fibs)
```

[^1]: This is a cool footnote!
