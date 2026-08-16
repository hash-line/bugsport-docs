import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { Brand } from '@/components/Brand';
import { HeaderActions } from '@/components/HeaderActions';
import { HeaderNavLinks } from '@/components/HeaderNavLinks';

export const sectionLinks = [
  { text: 'SDKs', url: '/sdks', active: 'nested-url' as const },
  { text: 'API', url: '/api', active: 'nested-url' as const },
  { text: 'Pricing & Billing', url: '/pricing', active: 'nested-url' as const },
  { text: 'Product', url: '/product', active: 'nested-url' as const },
  { text: 'Manage', url: '/manage', active: 'nested-url' as const },
];

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Brand />,
      url: '/',
      children: <HeaderActions className="ms-auto md:hidden" />,
    },
    links: sectionLinks,
    slots: {
      themeSwitch: HeaderActions,
    },
  };
}

export function docsOptions(): BaseLayoutProps {
  return {
    ...baseOptions(),
    links: sectionLinks.map((link) => ({ ...link, on: 'menu' })),
    nav: {
      title: <Brand />,
      url: '/',
      children: (
        <>
          <HeaderNavLinks links={sectionLinks} />
          <HeaderActions className="ms-auto md:hidden" />
        </>
      ),
    },
  };
}
