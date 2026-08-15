import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { Brand } from '@/components/Brand';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Brand />,
      url: '/',
      children: <ThemeSwitch className="ms-auto md:hidden" />,
    },
    links: [
      { text: 'SDKs', url: '/sdks', active: 'nested-url' },
      { text: 'API', url: '/api', active: 'nested-url' },
      { text: 'Pricing & Billing', url: '/pricing', active: 'nested-url' },
      { text: 'Product', url: '/product', active: 'nested-url' },
      { text: 'Manage', url: '/manage', active: 'nested-url' },
    ],
  };
}
