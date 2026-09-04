import { syntaxHighlighting } from "deno-static/markdown.tsx";

import Markdown from "npm:react-markdown@10";
import remarkGfm from "npm:remark-gfm@4.0.1";

import { SiteConfig } from "../config.ts";
import { Paths } from "../paths.ts";
import { Post } from "../types.ts";

import { PageLayout } from "./layouts/page.tsx";
import { PostDetails } from "./components/PostDetails.tsx";

type PostPageProps = {
  paths: Paths;
  post: Post;
};

export const PostPage: React.FC<PostPageProps> = ({ paths, post }) => (
  <PageLayout
    url={paths.post(post)}
    paths={paths}
    title={`${post.meta.title} - ${SiteConfig.title}`}
  >
    <div className="content">
      <h1>{post.meta.title}</h1>
      <PostDetails post={post} />
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{ ...syntaxHighlighting() }}
      >
        {post.body}
      </Markdown>
    </div>
  </PageLayout>
);
