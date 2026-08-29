import { describe, it, expect } from 'vitest';
import { Pop } from '../pop';

describe('Pop.setPopSize', () => {
  it('grows to row*row members with random DNA', () => {
    const pop = new Pop();
    pop.setPopSize(3);
    expect(pop.members.length).toBe(9);
    pop.members.forEach((m) => expect(m.dna.genes.length).toBeGreaterThan(0));
  });

  it('shrinks by dropping members from the end', () => {
    const pop = new Pop();
    pop.setPopSize(3);
    const kept = pop.members.slice(0, 4);
    pop.setPopSize(2);
    expect(pop.members.length).toBe(4);
    expect(pop.members.map((m) => m.dna)).toEqual(kept.map((m) => m.dna));
  });
});

describe('Pop.evolve', () => {
  it('is a no-op when nothing is selected', () => {
    const pop = new Pop();
    pop.setPopSize(2);
    const before = pop.members.map((m) => m.dna);

    pop.evolve(100);

    expect(pop.members.map((m) => m.dna)).toEqual(before);
    expect(pop.lastPool).toEqual([]);
  });

  it('single selection: member 0 gets an unmutated copy, the rest get mutated copies', () => {
    const pop = new Pop();
    pop.setPopSize(2);
    const selectedDna = pop.members[0].dna;
    pop.members[0].isSelected = true;

    pop.evolve(100);

    expect(pop.members[0].dna).not.toBe(selectedDna);
    expect(pop.members[0].dna.code).toBe(selectedDna.code);
    expect(pop.members.every((m) => !m.isSelected)).toBe(true);
    expect(pop.lastPool).toEqual([selectedDna]);
  });

  it('multi-selection produces a sexed child for every member', () => {
    const pop = new Pop();
    pop.setPopSize(2);
    pop.members[0].isSelected = true;
    pop.members[1].isSelected = true;

    pop.evolve(100);

    pop.members.forEach((m) => {
      expect(m.dna.code.startsWith('vec3 col =')).toBe(true);
    });
  });
});

describe('Pop.evolveAgain', () => {
  it('reuses lastPool and accumulates newly selected members into it', () => {
    const pop = new Pop();
    pop.setPopSize(2);
    pop.members[0].isSelected = true;
    pop.evolve(100);
    const firstPool = pop.lastPool;

    pop.members[1].isSelected = true;
    pop.evolveAgain(100);

    expect(pop.lastPool).toBe(firstPool);
    expect(pop.lastPool.length).toBe(2);
  });
});

describe('Pop.randomPop', () => {
  it('reassigns fresh random DNA to every member and clears lastPool', () => {
    const pop = new Pop();
    pop.setPopSize(2);
    pop.members[0].isSelected = true;
    const before = pop.members.map((m) => m.dna);

    pop.randomPop();

    pop.members.forEach((m, i) => {
      expect(m.dna).not.toBe(before[i]);
      expect(m.isSelected).toBe(false);
    });
    expect(pop.lastPool).toEqual([]);
  });
});
