import { syntaxHighlighting } from "deno-static/markdown.tsx";

import Markdown from "npm:react-markdown@10";
import remarkGfm from "npm:remark-gfm@4.0.1";

import { Paths } from "../paths.ts";
import { Post } from "../types.ts";

import { PageLayout } from "./layouts/page.tsx";

type PostPageProps = {
  paths: Paths;
  post: Post;
};

export const PostPage: React.FC<PostPageProps> = ({ paths, post }) => (
  <PageLayout paths={paths} title="My Blog">
    <div className="content">
      <h1>{post.meta.title}</h1>
      <time>{post.meta.date.toLocaleString("en", { dateStyle: "long" })}</time>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{ ...syntaxHighlighting() }}
      >
        {post.body}
      </Markdown>
    </div>
  </PageLayout>
);
