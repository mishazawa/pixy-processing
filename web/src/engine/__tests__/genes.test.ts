import { describe, it, expect } from 'vitest';
import { VALUES, VALUES_RATE, METHODS, METHODS_GROUP_RATE, METHODS_RATE } from '../genes';

describe('genes tables', () => {
  it('every values array has a matching rate array', () => {
    expect(VALUES_RATE.length).toBe(VALUES.length);
  });

  it('every method group has a matching rate array of the same length', () => {
    expect(METHODS_RATE.length).toBe(METHODS.length);
    expect(METHODS_GROUP_RATE.length).toBe(METHODS.length);
    METHODS.forEach((group, i) => {
      expect(METHODS_RATE[i].length).toBe(group.length);
    });
  });
});
