import type { Root } from 'fumadocs-core/page-tree';
import type { AstroProviderProps } from 'fumadocs-core/framework/astro';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  type DocsPageProps,
} from 'fumadocs-ui/layouts/notebook/page';
import { RootProvider } from 'fumadocs-ui/provider/astro';
import type { ReactNode } from 'react';
import { PageFeedback } from './PageFeedback';
import { SidebarFooter } from './SidebarFooter';
import type { GetLayoutTabsOptions } from 'fumadocs-ui/layouts/shared';
import { SdkIcons } from './SdkIcons';
import { baseOptions } from '@/lib/layout.shared';
import { getTreeForPathname } from '@/lib/section-tree';

interface DocsShellProps {
  tree: Root;
  children: ReactNode;
  title: string;
  description?: string;
  status?: 'available' | 'pre-alpha' | 'coming-soon';
  pathname: string;
  params: AstroProviderProps['params'];
  page?: DocsPageProps;
}

export function DocsShell({
  tree,
  children,
  title,
  description,
  status,
  pathname,
  params,
  page,
}: DocsShellProps) {
  const section = getTreeForPathname(tree, pathname);

  return (
    <RootProvider pathname={pathname} params={params} search={{ options: { type: 'static' } }}>
      <DocsLayout
        {...baseOptions()}
        tree={section.tree}
        nav={{ ...baseOptions().nav, mode: 'top' }}
        tabs={section.enableTabs ? { transform: withSdkIcon } : false}
        tabMode="sidebar"
        sidebar={{
          footer: <SidebarFooter />,
        }}
      >
        <DocsPage {...page}>
          <DocsTitle>{title}</DocsTitle>
          {status === 'coming-soon' ? (
            <p className="text-sm font-medium text-fd-primary">Coming soon</p>
          ) : null}
          <DocsDescription>{description}</DocsDescription>
          <DocsBody>{children}</DocsBody>
          <PageFeedback />
        </DocsPage>
      </DocsLayout>
    </RootProvider>
  );
}

function withSdkIcon(...[option]: Parameters<NonNullable<GetLayoutTabsOptions['transform']>>) {
  const sdk = option.url.split('/').filter(Boolean)[1];
  const Icon = sdk === undefined ? undefined : SdkIcons[sdk];
  return {
    ...option,
    icon: Icon === undefined ? option.icon : <Icon className="size-4" />,
  };
}
