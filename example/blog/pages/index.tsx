import { helpers } from "deno-static/mod.ts";

import { Paths } from "../paths.ts";
import { Post } from "../types.ts";

import { PageLayout } from "./layouts/page.tsx";

type IndexPageProps = {
  paths: Paths;
  posts: Post[];
};

export const IndexPage: React.FC<IndexPageProps> = ({ paths, posts }) => (
  <PageLayout paths={paths} title="My Blog">
    <div className="content">
      {posts.toSorted(
        (a, b) => Temporal.Instant.compare(b.meta.date, a.meta.date),
      ).map((post) => (
        <article key={post.path}>
          <h3>
            <a href={helpers.url(paths.post(post))}>{post.meta.title}</a>
          </h3>
          <time>
            {post.meta.date.toLocaleString("en", { dateStyle: "long" })}
          </time>
        </article>
      ))}
    </div>
  </PageLayout>
);
