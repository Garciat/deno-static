type BaseLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export const BaseLayout: React.FC<BaseLayoutProps> = ({ title, children }) => (
  <html>
    <head>
      <meta charSet="UTF-8" />

      <title>{title}</title>
    </head>
    <body>
      {children}
    </body>
  </html>
);
