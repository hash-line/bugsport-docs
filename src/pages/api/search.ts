import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';

export const prerender = true;

const server = createFromSource(source, {
  buildIndex(page) {
    return {
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
    };
  },
});

export async function GET() {
  return server.staticGET();
}
