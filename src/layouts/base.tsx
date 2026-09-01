import { helpers } from "@/lib/static.ts";

type BaseLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export const BaseLayout: React.FC<BaseLayoutProps> = ({ title, children }) => (
  <html>
    <head>
      <meta charSet="UTF-8" />

      <title>{title}</title>

      <link rel="stylesheet" href={helpers.url("/assets/main.css")} />
    </head>
    <body>
      {children}
    </body>
  </html>
);
