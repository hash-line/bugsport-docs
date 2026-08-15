'use client';

import type { ThemeSwitchProps } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { siteConfig } from '@/lib/site';

export function HeaderActions({ className = '', mode, ...props }: ThemeSwitchProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <a
        href={siteConfig.productUrl}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-medium text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground"
      >
        Goto BugsPort
      </a>
      <ThemeSwitch mode={mode} {...props} />
    </div>
  );
}
