import { parse } from "jsr:@std/path@1.1.6/parse";

import { Post } from "./types.ts";

export const makePaths = (base: `/` | `/${string}/`) => ({
  base,
  slugs: {
    assets: "assets",
    posts: "posts",
    post(post: Post) {
      return parse(post.path).name;
    },
    rss: "rss.xml",
  },
  home() {
    return this.base;
  },
  rss() {
    return `${this.base}${this.slugs.rss}` as const;
  },
  post(post: Post) {
    return `${this.base}${this.slugs.posts}/${this.slugs.post(post)}/` as const;
  },
  asset(path: `/${string}`) {
    return `${this.base}${this.slugs.assets}${path}` as const;
  },
} as const);

export type Paths = ReturnType<typeof makePaths>;
