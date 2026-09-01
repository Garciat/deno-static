import React from "react";
import { renderToReadableStream } from "react-dom/server";

// API

export const index = Symbol("index");

export async function jsx(
  node: React.ReactNode,
): Promise<TypedResponse<"html">> {
  return new Response(
    await renderToReadableStream(node),
    {
      headers: { "content-type": "text/html; charset=utf-8" },
    },
  ) as TypedResponse<"html">;
}

export function json(value: unknown): TypedResponse<"json"> {
  return new Response(
    JSON.stringify(value),
    {
      headers: { "content-type": "application/json" },
    },
  ) as TypedResponse<"json">;
}

export function file(mimeType: string, body: BodyInit): TypedResponse {
  return new Response(body, {
    headers: { "content-type": mimeType },
  }) as TypedResponse;
}

export async function site(tree: Tree) {
  const dev = Deno.args.includes("--dev");

  if (dev) {
    Deno.serve(
      {
        hostname: "localhost",
        port: 3000,
        onListen(addr) {
          console.log(`Listening on http://${addr.hostname}:${addr.port}`);
        },
      },
      await handler(tree),
    );
  } else {
    await render(tree, `${Deno.cwd()}/_site`);
    Deno.exit(0);
  }
}

// Implementation

declare const responseType: unique symbol;

type KnownExtension = "html" | "json";
type FileExtension = KnownExtension | unknown;

type TypedResponse<T extends FileExtension = unknown> = Response & {
  readonly [responseType]: T;
};

type Tree =
  & {
    [Key in typeof index]?: TreeLeaf<"html">;
  }
  & {
    [Ext in KnownExtension as `${string}.${Ext}`]: TreeLeaf<Ext>;
  }
  & {
    [Ext in `${string}.${string}`]: TreeLeaf;
  }
  & {
    [Key in PropertyKey]: TreeNode;
  };

type PathSegment = string;

type TreeNode =
  | Tree
  | Promise<Tree>
  | TreeLeaf;

type TreeLeaf<R extends FileExtension = unknown> =
  | TypedResponse<R>
  | Promise<TypedResponse<R>>;

type URLPathname = string;

type FlatSite = Map<URLPathname, Response>;

function toPathname(path: readonly PathSegment[], index: boolean): URLPathname {
  return `/${path.join("/")}${(index && path.length) ? "/" : ""}`;
}

async function flatten(tree: Tree): Promise<FlatSite> {
  const flat = new Map<URLPathname, Response>();

  type Item = {
    path: readonly PathSegment[];
    response: Response;
    index: boolean;
  };

  async function* walk(
    path: readonly PathSegment[],
    node: TreeNode,
  ): AsyncGenerator<Item> {
    if (node instanceof Response) {
      yield { path, response: node, index: false };
    } else if (node instanceof Promise) {
      yield* walk(path, await node);
    } else {
      if (node[index] !== undefined) {
        yield { path, response: await node[index], index: true };
      }

      for (const [key, child] of Object.entries(node)) {
        yield* walk([...path, key], child);
      }
    }
  }

  for await (const { path, response, index } of walk([], tree)) {
    flat.set(toPathname(path, index), response);
  }

  return flat;
}

async function handler(
  tree: Tree,
): Promise<(req: Request) => Response> {
  const flat = await flatten(tree);

  return (req) => {
    const res = flat.get(new URL(req.url).pathname);

    if (res === undefined) {
      return new Response("Not Found", { status: 404 });
    }

    return res.clone();
  };
}

async function render(tree: Tree, dest: string) {
  await Deno.mkdir(dest, { recursive: true });

  const flat = await flatten(tree);

  for (const [path, res] of flat.entries()) {
    const renderedPath = path.endsWith("/") ? `${path}index.html` : path;

    console.log(`Writing ${renderedPath}`);

    await Deno.writeFile(
      `${dest}${renderedPath}`,
      res.body ?? new Uint8Array(),
    );
  }
}
