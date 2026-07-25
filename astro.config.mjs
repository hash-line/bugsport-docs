// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import {
  rehypeCode,
  remarkCodeTab,
  remarkHeading,
  remarkNpm,
  remarkStructure,
} from 'fumadocs-core/mdx-plugins';

const remarkStructurePlugin = /** @type {[
  typeof remarkStructure,
  { exportAs: 'structuredData' },
]} */ ([remarkStructure, { exportAs: 'structuredData' }]);

const remarkPlugins = [
  remarkHeading,
  remarkCodeTab,
  remarkNpm,
  remarkStructurePlugin,
];
const rehypePlugins = [rehypeCode];

export default defineConfig({
  site: 'https://docs.bugsport.io',
  output: 'static',
  markdown: {
    processor: unified({
      // @ts-expect-error This documented processor option is absent from Astro's type.
      syntaxHighlight: false,
      remarkPlugins,
      rehypePlugins,
    }),
  },
  integrations: [
    react(),
    mdx({ extendMarkdownConfig: true, syntaxHighlight: false }),
  ],
  vite: { plugins: [tailwindcss()] },
});
