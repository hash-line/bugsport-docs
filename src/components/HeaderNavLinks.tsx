'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'fumadocs-core/framework';

interface HeaderNavLink {
  text: ReactNode;
  url: string;
  active?: 'url' | 'nested-url' | 'none';
}

function linkIsActive(link: HeaderNavLink, pathname: string) {
  if (link.active === 'none') return false;
  if (link.active === 'nested-url') return pathname === link.url || pathname.startsWith(`${link.url}/`);
  return pathname === link.url;
}

export function HeaderNavLinks({ links }: { links: HeaderNavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 px-4 text-sm max-lg:hidden" aria-label="Documentation sections">
      {links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          data-active={linkIsActive(link, pathname) || undefined}
          className="inline-flex items-center p-2 text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground data-[active=true]:text-fd-primary"
        >
          {link.text}
        </a>
      ))}
    </nav>
  );
}
