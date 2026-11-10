let nextId = 0;

/**
 * Returns an id that is unique within the page, such as `tes-input-3`.
 *
 * Components use it to wire labels, hints and errors to their controls (`for`, `aria-describedby`,
 * `aria-labelledby`) without asking the consumer for ids. Ids are generated in creation order, so
 * server-rendered and hydrated pages produce the same values.
 */
export function uniqueId(prefix: string): string {
  if (!/^[a-z][a-z0-9-]*$/.test(prefix)) {
    throw new Error(`Invalid id prefix "${prefix}": use lowercase letters, digits and dashes.`);
  }
  return `${prefix}-${String(nextId++)}`;
}
