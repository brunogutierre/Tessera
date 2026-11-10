let nextId = 0;

/**
 * Returns an id that is unique within the page, such as `tes-input-3`.
 *
 * Components use it to wire labels, hints and errors to their controls (`for`, `aria-describedby`,
 * `aria-labelledby`) without asking the consumer for ids. The counter is module-wide, so with
 * server rendering the values differ between server and client; that is harmless because ids are
 * always set through bindings, which hydration updates.
 */
export function uniqueId(prefix: string): string {
  return `${prefix}-${String(nextId++)}`;
}
