import { Gene } from './gene';
import { random, randomIndex, randomGaussian } from './rnd';
import { copyVec3, type Vec3 } from './vec3';
import { ARGS_CAP, ARGS_POOL_SIZE } from './constants';
import { VALUES, VALUES_RATE, METHODS, METHODS_GROUP_RATE, METHODS_RATE } from './genes';

export class DNA {
  genes: Gene[] = [];
  scale = 4;
  offset: Vec3 = { x: 0, y: 0, z: 0 };
  hueOffset = 0;
  args: Vec3[] = [];
  code = '';
  complexity = 6;

  private updAdInd = 0;

  static random(): DNA {
    const dna = new DNA();
    dna.randomDNA();
    return dna;
  }

  // MAIN METHODS

  construct(): void {
    this.code = `vec3 col = ${this.genes[0].get()};`;
  }

  randomDNA(): void {
    this.args = [];
    this.complexity = random(3, 16);
    this.hueOffset = random(1);
    this.genes = [];
    this.addGene();
    this.construct();
  }

  // SEX

  sex(other: DNA, mutationRate: number): DNA {
    const p1 = this.copy();
    const p2 = other.copy();

    const iterations = 5 + mutationRate / 10;
    for (let i = 0; i < iterations; i++) {
      DNA.sSwap(p1, p1.genes[randomIndex(p1.genes.length)], p2, p2.genes[randomIndex(p2.genes.length)]);
    }
    p1.mutate(mutationRate);
    p1.construct();
    return p1;
  }

  private static sSwap(p1: DNA, g1: Gene, p2: DNA, g2: Gene): void {
    const b1 = p1.grabBranch(g1, p2);
    const b2 = p2.grabBranch(g2, p1);

    for (const g of b2) {
      if (g.type === 'rndm' || g.type === 'rndm3') {
        p1.args.push(copyVec3(p2.args[g.argsBinder]));
        g.argsBinder = p1.args.length - 1;
      }
    }

    for (const g of b1) {
      if (g.type === 'rndm' || g.type === 'rndm3') {
        p2.args.push(copyVec3(p1.args[g.argsBinder]));
        g.argsBinder = p2.args.length - 1;
      }
    }

    let ind = p1.geneIndex(g1);
    p1.deleteBranch(g1);
    p1.injectBranch(ind, b2);
    p1.genes[ind].setAdress(g1.adress);
    p1.updAd(p1.genes[ind]);
    p1.sortArgs();

    ind = p2.geneIndex(g2);
    p2.deleteBranch(g2);
    p2.injectBranch(ind, b1);
    p2.genes[ind].setAdress(g2.adress);
    p2.updAd(p2.genes[ind]);
    p2.sortArgs();
  }

  // COPY

  private copyGenes(target: DNA): Gene[] {
    return this.genes.map((g) => g.copy(target));
  }

  private copyArgs(): Vec3[] {
    return this.args.map((a) => copyVec3(a));
  }

  // Note: does NOT copy `complexity` -- matches DNA.java's copy() exactly.
  // complexity is only read by isValueAtDepth(), which only runs during
  // addGene() during randomDNA(); a copy never calls randomDNA() again, so
  // this field is provably inert on a copied DNA either way.
  copy(): DNA {
    const temp = new DNA();
    temp.genes = this.copyGenes(temp);
    temp.code = this.code;
    temp.scale = this.scale;
    temp.offset = copyVec3(this.offset);
    temp.hueOffset = this.hueOffset;
    temp.args = this.copyArgs();
    return temp;
  }

  // PICK GENES

  private getVal(): string {
    for (let i = 0; i < 100; i++) {
      const rtest = randomIndex(VALUES.length);
      if (random(1) < VALUES_RATE[rtest]) return VALUES[rtest];
    }
    return 'rndm';
  }

  private getMethod(): string {
    let methodGroup: string[] = [];
    let methodGroupRate: number[] = [];
    let found = false;

    for (let i = 0; i < 100; i++) {
      const rtest = randomIndex(METHODS.length);
      if (random(1) < METHODS_GROUP_RATE[rtest]) {
        methodGroup = METHODS[rtest];
        methodGroupRate = METHODS_RATE[rtest];
        found = true;
        break;
      }
    }
    if (!found) return 'rndm';

    for (let i = 0; i < 100; i++) {
      const rtest = randomIndex(methodGroup.length);
      if (random(1) < methodGroupRate[rtest]) return methodGroup[rtest];
    }

    return 'rndm';
  }

  getGene(isVal: boolean): Gene {
    return isVal ? new Gene(this, this.getVal()) : new Gene(this, this.getMethod());
  }

  // COMPLEXITY FORMULA

  private isValueAtDepth(depth: number): boolean {
    const test = Math.pow(1 - (depth - 2) / this.complexity, 2);
    return random(1) > test;
  }

  // GENERAL METHODS

  getGeneByAdress(a: number[]): Gene {
    for (const g of this.genes) {
      if (arraysEqual(g.adress, a)) return g;
    }
    return this.getGene(true);
  }

  private geneIndex(g: Gene): number {
    return this.genes.indexOf(g);
  }

  private isValueGene(g: Gene): boolean {
    return g.type === 'x' || g.type === 'y' || g.type === 'rndm' || g.type === 'rndm3';
  }

  // CONSTRUCTION METHODS

  private addGene(n = 0, a: number[] = []): void {
    this.genes.push(this.getGene(this.isValueAtDepth(a.length + 1)));
    const lastGene = this.genes[this.genes.length - 1];
    const newAdress = [...a, n];
    lastGene.setAdress(newAdress);

    for (let i = 0; i < lastGene.nodes; i++) this.addGene(i, lastGene.adress);
  }

  // MUTATION

  mutate(mutationRate: number): void {
    this.mutateArgs();
    this.mutateParameters();
    const iterations = this.genes.length * ((mutationRate / 100) * 0.05);
    for (let i = 0; i < iterations; i++) {
      const g = this.genes[randomIndex(this.genes.length)];
      const g2 = this.genes[randomIndex(this.genes.length)];
      const act = randomIndex(6);
      if (act === 0) this.mRemoveNode(g);
      if (act === 1) this.mInsert(g);
      if (act === 5) this.mInsert(g);
      if (act === 2) this.changeGene(g);
      if (act === 3) this.mSwap(g, g2);
      if (act === 4) this.mCopy(g, g2);
    }
    this.sortArgs();
    this.construct();
  }

  sortArgs(): void {
    const sorted: Vec3[] = [];
    for (const g of this.genes) {
      if (g.type === 'rndm' || g.type === 'rndm3') {
        if (sorted.length < ARGS_POOL_SIZE) {
          sorted.push(this.args[g.argsBinder]);
          g.argsBinder = sorted.length - 1;
        } else {
          g.argsBinder = ARGS_CAP;
        }
      }
    }
    this.args = sorted;
  }

  private mCopy(g1: Gene, g2: Gene): void {
    const b1 = this.grabBranch(g1, this);
    const ind = this.geneIndex(g2);
    this.deleteBranch(g2);
    this.injectBranch(ind, b1);
    this.genes[ind].setAdress(g2.adress);
    this.updAd(this.genes[ind]);
  }

  private mSwap(g1: Gene, g2: Gene): void {
    const b1 = this.grabBranch(g1, this);
    const b2 = this.grabBranch(g2, this);

    let ind = this.geneIndex(g1);
    this.deleteBranch(g1);
    this.injectBranch(ind, b2);
    this.genes[ind].setAdress(g1.adress);
    this.updAd(this.genes[ind]);

    ind = this.geneIndex(g2);
    if (ind >= 0) {
      this.deleteBranch(g2);
      this.injectBranch(ind, b1);
      this.genes[ind].setAdress(g2.adress);
      this.updAd(this.genes[ind]);
    }
  }

  private mRemoveNode(g: Gene): void {
    if (!this.isValueGene(g)) {
      const index = this.geneIndex(g);
      this.clearNode(g, g.nodes - 1);
      this.genes.splice(index, 1);
      this.genes[index].setAdress(g.adress);
      this.updAd(this.genes[index]);
    }
  }

  private mInsert(g: Gene): void {
    const index = this.geneIndex(g);
    const newGene = this.getGene(false);
    newGene.setAdress(g.adress);
    this.genes.splice(index, 0, newGene);
    const toAdd = newGene.nodes - 1;
    this.updNode(newGene, toAdd);
  }

  private updNode(g: Gene, n: number): void {
    if (n > 0) this.fillNode(g, n);
    else if (n < 0) this.clearNode(g, Math.abs(n));
    this.updAd(g);
  }

  private fillNode(g: Gene, n: number): void {
    const index = this.geneIndex(g);
    for (let i = 0; i < n; i++) {
      this.genes.splice(index + 1, 0, this.getGene(true));
    }
  }

  private clearNode(g: Gene, n: number): void {
    const deleted: number[] = [];
    for (let i = 0; i < n; i++) {
      const newAdress = [...g.adress];
      let delnode = 0;
      let setdelnode = false;
      while (!setdelnode) {
        delnode = randomIndex(g.nodes);
        setdelnode = true;
        for (const nd of deleted) {
          if (delnode === nd) setdelnode = false;
        }
      }
      newAdress.push(delnode);
      deleted.push(delnode);
      const delGene = this.getGeneByAdress(newAdress);
      this.deleteBranch(delGene);
    }
  }

  // Shared mutable cursor driving updAd's pre-order re-addressing walk
  // (mirrors DNA.java's `updAdInd` field). The recursive helper's `index`
  // parameter in the Java source was unused dead code (it always reads
  // genes.get(updAdInd), ignoring the passed index) -- dropped here since
  // it never affected behavior.
  private updAd(g: Gene): void {
    this.updAdInd = this.geneIndex(g) + 1;
    if (this.updAdInd < this.genes.length) {
      for (let i = 0; i < g.nodes; i++) {
        this.updAdRecurse(i, g.adress);
      }
    }
  }

  private updAdRecurse(n: number, a: number[]): void {
    const g = this.genes[this.updAdInd];
    const newAd = [...a, n];
    g.setAdress(newAd);
    this.updAdInd++;
    for (let i = 0; i < g.nodes; i++) {
      if (this.updAdInd < this.genes.length) this.updAdRecurse(i, newAd);
    }
  }

  private branchIndex(g: Gene): [number, number] {
    const first = this.geneIndex(g);
    for (let i = first + 1; i < this.genes.length; i++) {
      if (this.genes[i].depth <= g.depth) {
        return [first, i - 1];
      }
    }
    return [first, this.genes.length - 1];
  }

  private deleteBranch(g: Gene): void {
    const [start, end] = this.branchIndex(g);
    this.genes.splice(start, end - start + 1);
  }

  private grabBranch(g: Gene, target: DNA): Gene[] {
    const [start, end] = this.branchIndex(g);
    const branch: Gene[] = [];
    for (let i = start; i <= end; i++) {
      branch.push(this.genes[i].copy(target));
    }
    return branch;
  }

  private injectBranch(index: number, branch: Gene[]): void {
    for (let i = branch.length - 1; i >= 0; i--) {
      this.genes.splice(index, 0, branch[i]);
    }
  }

  private mutateParameters(): void {
    this.hueOffset += randomGaussian() * 0.1;
  }

  // The Java source re-evaluates `Rnd.random(args.size())` on every loop
  // CONDITION check (`for (int i = 0; i < Rnd.random(args.size()); i++)`),
  // not once upfront -- a while-loop with a fresh draw each check is the
  // faithful port; a for-loop with the bound computed once would silently
  // change the mutation-count distribution.
  private mutateArgs(): void {
    const n = this.args.length;
    let i = 0;
    while (i < random(n)) {
      const num = randomIndex(n);
      const a = this.args[num];
      if (a.x === a.y && a.y === a.z) {
        const temp = randomGaussian() * 0.1;
        a.x += temp;
        a.y += temp;
        a.z += temp;
      } else {
        a.x += randomGaussian() * 0.1;
        a.y += randomGaussian() * 0.1;
        a.z += randomGaussian() * 0.1;
      }
      i++;
    }
  }

  private changeGene(g: Gene): void {
    const index = this.geneIndex(g);

    if (this.isValueGene(g)) {
      this.genes[index] = this.getGene(true);
    } else {
      this.genes[index] = this.getGene(false);
    }

    const newGene = this.genes[index];
    newGene.setAdress([...g.adress]);

    if (newGene.nodes < g.nodes) {
      const todelete = g.nodes - newGene.nodes;
      for (let i = todelete; i > 0; i--) {
        const deladress = [...newGene.adress, g.nodes - i];
        this.deleteBranch(this.getGeneByAdress(deladress));
      }
    } else if (newGene.nodes > g.nodes) {
      const toadd = newGene.nodes - g.nodes;
      for (let i = toadd; i >= 1; i--) {
        this.genes.splice(index + 1, 0, this.getGene(true));
        const parentAdress = [...newGene.adress, g.nodes + i - 1];
        this.genes[index + 1].setAdress(parentAdress);
      }
    }
  }
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
