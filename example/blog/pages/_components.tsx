import { helpers } from "deno-static/mod.ts";

import { paths } from "../paths.ts";
import { Post } from "../types.ts";

export const PostDetails = ({ post }: { post: Post }) => (
  <div className="post-details">
    <p>by {post.meta.author}</p>
    <p>
      <time>
        {post.meta.date.toLocaleString("en", { dateStyle: "long" })}
      </time>
    </p>
    <p>
      Tags: {post.meta.tags.join(", ")}
    </p>
  </div>
);

export const GlobalFooter = () => (
  <footer>
    <div className="container">
      <p>
        This blog has an <a href={helpers.url(paths.rss())}>RSS feed</a>
      </p>
    </div>
  </footer>
);
