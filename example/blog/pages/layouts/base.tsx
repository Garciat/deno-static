import { helpers } from "deno-static/mod.ts";
import { Paths } from "../../paths.ts";

export type BaseLayoutProps = {
  paths: Paths;
  url: `/${string}`;
  title: string;
  children: React.ReactNode;
};

export const BaseLayout: React.FC<BaseLayoutProps> = (
  { paths, url, title, children },
) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />

      <title>{title}</title>

      <link rel="canonical" href={helpers.url(url, true)} />

      <link rel="stylesheet" href={helpers.url(paths.asset("/main.css"))} />
    </head>
    <body>
      {children}
    </body>
  </html>
);
