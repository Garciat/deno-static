import { contentType } from "jsr:@std/media-types@1.1.0";
import * as libpath from "jsr:@std/path@1.1.6";

// @ts-types="npm:@types/react@^19"
import React from "npm:react@^19";
// @ts-types="npm:@types/react-dom@^19/server"
import { renderToReadableStream } from "npm:react-dom@^19/server";

// API

export const index = Symbol("index");

export type Tree =
  & {
    [Key in typeof index]?: TreeLeaf;
  }
  & {
    [Key in PathSegment]: TreeNode;
  };

type PathSegment = string;

export type TreeNode =
  | Tree
  | Promise<Tree>
  | TreeLeaf;

export type TreeLeaf =
  | Response
  | Promise<Response>;

export async function jsx(node: React.ReactNode): Promise<Response> {
  return new Response(await renderToReadableStream(node));
}

export function json(value: unknown): Response {
  return new Response(JSON.stringify(value));
}

export function file(body: BodyInit): Response {
  return new Response(body);
}

export async function tree(
  input:
    | ArrayFromAsyncInput<[PathSegment, TreeNode]>
    | (() => ArrayFromAsyncInput<[PathSegment, TreeNode]>),
): Promise<Tree> {
  const entries = typeof input === "function" ? input() : input;
  return Object.fromEntries(await Array.fromAsync(entries));
}

export async function directory(
  root: string | URL,
  predicate: (path: string) => MaybePromise<boolean> = () => true,
): Promise<Tree> {
  const resolvedRoot = libpath.fromFileUrl(root);

  {
    const info = await Deno.stat(resolvedRoot);
    if (!info.isDirectory) {
      throw new Error(`not a directory: ${root}`);
    }
  }

  function walk(parent: string): Promise<Tree> {
    return tree(async function* () {
      for await (const entry of Deno.readDir(parent)) {
        const child = libpath.join(parent, entry.name);

        if (entry.isFile && await predicate(child)) {
          const resource = await Deno.open(child, { read: true });
          yield [entry.name, file(resource.readable)];
        } else if (entry.isDirectory) {
          yield [entry.name, walk(child)];
        } else {
          continue; // TODO meh?
        }
      }
    });
  }

  return walk(resolvedRoot);
}

export async function module(module: Promise<{ default: Tree }>) {
  return (await module).default;
}

/**
 * The entrypoint for the library.
 *
 * @param tree the tree to render; pass in a function to log its runtime
 */
export async function site(tree: Tree | (() => MaybePromise<Tree>)) {
  const actualTree = typeof tree === "function"
    ? await (async () => {
      const start = performance.now();
      const result = await tree();
      console.log(`[create]`, `done`, `(${durationTag(start)})`);
      return result;
    })()
    : tree;

  const dev = Deno.args.includes("--dev");

  if (dev) {
    Deno.serve(
      {
        hostname: "localhost",
        port: 3000,
        onListen(addr) {
          console.log(
            `[server]`,
            `listening on http://${addr.hostname}:${addr.port}`,
          );
        },
      },
      await handler(actualTree),
    );
  } else {
    await render(actualTree, libpath.join(Deno.cwd(), "_site"));
    Deno.exit(0);
  }
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
  urlAny(path: string, absolute: boolean = false) {
    function isSlashStart(value: string): value is `/${string}` {
      return value.startsWith("/");
    }

    return isSlashStart(path) ? this.url(path, absolute) : path;
  },
} as const;

// Implementation

type URLPathname = string;

async function* flatten(tree: Tree): AsyncIterable<[URLPathname, Response]> {
  type Item = {
    path: readonly PathSegment[];
    response: Response;
    index: boolean;
  };

  async function* walk(
    path: readonly PathSegment[],
    node: TreeNode,
  ): AsyncIterable<Item> {
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
    yield [formatLocalPath(path, index), response];
  }
}

async function handler(
  tree: Tree,
): Promise<(req: Request) => Response> {
  const resources = new Map(await Array.fromAsync(flatten(tree)));

  for (const path of resources.keys()) {
    console.log(`[server]`, `serving ${path}`);
  }

  return (req) => {
    const path = new URL(req.url).pathname;

    const res = resources.get(path);

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
  console.log(`[render]`, `destination: ${dest}`);

  await Deno.mkdir(dest, { recursive: true });

  const renderStart = performance.now();

  await fanningMap(
    flatten(tree),
    async ([path, res]) => {
      const localPath = renderedFilePath(path);

      const fsPath = libpath.join(dest, localPath);

      const taskStart = performance.now();

      await Deno.mkdir(libpath.dirname(fsPath), { recursive: true });

      await Deno.writeFile(fsPath, res.body ?? new Uint8Array());

      console.log(
        `[render]`,
        `wrote ${localPath}`,
        `(${durationTag(taskStart)})`,
      );
    },
  );

  console.log(`[render]`, `done!`, `(${durationTag(renderStart)})`);
}

function durationTag(start: number): string {
  const precision = 3;
  const duration = performance.now() - start;
  return duration > 100
    ? `${(duration / 1000).toFixed(precision)} s`
    : `${duration.toFixed(precision)} ms`;
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

type MaybePromise<T> = T | PromiseLike<T>;

type ArrayFromAsyncInput<T> =
  | AsyncIterable<T>
  | Iterable<MaybePromise<T>>
  | ArrayLike<MaybePromise<T>>;

function ensureSuffix(s: string, suffix: string): string {
  return s.endsWith(suffix) ? s : s + suffix;
}

function trimPrefix(s: string, prefix: string): string {
  return s.startsWith(prefix) ? s.slice(prefix.length) : s;
}

// TODO concurrency limit?
async function fanningMap<T, U>(
  seq: AsyncIterable<T>,
  mapFn: (value: T) => Promise<U>,
): Promise<U[]> {
  const tasks: Promise<U>[] = [];

  for await (const value of seq) {
    tasks.push(mapFn(value));
  }

  return await Promise.all(tasks);
}
