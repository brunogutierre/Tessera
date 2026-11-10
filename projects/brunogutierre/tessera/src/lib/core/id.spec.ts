import { uniqueId } from './id';

describe('uniqueId', () => {
  it('prefixes the id', () => {
    expect(uniqueId('tes-input')).toMatch(/^tes-input-\d+$/);
  });

  it('never repeats a value', () => {
    const ids = new Set(Array.from({ length: 50 }, () => uniqueId('tes-x')));
    expect(ids.size).toBe(50);
  });

  it('rejects prefixes that are not valid id fragments', () => {
    expect(() => uniqueId('Tes Input')).toThrow(/Invalid id prefix/);
    expect(() => uniqueId('')).toThrow(/Invalid id prefix/);
  });
});
