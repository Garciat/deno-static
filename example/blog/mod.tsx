import { directory, index, jsx, tree } from "deno-static/mod.ts";
import { loadArticles } from "deno-static/articles.ts";

import { makePaths } from "./paths.ts";
import { PostMetaSchema } from "./types.ts";

import { IndexPage } from "./pages/index.tsx";
import { PostPage } from "./pages/post.tsx";

const posts = await loadArticles(
  import.meta.resolve("./posts"),
  PostMetaSchema,
  { extensions: [".md"] },
);

export default (base: `/` | `/${string}/`) => {
  const paths = makePaths(base);

  return {
    [index]: jsx(<IndexPage paths={paths} posts={posts} />),
    [paths.slugs.posts]: tree(
      function* () {
        for (const post of posts) {
          yield [paths.slugs.post(post), {
            [index]: jsx(<PostPage paths={paths} post={post} />),
          }];
        }
      },
    ),
    [paths.slugs.assets]: directory(import.meta.resolve("./assets")),
  };
};
