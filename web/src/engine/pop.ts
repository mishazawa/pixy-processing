import { DNA } from './dna';
import { randomIndex } from './rnd';

// Note: Java's Artwork.id (array-position, used only to name a now-nonexistent
// temp shader file) has no equivalent here -- members' array index IS a
// stable React key since Pop only ever appends at the end or truncates from
// the end (never reorders), so no id field is needed.
export interface PopMember {
  dna: DNA;
  isSelected: boolean;
}

export class Pop {
  members: PopMember[] = [];
  lastPool: DNA[] = [];

  setPopSize(row: number): void {
    const popSize = row * row;
    const prevPop = this.members.length;
    if (popSize > prevPop) {
      for (let i = 0; i < popSize - prevPop; i++) {
        this.members.push({ dna: DNA.random(), isSelected: false });
      }
    } else if (prevPop > popSize) {
      this.members.length = popSize;
    }
  }

  evolve(mutationRate: number): void {
    const pool: DNA[] = [];
    for (const m of this.members) {
      if (m.isSelected) pool.push(m.dna);
      m.isSelected = false;
    }
    this.applyPool(pool, mutationRate);
    this.lastPool = pool;
  }

  evolveAgain(mutationRate: number): void {
    const pool = this.lastPool;
    for (const m of this.members) {
      if (m.isSelected) pool.push(m.dna);
      m.isSelected = false;
    }
    this.applyPool(pool, mutationRate);
  }

  randomPop(): void {
    for (const m of this.members) {
      m.dna = DNA.random();
      m.isSelected = false;
    }
    this.lastPool = [];
  }

  // Mirrors DNA d1.sex(d1, d2) call sites in Pop.java: every actual call
  // passes the receiver as its own first argument, so `a.sex(b, rate)` here
  // (using `this` as the implicit d1) is exactly equivalent.
  private applyPool(pool: DNA[], mutationRate: number): void {
    if (pool.length === 1) {
      this.members[0].dna = pool[0].copy();
      for (let i = 1; i < this.members.length; i++) {
        const newDna = pool[0].copy();
        newDna.mutate(mutationRate);
        this.members[i].dna = newDna;
      }
    }
    if (pool.length > 1) {
      for (const m of this.members) {
        const a = pool[randomIndex(pool.length)];
        m.dna = a.sex(pool[randomIndex(pool.length)], mutationRate);
      }
    }
  }
}
