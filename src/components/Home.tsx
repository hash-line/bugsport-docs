'use client';

import { ChevronRight } from 'lucide-react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { RootProvider } from 'fumadocs-ui/provider/astro';
import { SdkIcons } from './SdkIcons';
import { baseOptions } from '@/lib/layout.shared';

const sdks = [
  { name: 'Android', href: '/sdks/android/getting-started', icon: SdkIcons.android, comingSoon: false },
  { name: 'iOS', href: '/sdks/ios/getting-started', icon: SdkIcons.ios, comingSoon: false },
  { name: 'Flutter', href: '/sdks/flutter/getting-started', icon: SdkIcons.flutter, comingSoon: true },
  { name: 'React', href: '/sdks/react/getting-started', icon: SdkIcons.react, comingSoon: true },
];

const secondaryLinks = [
  { title: 'What is BugsPort', href: '/product', description: 'See how BugsPort records crashes, ANRs, traces, and issue workflow.' },
  { title: 'Pricing & billing', href: '/pricing', description: 'Plans and billing for BugsPort. Coming soon.' },
  { title: 'REST API', href: '/api', description: 'Validate and create issues with a project-scoped API key.' },
  { title: 'Organizations and teams', href: '/manage', description: 'Navigate organizations, teams, and projects.' },
];

export function Home() {
  return (
    <RootProvider pathname="/" search={{ options: { type: 'static' } }}>
      <HomeLayout {...baseOptions()}>
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-16">
          <section className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight">Get started with BugsPort</h1>
            <p className="mt-4 text-lg text-fd-muted-foreground">
              Catch mobile crashes, ANRs, and network failures with the context your team needs to fix them.
            </p>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Platform-specific docs</h2>
                <p className="mt-1 text-sm text-fd-muted-foreground">Jump to the SDK that matches your app.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {sdks.map((sdk) => {
                const Icon = sdk.icon;
                return (
                  <a
                    key={sdk.name}
                    href={sdk.href}
                    className="flex items-center gap-3 rounded-xl border bg-fd-card px-4 py-3 hover:border-fd-primary"
                  >
                    <Icon className="size-6 shrink-0" />
                    <span className="flex-1 font-medium">{sdk.name}</span>
                    {sdk.comingSoon ? (
                      <span className="text-xs font-medium text-fd-muted-foreground">Coming soon</span>
                    ) : null}
                    <ChevronRight className="size-4 text-fd-muted-foreground" />
                  </a>
                );
              })}
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            {secondaryLinks.map((link) => (
              <a key={link.href} href={link.href} className="rounded-xl border px-4 py-4 hover:border-fd-primary">
                <h2 className="font-semibold">{link.title}</h2>
                <p className="mt-1 text-sm text-fd-muted-foreground">{link.description}</p>
              </a>
            ))}
          </section>

          <footer className="border-t pt-6 text-sm text-fd-muted-foreground">
            Copyright © Hashline. All rights reserved.
          </footer>
        </div>
      </HomeLayout>
    </RootProvider>
  );
}
