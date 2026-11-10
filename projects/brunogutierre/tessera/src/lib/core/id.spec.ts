import { uniqueId } from './id';

describe('uniqueId', () => {
  it('prefixes the id', () => {
    expect(uniqueId('tes-input')).toMatch(/^tes-input-\d+$/);
  });

  it('never repeats a value', () => {
    const ids = new Set(Array.from({ length: 50 }, () => uniqueId('tes-x')));
    expect(ids.size).toBe(50);
  });
});
