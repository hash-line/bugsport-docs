'use client';

import { ChevronDown } from 'lucide-react';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { siteConfig } from '@/lib/site';

function ComingSoonLabel() {
  return <span className="text-xs font-medium text-fd-muted-foreground">Coming soon</span>;
}

function FooterLink({ href, children, external }: { href?: string; children: ReactNode; external?: boolean }) {
  if (href === undefined) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-fd-muted-foreground">
        <span>{children}</span>
        <ComingSoonLabel />
      </div>
    );
  }

  return (
    <a
      href={href}
      className="block rounded-md px-2 py-1.5 text-sm hover:bg-fd-accent"
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children}
    </a>
  );
}

function SidebarFooterLinks() {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="flex flex-col gap-0.5">
      <FooterLink>Sandbox</FooterLink>
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-fd-accent"
        onClick={() => setMoreOpen((open) => !open)}
        aria-expanded={moreOpen}
      >
        More
        <ChevronDown className={`size-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
      </button>
      {moreOpen ? (
        <div className="ms-2 flex flex-col gap-0.5 border-s ps-2">
          <FooterLink href={siteConfig.socials.discord} external>Discord</FooterLink>
          <FooterLink href={siteConfig.socials.x} external>X</FooterLink>
          <FooterLink href={siteConfig.socials.linkedin} external>LinkedIn</FooterLink>
          <FooterLink href={siteConfig.socials.meta} external>Meta</FooterLink>
        </div>
      ) : null}
    </div>
  );
}

export function SidebarFooter(_props: ComponentProps<'div'>) {
  return (
    <div className="mt-auto w-full shrink-0 border-t px-3 py-3">
      <SidebarFooterLinks />
    </div>
  );
}
