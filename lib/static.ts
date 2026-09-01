import React from "react";
import { renderToReadableStream } from "react-dom/server";

// API

export const index = Symbol("index");

export async function jsx(node: React.ReactNode) {
  return new Response(
    await renderToReadableStream(node),
    {
      headers: { "content-type": "text/html; charset=utf-8" },
    },
  ) as TypedResponse<"html">;
}

export function json(value: unknown) {
  return new Response(
    JSON.stringify(value),
    {
      headers: { "content-type": "application/json" },
    },
  ) as TypedResponse<"json">;
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

type ResponseKind = "html" | "json" | unknown;

type TypedResponse<T extends ResponseKind = unknown> = Response & {
  readonly [responseType]: T;
};

type Tree =
  & {
    [Key in PathSegment]: TreeNode;
  }
  & {
    [Key in typeof index]?: TreeLeaf<"html">;
  };

type PathSegment = string;

type TreeNode =
  | Tree
  | TreeLeaf;

type TreeLeaf<R extends ResponseKind = unknown> =
  | TypedResponse<R>
  | Promise<TypedResponse<R>>;

type URLPathname = string;

type FlatSite = Map<URLPathname, Response>;

function toPathname(path: readonly PathSegment[], index: boolean): URLPathname {
  return `/${path.join("/")}${(index && path.length) ? "/" : ""}`;
}

async function flatten(tree: Tree): Promise<FlatSite> {
  const flat = new Map<URLPathname, Response>();

  const walk = async (path: readonly PathSegment[], node: TreeNode) => {
    if (node instanceof Response) {
      await leaf(path, false, node);
    } else if (node instanceof Promise) {
      await leaf(path, false, node);
    } else {
      if (node[index] !== undefined) {
        await leaf(path, true, node[index]);
      }

      for (const [key, child] of Object.entries(node)) {
        await walk([...path, key], child);
      }
    }
  };

  const leaf = async (
    path: readonly PathSegment[],
    index: boolean,
    node: TreeLeaf,
  ) => {
    const response = await node;
    flat.set(toPathname(path, index), response);
  };

  await walk([], tree);

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

    return res;
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
