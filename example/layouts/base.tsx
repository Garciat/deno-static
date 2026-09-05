import { helpers } from "deno-static/mod.ts";

type BaseLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export const BaseLayout: React.FC<BaseLayoutProps> = ({ title, children }) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />

      <title>{title}</title>

      <link rel="stylesheet" href={helpers.url("/assets/main.css")} />
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
