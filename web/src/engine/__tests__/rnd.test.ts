import { describe, it, expect } from 'vitest';
import { random, randomIndex, randomGaussian } from '../rnd';

describe('random', () => {
  it('single-arg form returns a value in [0, high)', () => {
    for (let i = 0; i < 200; i++) {
      const v = random(10);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(10);
    }
  });

  it('two-arg form returns a value in [low, high)', () => {
    for (let i = 0; i < 200; i++) {
      const v = random(5, 8);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThan(8);
    }
  });
});

describe('randomIndex', () => {
  it('returns an integer in [0, bound)', () => {
    for (let i = 0; i < 200; i++) {
      const v = randomIndex(7);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(7);
    }
  });

  it('returns 0 for a bound of 0', () => {
    expect(randomIndex(0)).toBe(0);
  });
});

describe('randomGaussian', () => {
  it('produces roughly zero-mean, unit-variance samples', () => {
    const n = 5000;
    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < n; i++) {
      const v = randomGaussian();
      sum += v;
      sumSq += v * v;
    }
    const mean = sum / n;
    const variance = sumSq / n - mean * mean;
    expect(Math.abs(mean)).toBeLessThan(0.15);
    expect(variance).toBeGreaterThan(0.7);
    expect(variance).toBeLessThan(1.3);
  });
});
