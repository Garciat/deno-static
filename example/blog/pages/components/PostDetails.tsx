import { Post } from "../../types.ts";

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
