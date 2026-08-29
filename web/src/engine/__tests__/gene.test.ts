import { describe, it, expect } from 'vitest';
import { Gene } from '../gene';
import { DNA } from '../dna';
import { ARGS_CAP } from '../constants';

function emptyDna(): DNA {
  const dna = new DNA();
  dna.genes = [];
  dna.args = [];
  return dna;
}

describe('Gene node counts', () => {
  it('value types have no child nodes', () => {
    const dna = emptyDna();
    expect(new Gene(dna, 'x').nodes).toBe(0);
    expect(new Gene(dna, 'y').nodes).toBe(0);
  });

  it('binary operators have two child nodes', () => {
    const dna = emptyDna();
    expect(new Gene(dna, 'add').nodes).toBe(2);
    expect(new Gene(dna, 'sub').nodes).toBe(2);
    expect(new Gene(dna, 'mult').nodes).toBe(2);
    expect(new Gene(dna, 'div').nodes).toBe(2);
  });

  it('if node has four children', () => {
    const dna = emptyDna();
    expect(new Gene(dna, 'if').nodes).toBe(4);
  });

  it('and/or/xor have six children', () => {
    const dna = emptyDna();
    expect(new Gene(dna, 'and').nodes).toBe(6);
    expect(new Gene(dna, 'or').nodes).toBe(6);
    expect(new Gene(dna, 'xor').nodes).toBe(6);
  });
});

describe('rndm value genes', () => {
  it('bind an arg slot and render as a direct u_args index', () => {
    const dna = emptyDna();
    const g = new Gene(dna, 'rndm');
    expect(g.argsBinder).toBe(0);
    expect(dna.args.length).toBe(1);
    expect(g.get()).toBe('u_args[0]');
  });

  it('rndm3 also binds a single arg slot', () => {
    const dna = emptyDna();
    const g = new Gene(dna, 'rndm3');
    expect(g.argsBinder).toBe(0);
    expect(dna.args.length).toBe(1);
  });

  it('caps argsBinder at ARGS_CAP once the pool is full', () => {
    const dna = emptyDna();
    for (let i = 0; i < ARGS_CAP; i++) dna.args.push({ x: 0, y: 0, z: 0 });
    const g = new Gene(dna, 'rndm');
    expect(g.argsBinder).toBe(ARGS_CAP);
    expect(dna.args.length).toBe(ARGS_CAP);
  });
});

describe('copy', () => {
  it('preserves type, address, and depth', () => {
    const dna = emptyDna();
    const original = new Gene(dna, 'sin');
    original.setAdress([0, 1]);

    const copy = original.copy(dna);

    expect(copy.type).toBe(original.type);
    expect(copy.adress).toEqual(original.adress);
    expect(copy.depth).toBe(original.depth);
  });

  it('rebinds argsBinder to the source value, not a freshly allocated one', () => {
    const dna = emptyDna();
    const original = new Gene(dna, 'rndm');
    original.argsBinder = 0;

    const target = emptyDna();
    target.args.push({ x: 9, y: 9, z: 9 }); // pre-existing unrelated arg

    const copy = original.copy(target);

    expect(copy.argsBinder).toBe(original.argsBinder);
  });
});
