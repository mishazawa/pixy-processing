import type { DNA } from './dna';
import { random, randomGaussian } from './rnd';
import { vec3 } from './vec3';
import { ARGS_CAP } from './constants';

// Ports Gene.java's node-count switch verbatim.
export const GENE_NODE_COUNTS: Record<string, number> = {
  x: 0,
  y: 0,
  add: 2,
  sub: 2,
  mult: 2,
  div: 2,
  pow2: 1,
  sqrt: 1,
  powOf: 2,
  logOf: 2,
  '2pow': 1,
  '2log': 1,
  mod: 2,
  fract: 1,
  floor: 1,
  ceil: 1,
  round: 1,
  min: 2,
  max: 2,
  clamp: 3,
  abs: 1,
  sin: 1,
  cos: 1,
  tan: 1,
  asin: 1,
  acos: 1,
  atan: 2,
  mix: 3,
  if: 4,
  and: 6,
  or: 6,
  xor: 6,
  hsb2rgb: 1,
  combine: 3,
  setH: 2,
  setS: 2,
  setV: 2,
  noise2: 2,
  rndm: 0,
  rndm3: 0,
};

export class Gene {
  dna: DNA;
  type: string;
  adress: number[] = [];
  depth = 0;
  nodes: number;
  argsBinder = 0;

  constructor(dna: DNA, type: string) {
    this.dna = dna;
    this.type = type;
    this.nodes = GENE_NODE_COUNTS[type] ?? 0;

    if (type === 'rndm' || type === 'rndm3') {
      if (dna.args.length >= ARGS_CAP) {
        this.argsBinder = ARGS_CAP;
      } else {
        this.argsBinder = dna.args.length;
        const temp = random(1);
        if (type === 'rndm') {
          dna.args.push(vec3(temp, temp, temp));
        } else {
          dna.args.push(
            vec3(
              temp + randomGaussian() * 0.2,
              temp + randomGaussian() * 0.2,
              temp + randomGaussian() * 0.2,
            ),
          );
        }
      }
    }
  }

  get(): string {
    if (this.type === 'rndm' || this.type === 'rndm3') {
      return `g_arg(${this.argsBinder})`;
    }
    let temp = `g_${this.type}(`;
    if (this.nodes > 0) {
      temp += this.getChildren()
        .map((child) => child.get())
        .join(',');
    }
    return `${temp})`;
  }

  getChildren(): Gene[] {
    const children: Gene[] = [];
    for (let i = 0; i < this.nodes; i++) {
      children.push(this.dna.getGeneByAdress([...this.adress, i]));
    }
    return children;
  }

  setAdress(adress: number[]): void {
    this.adress = adress;
    this.depth = adress.length;
  }

  // Mirrors Gene.copy(DNA) in Java exactly: re-running `new Gene(target, type)`
  // for a rndm/rndm3 gene pushes a throwaway arg onto target.args as a
  // constructor side effect, same as the original. argsBinder is then
  // overwritten with the SOURCE gene's original value (not the freshly
  // allocated one), so the throwaway push is dead weight in target.args
  // until DNA.sortArgs() prunes it. This is intentional parity, not a bug —
  // do not "optimize" it into a lighter-weight field copy.
  copy(target: DNA): Gene {
    const clone = new Gene(target, this.type);
    clone.adress = [...this.adress];
    clone.depth = this.depth;
    clone.nodes = this.nodes;
    clone.argsBinder = this.argsBinder;
    return clone;
  }
}
