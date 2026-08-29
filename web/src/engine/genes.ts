// Ports Genes.java's weighted gene tables verbatim, EXCEPT: ROUND_RATE and
// ELSE_RATE are trimmed to match their VALUES array's length. The Java
// arrays had trailing extra entries (ROUND_RATE had 6 for ROUND's 5, ELSE_RATE
// had 7 for ELSE's 5) that getMethod()'s indexing — always bounded by
// methodGroup.length — could never reach. Trimming them is a no-op on
// behavior, not a fidelity change.
export const VALUES = ['x', 'y', 'rndm', 'rndm3'];
export const VALUES_RATE = [1, 1, 0.5, 0.5];

export const BASIC_MATH = ['add', 'sub', 'mult', 'div'];
export const BASIC_MATH_RATE = [1, 1, 1, 1];

export const EXPONENTIAL = ['pow2', 'sqrt', 'powOf', 'logOf', '2pow', '2log'];
export const EXPONENTIAL_RATE = [1, 1, 0.3, 0.3, 0.3, 0.3];

export const ROUND = ['mod', 'fract', 'floor', 'ceil', 'round'];
export const ROUND_RATE = [0.5, 1, 1, 1, 1];

export const TRIG = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan'];
export const TRIG_RATE = [1, 1, 0.1, 0.1, 0.1, 0.5];

export const CONSTRAIN = ['min', 'max', 'clamp', 'abs'];
export const CONSTRAIN_RATE = [1, 1, 0.5, 1];

export const MIX = ['mix'];
export const MIX_RATE = [1];

export const LOGIC = ['if', 'and', 'or', 'xor'];
export const LOGIC_RATE = [1, 1, 1, 1];

export const ELSE = ['hsb2rgb', 'combine', 'setH', 'setS', 'setV'];
export const ELSE_RATE = [1, 1, 1, 1, 1];

export const METHODS = [BASIC_MATH, EXPONENTIAL, ROUND, TRIG, CONSTRAIN, MIX, LOGIC, ELSE];
export const METHODS_GROUP_RATE = [1.5, 0.01, 0.01, 0.1, 0.1, 0.1, 0.1, 0.1];
export const METHODS_RATE = [
  BASIC_MATH_RATE,
  EXPONENTIAL_RATE,
  ROUND_RATE,
  TRIG_RATE,
  CONSTRAIN_RATE,
  MIX_RATE,
  LOGIC_RATE,
  ELSE_RATE,
];
