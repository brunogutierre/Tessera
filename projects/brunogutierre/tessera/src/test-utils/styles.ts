import { commands } from 'vitest/browser';

/** Workspace-relative path: the browser commands resolve paths from the workspace root. */
export const STYLES_DIR = 'projects/brunogutierre/tessera/styles/';
const IMPORT = /@import\s+(?:url\()?['"]([^'"]+)['"]\)?\s*;/g;

/** Reads a stylesheet from the package's `styles/` folder. */
export function readStyle(path: string): Promise<string> {
  return commands.readFile(STYLES_DIR + path);
}

/** Inlines the `@import`s of `tessera.css`, in order, so it works inside a `<style>` element. */
export async function bundleTesseraStyles(): Promise<string> {
  const entry = await readStyle('tessera.css');
  const imports = [...entry.matchAll(IMPORT)].map((m) => m[1] ?? '');
  const parts = await Promise.all(imports.map((p) => readStyle(p.replace(/^\.\//, ''))));
  let index = 0;
  return entry.replace(IMPORT, () => parts[index++] ?? '');
}

/** Adds the full Tessera stylesheet (tokens, themes, base) to the test document once. */
export async function loadTesseraStyles(): Promise<void> {
  if (document.getElementById('tes-test-styles')) return;
  const style = document.createElement('style');
  style.id = 'tes-test-styles';
  style.textContent = await bundleTesseraStyles();
  document.head.append(style);
}
