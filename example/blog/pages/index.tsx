import { helpers } from "deno-static/mod.ts";

import { SiteConfig } from "../config.ts";
import { Paths } from "../paths.ts";
import { Post } from "../types.ts";

import { PageLayout } from "./layouts/page.tsx";
import { PostDetails } from "./components/PostDetails.tsx";
import Markdown from "npm:react-markdown@10";

type IndexPageProps = {
  paths: Paths;
  posts: Post[];
};

export const IndexPage: React.FC<IndexPageProps> = ({ paths, posts }) => (
  <PageLayout url={paths.home()} paths={paths} title={SiteConfig.title}>
    <div className="content">
      <div className="post-index">
        {posts.toSorted(
          (a, b) => Temporal.Instant.compare(b.meta.date, a.meta.date),
        ).map((post) => (
          <article key={post.path}>
            <h3>
              <a href={helpers.url(paths.post(post))}>{post.meta.title}</a>
            </h3>
            <PostDetails post={post} />
            {post.meta.excerpt && (
              <div className="post-excerpt">
                <Markdown>{post.meta.excerpt}</Markdown>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  </PageLayout>
);
