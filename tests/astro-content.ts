import { sync } from 'astro';
import { MutableDataStore } from '../node_modules/astro/dist/content/mutable-data-store.js';
import { resolve } from 'node:path';

await sync({ root: process.cwd() });

const store = await MutableDataStore.fromFile(resolve(process.cwd(), 'node_modules/.astro/data-store.json'));

export async function getCollection(collection: string) {
  return store.values(collection).map((entry) => ({ ...entry, collection }));
}
