import { extractYaml } from "jsr:@std/front-matter@1.0.9";
import { extname, fromFileUrl, join } from "jsr:@std/path@1.1.6";
import { z } from "npm:zod@4.5.4";

export interface Article<T> {
  path: string;
  meta: T;
  body: string;
}

export async function loadArticles<T>(
  path: string | URL,
  schema: z.ZodType<T>,
  options: { extensions: string[] } = { extensions: [".md"] },
): Promise<Article<T>[]> {
  const pathResolved = fromFileUrl(path);

  return await Array.fromAsync(
    async function* () {
      for await (const entry of Deno.readDir(pathResolved)) {
        if (entry.isFile && options.extensions.includes(extname(entry.name))) {
          const filepath = join(pathResolved, entry.name);
          const text = await Deno.readTextFile(filepath);

          const parts = extractYaml(text);

          const meta = schema.safeDecode(parts.attrs);

          if (!meta.success) {
            throw new Error(
              `article at "${filepath}" has invalid front matter:\n${
                z.prettifyError(meta.error)
              }`,
            );
          }

          yield {
            path: filepath,
            meta: meta.data,
            body: parts.body,
          } satisfies Article<T>;
        }
      }
    }(),
  );
}
