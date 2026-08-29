// DNA.sortArgs() (Java) caps args at 511 addressable slots (falls back to
// index 511 beyond that) while allowing the backing pool to grow to 512
// entries before compacting. u_args in the fragment shader must cover the
// full addressable range: 511 * 3 + 2 = 1535, so it's sized to
// ARGS_POOL_SIZE * 3 = 1536 floats.
export const ARGS_CAP = 511;
export const ARGS_POOL_SIZE = 512;
