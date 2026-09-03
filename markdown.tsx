import Markdown, { Options } from "npm:react-markdown@10";

type MarkdownModuleProps = Omit<Options, "children"> & {
  children: Promise<{ default: string }>;
};

export const MarkdownModule: React.FC<MarkdownModuleProps> = async (
  { children, ...props },
) => <Markdown {...props}>{(await children).default}</Markdown>;
