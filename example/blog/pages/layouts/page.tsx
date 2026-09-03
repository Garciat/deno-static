import { helpers } from "deno-static/mod.ts";

import { BaseLayout } from "./base.tsx";
import { Paths } from "../../paths.ts";

type PageLayoutProps = {
  paths: Paths;
  title: string;
  children: React.ReactNode;
};

export const PageLayout: React.FC<PageLayoutProps> = (
  { paths, title, children },
) => (
  <BaseLayout title={title}>
    <main>
      <header>
        <h1>
          <a href={helpers.url(paths.home())}>My Blog</a>
        </h1>
      </header>
      {children}
    </main>
  </BaseLayout>
);
