import type { Folder, Root } from 'fumadocs-core/page-tree';

const sections = ['sdks', 'api', 'product', 'manage', 'pricing'] as const;

export function getSectionFromPathname(pathname: string): (typeof sections)[number] | undefined {
  const first = pathname.split('/').filter(Boolean)[0];
  return sections.find((section) => section === first);
}

function firstPageUrl(folder: Folder): string | undefined {
  if (folder.index !== undefined) return folder.index.url;

  for (const child of folder.children) {
    if (child.type === 'page') return child.url;
    if (child.type === 'folder') {
      const nested = firstPageUrl(child);
      if (nested !== undefined) return nested;
    }
  }
}

function folderSection(folder: Folder): string | undefined {
  const url = firstPageUrl(folder);
  return url?.split('/').filter(Boolean)[0];
}

export function getTreeForPathname(tree: Root, pathname: string): { tree: Root; enableTabs: boolean } {
  const section = getSectionFromPathname(pathname);
  if (section === undefined) return { tree, enableTabs: false };

  const folder = tree.children.find((node): node is Folder => (
    node.type === 'folder' && folderSection(node) === section
  ));
  if (folder === undefined) return { tree, enableTabs: false };

  return {
    tree: {
      name: folder.name,
      children: folder.children,
    },
    enableTabs: section === 'sdks',
  };
}
