import { helpers } from "deno-static/mod.ts";
import { Paths } from "../../paths.ts";
import { SiteConfig } from "../../config.ts";

export type BaseLayoutProps = {
  paths: Paths;
  url: `/${string}`;
  title: string;
  children: React.ReactNode;
};

export const BaseLayout: React.FC<BaseLayoutProps> = (
  { paths, url, title, children },
) => (
  <html lang={SiteConfig.language}>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />

      <title>{title}</title>

      <meta name="description" content={SiteConfig.description} />

      <link rel="canonical" href={helpers.url(url, true)} />
      <link
        rel="alternate"
        href={helpers.url(paths.rss())}
        type="application/rss+xml"
        title={SiteConfig.title}
      />
      <link rel="stylesheet" href={helpers.url(paths.asset("/main.css"))} />
      <link
        rel="stylesheet"
        href="https://unpkg.com/@highlightjs/cdn-assets@11.12.0/styles/github-dark.min.css"
      />
    </head>
    <body>
      {children}
    </body>
  </html>
);
