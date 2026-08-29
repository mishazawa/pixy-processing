// DNA.sortArgs() caps args at ARGS_CAP addressable slots (falls back to
// index ARGS_CAP beyond that) while allowing the backing pool to grow to
// ARGS_POOL_SIZE entries before compacting. u_args in the fragment shader
// is declared `vec3 u_args[ARGS_POOL_SIZE]` and must cover the full
// addressable range.
//
// The original Java port used 511/512 (matching the desktop app's cap),
// but a flat float array at that size (u_args[1536]) empirically exceeded
// real hardware's fragment-uniform budget under WebGL/ANGLE -- see
// shaders/fragment.glsl.ts's header comment. 127/128 keeps the shader's
// uniform footprint (128 vector slots as vec3) comfortably under even
// conservative device limits (~256 is a common real-world floor), while
// still far exceeding the largest arg count observed in testing (76).
export const ARGS_CAP = 127;
export const ARGS_POOL_SIZE = 128;
