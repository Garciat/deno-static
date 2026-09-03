import { contentType } from "jsr:@std/media-types@1.1.0";
import * as libpath from "jsr:@std/path@1.1.6";

// @ts-types="npm:@types/react@^19"
import React from "npm:react@^19";
// @ts-types="npm:@types/react-dom@^19/server"
import { renderToReadableStream } from "npm:react-dom@^19/server";

export * from "./markdown.tsx";

// API

export const index = Symbol("index");

export async function jsx(
  node: React.ReactNode,
): Promise<TypedResponse<"html">> {
  return new Response(
    await renderToReadableStream(node),
  ) as TypedResponse<"html">;
}

export function json(value: unknown): TypedResponse<"json"> {
  return new Response(
    JSON.stringify(value),
  ) as TypedResponse<"json">;
}

export function file(body: BodyInit): TypedResponse {
  return new Response(body) as TypedResponse;
}

export const helpers = {
  url(path: `/${string}`, absolute: boolean = false) {
    const config = Deno.env.get("BASE_URL");
    if (config === undefined) {
      return path;
    }

    const base = new URL(ensureSuffix(config, "/"));

    const actual = new URL(trimPrefix(path, "/"), base);

    return absolute ? actual.toString() : actual.pathname;
  },
} as const;

export async function directory(root: string | URL): Promise<Tree> {
  const resolvedRoot = libpath.fromFileUrl(root);

  {
    const info = await Deno.stat(resolvedRoot);
    if (!info.isDirectory) {
      throw new Error(`not a directory: ${root}`);
    }
  }

  async function walk(parent: string): Promise<Tree> {
    return Object.fromEntries(
      await Array.fromAsync(async function* () {
        for await (const entry of Deno.readDir(parent)) {
          const child = libpath.join(parent, entry.name);

          if (entry.isFile) {
            const file = await Deno.open(child, { read: true });
            yield [entry.name, new Response(file.readable)];
          } else if (entry.isDirectory) {
            yield [entry.name, await walk(child)];
          } else {
            continue; // TODO meh?
          }
        }
      }()),
    ) as Tree;
  }

  return walk(resolvedRoot);
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
    await render(tree, libpath.join(Deno.cwd(), "_site"));
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
    [Key in PathSegment]: TreeNode;
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
    flat.set(formatLocalPath(path, index), response);
  }

  return flat;
}

async function handler(
  tree: Tree,
): Promise<(req: Request) => Response> {
  const flat = await flatten(tree);

  for (const path of flat.keys()) {
    console.debug(`Serving ${path}`);
  }

  return (req) => {
    const path = new URL(req.url).pathname;

    const res = flat.get(path);

    if (res === undefined) {
      return new Response("Not Found", { status: 404 });
    }

    return new Response(res.clone().body, {
      headers: {
        "content-type": servingFileMimeType(path),
      },
    });
  };
}

async function render(tree: Tree, dest: string) {
  await Deno.mkdir(dest, { recursive: true });

  const flat = await flatten(tree);

  for (const [path, res] of flat.entries()) {
    const localPath = renderedFilePath(path);

    const fsPath = libpath.join(dest, localPath);

    console.log(`Writing ${localPath} to ${fsPath}`);

    await Deno.mkdir(libpath.dirname(fsPath), { recursive: true });

    await Deno.writeFile(fsPath, res.body ?? new Uint8Array());
  }
}

function formatLocalPath(
  path: readonly PathSegment[],
  index: boolean,
): URLPathname {
  return libpath.join("/", ...path, index ? "./" : "");
}

function renderedFilePath(path: string): string {
  return path.endsWith("/") ? `${path}index.html` : path;
}

function servingFileMimeType(path: string): string {
  const filename = libpath.basename(renderedFilePath(path));
  const extension = libpath.extname(filename);
  return contentType(extension) ?? "application/octet-stream";
}

// general

function ensureSuffix(s: string, suffix: string): string {
  return s.endsWith(suffix) ? s : s + suffix;
}

function trimPrefix(s: string, prefix: string): string {
  return s.startsWith(prefix) ? s.slice(prefix.length) : s;
}
