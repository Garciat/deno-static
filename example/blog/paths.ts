import { slugify } from "jsr:@std/text@1.0.19/unstable-slugify";

import { Post } from "./types.ts";

export const makePaths = (base: `/` | `/${string}/`) => ({
  base,
  slugs: {
    assets: "assets",
    posts: "posts",
    post(post: Post) {
      return slugify(post.meta.title);
    },
  },
  home() {
    return this.base;
  },
  post(post: Post) {
    return `${this.base}${this.slugs.posts}/${this.slugs.post(post)}/` as const;
  },
  asset(path: `/${string}`) {
    return `${this.base}${this.slugs.assets}${path}` as const;
  },
} as const);

export type Paths = ReturnType<typeof makePaths>;
