import { describe, it, expect } from 'vitest';
import { DNA } from '../dna';
import type { Gene } from '../gene';
import { ARGS_POOL_SIZE } from '../constants';

describe('DNA.random', () => {
  it('produces constructed code starting with "vec3 col ="', () => {
    const dna = DNA.random();
    expect(dna.genes.length).toBeGreaterThan(0);
    expect(dna.code.startsWith('vec3 col =')).toBe(true);
  });
});

// Walks every gene's declared children via getGeneByAdress and asserts the
// address-based lookup always finds a REAL gene at that address, never
// getGeneByAdress's fallback (a fabricated getGene(true) whose .adress is
// always []). A corrupted address after insert/delete/swap/copy/updAd would
// otherwise silently produce "valid-looking" GLSL referencing a stray random
// value instead of failing loudly — this is the single check that covers
// that whole surface.
function assertAddressIntegrity(dna: DNA) {
  for (const gene of dna.genes) {
    const children = gene.getChildren();
    children.forEach((child, i) => {
      const expectedAdress = [...gene.adress, i];
      expect(child.adress).toEqual(expectedAdress);
    });
  }
}

describe('DNA address integrity', () => {
  it('holds after random construction', () => {
    const dna = DNA.random();
    assertAddressIntegrity(dna);
  });
});

describe('DNA.copy', () => {
  it('produces an independent gene list with identical code', () => {
    const original = DNA.random();
    const copy = original.copy();

    expect(copy.code).toBe(original.code);
    expect(copy.genes.length).toBe(original.genes.length);
    expect(copy.genes).not.toBe(original.genes);
  });

  it('holds address integrity after copy', () => {
    const original = DNA.random();
    const copy = original.copy();
    assertAddressIntegrity(copy);
  });
});

describe('DNA.mutate', () => {
  it('keeps code valid and genes non-empty', () => {
    const dna = DNA.random();
    dna.mutate(100);

    expect(dna.code.startsWith('vec3 col =')).toBe(true);
    expect(dna.genes.length).toBeGreaterThan(0);
  });

  it('holds address integrity after mutate, repeated', () => {
    for (let trial = 0; trial < 20; trial++) {
      const dna = DNA.random();
      dna.mutate(100);
      assertAddressIntegrity(dna);
    }
  });

  it('never leaves more than ARGS_CAP+1 args after sortArgs', () => {
    const dna = DNA.random();
    dna.mutate(100);
    expect(dna.args.length).toBeLessThanOrEqual(ARGS_POOL_SIZE);
  });
});

describe('DNA.sex', () => {
  it('produces a child with valid constructed code', () => {
    const p1 = DNA.random();
    const p2 = DNA.random();

    const child = p1.sex(p2, 100);

    expect(child.code.startsWith('vec3 col =')).toBe(true);
    expect(child.genes.length).toBeGreaterThan(0);
  });

  it('holds address integrity in the child, repeated', () => {
    for (let trial = 0; trial < 20; trial++) {
      const p1 = DNA.random();
      const p2 = DNA.random();
      const child = p1.sex(p2, 100);
      assertAddressIntegrity(child);
    }
  });

  it('rebinds every rndm/rndm3 gene in the child to a valid index in the child\'s own args', () => {
    for (let trial = 0; trial < 20; trial++) {
      const p1 = DNA.random();
      const p2 = DNA.random();
      const child = p1.sex(p2, 100);

      for (const g of child.genes as Gene[]) {
        if (g.type === 'rndm' || g.type === 'rndm3') {
          expect(g.argsBinder).toBeGreaterThanOrEqual(0);
          expect(g.argsBinder).toBeLessThan(child.args.length);
        }
      }
    }
  });
});
