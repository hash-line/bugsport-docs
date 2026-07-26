import { navigate } from 'astro:transitions/client';
import type { AstroProviderProps } from 'fumadocs-core/framework/astro';
import type { Root } from 'fumadocs-core/page-tree';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { DocsPage, MarkdownCopyButton, type DocsPageProps } from 'fumadocs-ui/layouts/docs/page';
import { RootProvider } from 'fumadocs-ui/provider/astro';
import type { ReactNode } from 'react';
import { Brand } from './Brand';
import { SearchDialog } from './SearchDialog';

interface DocsShellProps {
  tree: Root;
  children: ReactNode;
  pathname: string;
  params: AstroProviderProps['params'];
  page?: DocsPageProps;
  markdownUrl?: string;
}

export function DocsShell({ tree, children, pathname, params, page, markdownUrl }: DocsShellProps) {
  return (
    <RootProvider pathname={pathname} params={params} navigate={navigate} search={{ SearchDialog }}>
      <DocsLayout
        tree={tree}
        nav={{ title: <Brand /> }}
        githubUrl="https://github.com/hash-line/bugsport-docs"
      >
        <DocsPage {...page}>
          {markdownUrl === undefined ? null : <MarkdownCopyButton markdownUrl={markdownUrl} />}
          {children}
        </DocsPage>
      </DocsLayout>
    </RootProvider>
  );
}
