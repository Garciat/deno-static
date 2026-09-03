import Markdown, { Components, Options } from "npm:react-markdown@10";
// @ts-types="npm:@types/react-syntax-highlighter"
import { Prism as SyntaxHighlighter } from "npm:react-syntax-highlighter@16.1.1";
import * as styles from "npm:react-syntax-highlighter@16.1.1/dist/esm/styles/prism/index.js";

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

/**
 * @see https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/AVAILABLE_STYLES_PRISM.MD
 */
export function syntaxHighlighting(styleName?: string): Components {
  return {
    code({ children, className, ...rest }) {
      const match = /^language-(\w+)/.exec(className || "");
      return match
        ? (
          <SyntaxHighlighter
            PreTag="div"
            language={match[1]}
            style={styles[styleName] ?? styles["vscDarkPlus"]}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        )
        : (
          <code {...rest} className={className}>
            {children}
          </code>
        );
    },
  };
}
