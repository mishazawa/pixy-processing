// Ports Rnd.java. random()/randomIndex() mirror Rnd.random()/(int) Rnd.random()
// call sites throughout the engine 1:1. randomGaussian() uses a standard
// Box-Muller transform (Java's Random.nextGaussian() uses the polar/Marsaglia
// variant internally, but both produce a standard-normal distribution — the
// engine only depends on the distribution shape, never on bit-exact values).
export function random(a: number, b?: number): number {
  const low = b === undefined ? 0 : a;
  const high = b === undefined ? a : b;
  return low + Math.random() * (high - low);
}

export function randomIndex(bound: number): number {
  return Math.floor(random(bound));
}

let spareGaussian: number | null = null;

export function randomGaussian(): number {
  if (spareGaussian !== null) {
    const value = spareGaussian;
    spareGaussian = null;
    return value;
  }
  let u = 0;
  let v = 0;
  let s = 0;
  do {
    u = Math.random() * 2 - 1;
    v = Math.random() * 2 - 1;
    s = u * u + v * v;
  } while (s >= 1 || s === 0);
  const mul = Math.sqrt((-2 * Math.log(s)) / s);
  spareGaussian = v * mul;
  return u * mul;
}
