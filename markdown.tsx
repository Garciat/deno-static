import Markdown, { Options } from "npm:react-markdown@10";

import { helpers } from "./mod.ts";

type MarkdownModuleProps = Omit<Options, "children"> & {
  children: Promise<{ default: string }>;
};

export const MarkdownModule: React.FC<MarkdownModuleProps> = async (
  { children, ...props },
) => (
  <Markdown urlTransform={(url) => helpers.urlAny(url)} {...props}>
    {(await children).default}
  </Markdown>
);
