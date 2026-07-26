import { navigate } from 'astro:transitions/client';
import type { AstroProviderProps } from 'fumadocs-core/framework/astro';
import type { Root } from 'fumadocs-core/page-tree';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { DocsPage, MarkdownCopyButton, type DocsPageProps } from 'fumadocs-ui/layouts/docs/page';
import { RootProvider } from 'fumadocs-ui/provider/astro';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { useLayoutEffect, type ReactNode } from 'react';
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

function SearchShortcut() {
  const { setOpenSearch } = useSearchContext();

  useLayoutEffect(() => {
    const openSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        event.stopImmediatePropagation();
        setOpenSearch(true);
      }
    };

    window.addEventListener('keydown', openSearch, true);
    return () => window.removeEventListener('keydown', openSearch, true);
  }, [setOpenSearch]);

  return null;
}

export function DocsShell({ tree, children, pathname, params, page, markdownUrl }: DocsShellProps) {
  return (
    <RootProvider pathname={pathname} params={params} navigate={navigate} search={{ SearchDialog }}>
      <SearchShortcut />
      <DocsLayout
        tree={tree}
        nav={{
          title: <Brand />,
          children: <ThemeSwitch className="ms-auto md:hidden" />,
        }}
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
