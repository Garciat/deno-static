import { helpers } from "deno-static/mod.ts";

import Markdown from "npm:react-markdown@10";
import remarkGfm from "npm:remark-gfm@4.0.1";
import rehypeHighlight from "npm:rehype-highlight@7";

import { SiteConfig } from "../config.ts";
import { Post } from "../types.ts";

import { BaseLayout } from "./_layouts.tsx";
import { GlobalFooter, PostDetails } from "./_components.tsx";
import { paths } from "../paths.ts";

type PostPageProps = {
  post: Post;
};

export const PostPage: React.FC<PostPageProps> = ({ post }) => (
  <BaseLayout
    url={paths.post(post)}
    title={`${post.meta.title} - ${SiteConfig.title}`}
  >
    <main>
      <header>
        <div className="container">
          <h1>
            <a href={helpers.url(paths.home())}>{SiteConfig.title}</a>
          </h1>
        </div>
      </header>
      <div className="content">
        <h1>{post.meta.title}</h1>
        <PostDetails post={post} />
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {post.body}
        </Markdown>
      </div>
      <GlobalFooter />
    </main>
  </BaseLayout>
);
