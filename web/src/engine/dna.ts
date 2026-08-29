import type { Gene } from './gene';
import type { Vec3 } from './vec3';

export class DNA {
  genes: Gene[] = [];
  args: Vec3[] = [];

  getGeneByAdress(_a: number[]): Gene {
    throw new Error('not implemented until Task 5');
  }
}
