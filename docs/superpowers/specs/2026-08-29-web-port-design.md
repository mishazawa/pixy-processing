# Web Port: Vite + React + R3F

## Goal

Port the Processing/Java genetic shader-art generator (`app/`) to a standalone web app at
`web/`, with full feature parity except video/frame-sequence export (dropped — live
time-loop animation on-screen is kept). The Java/Gradle app is untouched.

## Stack

- Vite + React + TypeScript
- `@react-three/fiber` + `@react-three/drei` for the GL canvas
- `zustand` for app state (population, view mode, selection, UI fields)
- Plain CSS, no UI kit
- Vitest for unit tests (engine logic only — no smoke/browser/visual tests; the user drives
  the running app themselves)

## Repo layout

```
web/
  src/
    engine/        # pure TS, no React/GL — port of DNA/Gene/Genes/Pop/Rnd
      rnd.ts genes.ts gene.ts dna.ts pop.ts
      __tests__/
    shaders/        # fragment/vertex GLSL templates + the string-splice helper
    render/         # Artwork mesh component, uniform wiring, offscreen PNG export
    state/          # zustand store, mirrors Pixi.java's fields + action* methods
    components/     # GridView, SingleView, NodeGraph, control panels
```

## Genetic engine (`engine/`)

Direct port of `DNA`/`Gene`/`Genes`/`Rnd`/`Pop`:

- Address-based gene tree (`adress: number[]`, `depth`, `nodes`), same construction
  recursion (`addGene`), same complexity/depth-based value-vs-method probability formula
  (`isValue`).
- `sex()` crossover: swap branches between two parent copies, re-binding `rndm`/`rndm3`
  args into the receiving parent's `args` pool (`argsBinder` reassignment), same iteration
  count formula (`5 + mutationRate/10`).
- `mutate()`: same six-way action dispatch (remove/insert/change/swap/copy node),
  `mutateArgs`/`mutateParameters` (gaussian jitter), same `genes.length * (mutationRate/100
  * 0.05)` iteration count.
- `sortArgs()`: same re-indexing/compaction, cap raised to 511 slots (matches
  `u_args[1536]`, see Shaders below — was already the effective cap in the Java code, just
  now consistent with the array size).
- `getVal`/`getMethod`: same two-stage weighted-rate rejection sampling over
  `Genes.VALUES`/`Genes.METHODS` groups.
- Address-tree ops ported 1:1: `branchIndex`, `grabBranch`, `injectBranch`, `deleteBranch`,
  `updAd`, `getGeneByAdress` (including its fallback-to-fabricated-gene-on-miss behavior —
  ported as-is since callers today never expect the fallback to trigger; a test asserts it
  never does, see Testing).
- Deliberate deviation from the Java: `mutationRate` is passed as a parameter to
  `sex()`/`mutate()` instead of `DNA` holding a back-reference to the app object. Same
  behavior, decouples the engine from any app/store type so it stays independently testable.
- `Pop` equivalent: population array of `{ id, dna, isSelected }`, `evolve()` /
  `evolveAgain()` (pool-of-selected-DNA semantics, single-parent-mutate-only vs.
  multi-parent-sex-pool branches), `randomPop()`, `setPopSize()`.

## Shaders

`fragment.glsl`'s `g_*` primitive library ports over with required ES-portability fixes
(the shader will not compile on WebGL without these — desktop GL2 is lenient in ways
GLSL ES 1.00, what three.js compiles to by default, is not):

- Bare int literals in float-typed expressions (`pow(a.x,2)`, `clamp(a.x,-1,1)`,
  `.../2+0.5`, `.../3`) → explicit float literals (`2.0`, `-1.0`, `1.0`, `3.0`). Full sweep
  of the file required, not fix-on-first-error.
- `precision mediump float;` → `precision highp float;` (real on WebGL; was a no-op on
  desktop GL). The coordinate math (large scale/offset feeding into trig) will visibly band
  under mediump.
- `u_aa`-bounded `for` loops → fixed `MAX_AA` constant bound with `if (i >= u_aa) break;`
  inside the loop body (a uniform can't be a loop bound under strict ES validation).
- `u_args[512]` → `u_args[1536]` — `g_arg(n)` can read up to index `511*3+2 = 1535` since
  `sortArgs` caps `argsBinder` at 511; the array must cover the full addressable range.
- `g_xor`'s existing bug (the `.y`-branch `else` writes `temp.z = d.z` instead of
  `temp.y = d.y`, leaving `temp.y` undefined on that path) is ported **verbatim** — preserved
  for visual parity with the desktop app, not fixed.
- The DNA-code injection point becomes a named placeholder token (`__DNA_CODE__`) resolved
  via `.replace()` at material-build time, replacing Java's positional
  `shaderCode[length-14]` line-index hack. `DNA.code` stays the full `"vec3 col = …;"`
  statement (not a bare expression) so ported tests' `startsWith("vec3 col =")` assertions
  remain a true parity check. Placement is load-bearing: the placeholder sits inside the
  inner AA loop, after `iterX`/`iterY` are set for that sample and before
  `precol[iter] = col;` — moving it out of the loop would silently turn multi-sample AA
  into a no-op (works fine at `u_aa=1`, quietly wrong above).

`vertex.glsl` is simplified to three.js's standard `projectionMatrix` / `modelViewMatrix` /
`uv` varying, replacing Processing's `transformMatrix`/`texMatrix` dance (not needed
outside Processing's rendering pipeline).

## Rendering

- One `<Canvas>` (r3f) hosting an orthographic scene with one mesh + one compiled
  `ShaderMaterial` per artwork (grid of N meshes, not N separate canvases/GL contexts).
- Material is built via `useMemo` keyed on `dna.code`; the previous material is disposed on
  change to avoid GL resource leaks.
- `u_g_off`/`u_g_scale` are computed from each tile's on-screen rect **in drawing-buffer
  pixels** (`rect × gl.getPixelRatio()`), not CSS pixels — `gl_FragCoord` in the shader is in
  drawing-buffer space. This is the same class of bug the Java UI's `pixelDensity` handling
  already had to account for.
- `appTime` advances inside `useFrame`, writing directly into each visible material's
  uniforms (not through zustand) so animation doesn't force a full React re-render every
  frame. The store is synced only for the time slider's displayed value (throttled, not
  per-frame).
- Pan/zoom (`dna.offset`/`dna.scale`) ported from `Artwork.addScale`/`addOffset`/
  `mouseMove`, including the existing zoom-clamp (`0.05`–`50`) that bounds periodic genes
  from aliasing at extreme zoom.

## State (`state/`)

Zustand store mirroring `Pixi.java`'s fields relevant post-UI-rewrite: population, `popRow`,
`view` (`GRID`/`SINGLE`), `focusedId`/`isFocused`, `lastSel`, `aa`, `expSize`, `appTime`,
`timeFreq`, `timeRun`, `mutationRate`. Actions mirror the `action*` methods
(`actionMainNew`/`actionMainEvolve`/`actionMainAgain`, `actionGenPlus`/`Minus`,
`actionAAp`/`Am`, `actionTimePlay`/`Pause`/`Stop`, `actionExp`, `actionBack`) plus
`selButAction`'s toggle-selection logic and its `bMainEvolve` enabled/disabled derivation
(any-selected).

## UI (`components/`)

Reimplementation, not a pixel-for-pixel port of the controlP5 immediate-mode layout code
(that code computed manual pixel offsets for every widget — not appropriate for a web
layout):

- `GridView` — CSS grid of tiles, selection-toggle buttons, focus/hover outline states
  (mirrors `displayStroke`'s three visual states: selected, focused-unselected, plain).
- `SingleView` — pan/zoom on the focused artwork, node-graph debug panel, and the
  time/gen/main control blocks as normal HTML buttons + range inputs.
- `NodeGraph` — canvas/SVG component porting `NodeDisplay`'s layer-by-depth layout (nodes
  grouped by `gene.depth`, edges drawn from each node to its parent found by trimmed
  address).
- Keyboard/mouse shortcuts kept at parity: space (random pop), x (evolve), c (toggle
  select), s (export), esc/backspace (back to grid), arrows (pan), a/z (zoom), 1–6 (AA).

## Export

PNG only. Offscreen render at `expSize × expSize` (separate offscreen renderer/canvas,
mirroring `Artwork.export`'s separate `PGraphics`) → `canvas.toBlob()` → object-URL download
link. No filesystem writes — `PixiPaths` (temp/export/renders dirs) has no web equivalent;
temp shader-source writes are unnecessary since materials compile directly from strings.

## Testing (unit only)

Vitest, scoped to `engine/` (pure logic, no GL/React dependency):

- Ports of `DNATest`/`GeneTest`: random DNA produces valid constructed code, copy
  independence, mutate keeps code valid, sex produces valid child code, value-type node
  counts, binary/quaternary operator node counts, `rndm` arg-slot binding, copy preserves
  type/address.
- New: a full-tree address-integrity check — walk every gene via `getChildren()` /
  `getGeneByAdress` and assert the fallback (fabricated `getGene(true)`) is never hit. This
  single invariant covers the insert/delete/swap/copy/`updAd` surface, which is where a
  translation bug is most likely to hide silently (a corrupted address currently degrades to
  "valid-looking GLSL with a stray random value" instead of an error).
- `Pop.evolve`/`evolveAgain` pool semantics (single-selected → mutate-only path,
  multi-selected → sex-pool path, empty selection no-op).
- `sex()` arg-rebinding correctness (child's `rndm`/`rndm3` genes point at valid indices in
  the child's own `args` array after crossover).
- `sortArgs()` compaction and 511-slot cap.

No smoke tests, no browser/visual/integration tests.

## Implementation order

1. Scaffold (Vite/React/TS/r3f/zustand/Vitest config)
2. Genetic engine + unit tests (done first, in isolation — highest risk of subtle
   translation bugs)
3. Shader templates + single-Artwork render component
4. Grid rendering + selection/focus
5. Zustand store wiring all actions
6. Single view UI + node graph + pan/zoom/keyboard
7. PNG export
