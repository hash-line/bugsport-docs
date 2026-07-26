'use client';

import { navigate } from 'astro:transitions/client';
import { RootProvider } from 'fumadocs-ui/provider/astro';
import { SearchTrigger } from 'fumadocs-ui/layouts/shared/slots/search-trigger';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { SearchDialog } from './SearchDialog';
import { platformPaths, siteConfig } from '@/lib/site';

const firstIssueSteps = [
  ['01', 'Create or select a project', 'Start with the project that will receive your mobile or API issue data.'],
  ['02', 'Use the project API key', 'Keep the project identifier and project API key together during configuration.'],
  ['03', 'Send and verify an issue', 'Confirm that BugsPort receives the diagnostic context your team needs.'],
] as const;

const secondaryLinks = [
  ['Dashboard guides', '/docs/dashboard/organizations-teams-projects'],
  ['REST reference', '/docs/reference/rest-api'],
  ['Troubleshooting', '/docs/reference/troubleshooting'],
  ['Open BugsPort', siteConfig.appUrl],
] as const;

export function Home() {
  return (
    <RootProvider pathname="/" navigate={navigate} search={{ SearchDialog }}>
      <div className="home-shell">
        <header className="home-header">
          <a className="home-brand" href="/" aria-label="BugsPort Docs home">
            <img src="/bugsport-logo.png" width="32" height="32" alt="" />
            <span>BugsPort <strong>Docs</strong></span>
          </a>
          <nav className="home-header-actions" aria-label="Site navigation">
            <a className="home-docs-link" href="/docs">Documentation</a>
            <a className="home-app-link" href={siteConfig.appUrl}>App</a>
            <SearchTrigger className="home-search-trigger" />
            <ThemeSwitch className="home-theme-switch" />
          </nav>
        </header>

        <main className="home-main">
          <section className="home-intro" aria-labelledby="home-title">
            <div className="home-intro-copy">
              <p className="home-eyebrow">BugsPort documentation</p>
              <h1 id="home-title">Diagnose your first issue</h1>
              <p className="home-lede">
                Choose a platform, connect a project, and verify that BugsPort receives the context your team needs.
              </p>
              <a className="home-primary-link" href="#integration-paths">Choose your integration <span aria-hidden="true">→</span></a>
            </div>
            <aside className="home-pathway" aria-label="Integration flow">
              <p className="home-pathway-label">Integration flow</p>
              <ol>
                <li><code>project</code><span>select</span></li>
                <li><code>api_key</code><span>configure</span></li>
                <li><code>issue</code><span>verify</span></li>
              </ol>
            </aside>
          </section>

          <section className="home-section home-platform-section" id="integration-paths" aria-labelledby="integration-title">
            <div className="home-section-heading">
              <p className="home-kicker">Start here</p>
              <h2 id="integration-title">Choose your integration</h2>
            </div>
            <div className="home-platform-grid">
              {platformPaths.map((platform) => (
                <a className="home-platform" href={platform.href} key={platform.slug}>
                  <span className="home-platform-heading">
                    <span>{platform.title}</span>
                    <span className={`home-status home-status-${platform.status}`}>{platform.status.replace('-', ' ')}</span>
                  </span>
                  <span className="home-platform-description">{platform.description}</span>
                  <span className="home-platform-arrow" aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          </section>

          <section className="home-section home-first-issue" aria-labelledby="first-issue-title">
            <div className="home-section-heading">
              <p className="home-kicker">Workflow</p>
              <h2 id="first-issue-title">Send your first issue</h2>
            </div>
            <ol className="home-steps">
              {firstIssueSteps.map(([number, title, description]) => (
                <li key={number}>
                  <span className="home-step-number">{number}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <footer className="home-footer" aria-label="More documentation">
            <p>Continue with the part of BugsPort you need next.</p>
            <ul>
              {secondaryLinks.map(([label, href]) => (
                <li key={label}><a href={href}>{label} <span aria-hidden="true">→</span></a></li>
              ))}
            </ul>
          </footer>
        </main>
      </div>
    </RootProvider>
  );
}
