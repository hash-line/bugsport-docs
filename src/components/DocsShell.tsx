import type { AstroProviderProps } from 'fumadocs-core/framework/astro';
import type { Root } from 'fumadocs-core/page-tree';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  type DocsPageProps,
} from 'fumadocs-ui/layouts/docs/page';
import { RootProvider } from 'fumadocs-ui/provider/astro';
import type { ReactNode } from 'react';
import { Brand } from './Brand';

interface DocsShellProps {
  tree: Root;
  children: ReactNode;
  title: string;
  description?: string;
  pathname: string;
  params: AstroProviderProps['params'];
  page?: DocsPageProps;
}

export function DocsShell({ tree, children, title, description, pathname, params, page }: DocsShellProps) {
  return (
    <RootProvider pathname={pathname} params={params} search={{ options: { type: 'static' } }}>
      <DocsLayout
        tree={tree}
        nav={{ title: <Brand /> }}
        githubUrl="https://github.com/hash-line/bugsport-docs"
      >
        <DocsPage {...page}>
          <DocsTitle>{title}</DocsTitle>
          <DocsDescription>{description}</DocsDescription>
          <DocsBody>{children}</DocsBody>
        </DocsPage>
      </DocsLayout>
    </RootProvider>
  );
}
