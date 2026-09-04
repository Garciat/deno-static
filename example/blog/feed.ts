import { helpers } from "deno-static/mod.ts";

import { Feed } from "npm:feed@6.0.0";

import { Post } from "./types.ts";
import { SiteConfig } from "./config.ts";
import { Paths } from "./paths.ts";

export function rss2(paths: Paths, posts: Post[]): string {
  const feed = new Feed({
    title: SiteConfig.title,
    description: SiteConfig.description,
    language: SiteConfig.language,
    link: helpers.url(paths.home(), true),
    feedLinks: {
      rss: helpers.url(paths.rss(), true),
    },
  });

  for (const post of posts) {
    feed.addItem({
      title: post.meta.title,
      link: helpers.url(paths.post(post), true),
      date: new Date(post.meta.date.epochMilliseconds),
      description: post.meta.excerpt,
    });
  }

  return feed.rss2();
}
