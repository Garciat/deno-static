import { helpers } from "deno-static/mod.ts";

import { BaseLayout, BaseLayoutProps } from "./base.tsx";
import { SiteConfig } from "../../config.ts";

type PageLayoutProps = BaseLayoutProps;

export const PageLayout: React.FC<PageLayoutProps> = (
  { paths, url, title, children },
) => (
  <BaseLayout url={url} paths={paths} title={title}>
    <main>
      <header>
        <div className="container">
          <h1>
            <a href={helpers.url(paths.home())}>{SiteConfig.title}</a>
          </h1>
        </div>
      </header>
      {children}
      <footer>
        <div className="container">
          <p>This is the footer (:</p>
        </div>
      </footer>
    </main>
  </BaseLayout>
);
