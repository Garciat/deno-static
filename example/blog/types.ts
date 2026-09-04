import { Article } from "deno-static/articles.ts";

import { z } from "npm:zod@4.5.4";

export const PostMetaSchema = z.object({
  title: z.string(),
  date: z.date().transform((date) => date.toTemporalInstant()),
  author: z.string(),
  tags: z.array(z.string()),
  excerpt: z.optional(z.string().trim()),
  draft: z.optional(z.boolean()),
});

export type PostMeta = z.output<typeof PostMetaSchema>;

export type Post = Article<PostMeta>;
