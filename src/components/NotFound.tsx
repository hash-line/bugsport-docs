'use client';

import { navigate } from 'astro:transitions/client';
import { RootProvider } from 'fumadocs-ui/provider/astro';
import { SearchTrigger } from 'fumadocs-ui/layouts/shared/slots/search-trigger';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { SearchDialog } from './SearchDialog';

export function NotFound() {
  return (
    <RootProvider pathname="/404" navigate={navigate} search={{ SearchDialog }}>
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
        <header className="mb-12 flex items-center justify-between gap-4">
          <a className="inline-flex items-center gap-2 font-semibold" href="/" aria-label="BugsPort Docs home">
            <img src="/bugsport-logo.png" width="32" height="32" alt="" />
            <span>BugsPort <strong>Docs</strong></span>
          </a>
          <div className="flex items-center gap-2">
            <SearchTrigger />
            <ThemeSwitch />
          </div>
        </header>
        <p className="font-mono text-sm text-fd-primary">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-4 max-w-xl text-lg text-fd-muted-foreground">
          This address is not part of the BugsPort documentation. Start with an integration guide or search the documentation.
        </p>
        <nav className="mt-8 flex flex-wrap gap-3" aria-label="404 recovery">
          <a className="rounded-lg bg-fd-primary px-4 py-2 font-medium text-fd-primary-foreground" href="/docs">Browse documentation</a>
          <a className="rounded-lg border px-4 py-2 font-medium" href="/docs/platforms/android">Android setup</a>
          <a className="rounded-lg border px-4 py-2 font-medium" href="/docs/platforms/ios">iOS setup</a>
          <a className="rounded-lg border px-4 py-2 font-medium" href="/docs/platforms/rest-api">REST API setup</a>
        </nav>
      </main>
    </RootProvider>
  );
}
