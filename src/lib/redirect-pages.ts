import { contentRedirects } from './navigation';

export function redirectsUnder(prefix: string) {
  return Object.entries(contentRedirects)
    .filter(([from]) => from.startsWith(`${prefix}/`))
    .map(([from, target]) => ({
      params: { slug: from.slice(prefix.length + 1) },
      props: { target },
    }));
}
