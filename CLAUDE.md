# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Build and run via the Gradle wrapper (do not invoke `gradle` directly):

```bash
./gradlew build          # compile, test, assemble
./gradlew run             # run the application (launches the Processing sketch window)
./gradlew test            # run all tests (JUnit 5 / Jupiter)
./gradlew test --tests "processing_template.DNATest"                 # run a single test class
./gradlew test --tests "processing_template.DNATest.mutateKeepsCodeValid"  # run a single test method
```

`./gradlew compileJava` is the fast compile-only check — prefer it while iterating, since this is a
GUI (Processing/OpenGL) app that can't be meaningfully smoke-tested from the CLI. Verify changes by
compiling; running the actual sketch is done by the user, not from here.

## Architecture

Single-module Gradle Java application (`app/`, registered in `settings.gradle.kts`) built on top of
[Processing](https://processing.org/) (`org.processing:core:4.3.1`) for rendering/GL and
[controlP5](http://www.sojamo.de/libraries/controlP5/) (`app/libs/controlP5.jar`) for the UI widgets.
It's a port of a procedural/genetic shader-art generator originally written as Processing `.pde` tabs
(preserved for reference under `to_rewrite/`).

- Entry point: `App.main()` (`app/build.gradle.kts` → `application.mainClass`) constructs a `Sketch`
  and calls `PApplet.runSketch(...)`.
- `Sketch` (extends `PApplet`) owns the Processing lifecycle (`settings`/`setup`/`draw`) and forwards
  input events (`mousePressed`, `keyPressed`, `controlEvent`, etc.) to `Pixi`, which holds all
  application/UI state and logic. `.pde` tabs shared implicit PApplet scope; the port threads explicit
  `Sketch sk`/`Pixi app` references through every class instead.
- `Pixi` — main app/UI class: layout (grid vs single/side views), controlP5 widget wiring
  (`controls()`), all `action*` button callbacks (invoked via controlP5 reflection, so they must stay
  `public`), keyboard/mouse handling.
- `Pop` — the population of `Artwork`s shown in the grid; owns evolve/mutate/random-pop operations.
- `Artwork` — one generated image: compiles its `DNA`'s GLSL expression into
  `data/fragment.glsl` (see below), tracks its own `PShader`, pan/zoom (`dna.offset`/`dna.scale`), and
  render/export.
- `DNA`/`Gene`/`Genes` — the genetic-programming core: builds/mutates/crosses a tree of `Gene`s into a
  GLSL-like expression string (`DNA.code`), independent of any live `PApplet`/GL context so it's unit
  testable (see `DNATest`, `GeneTest`).
- `Rnd` — `java.util.Random`-backed replacement for Processing's instance-bound `random()`/
  `randomGaussian()`, introduced specifically so `DNA`/`Gene` don't need a `PApplet` to run.
- `NodeDisplay` — renders the gene tree as a node graph (debug/inspector view).
- `PixiPaths` — all runtime output (compiled temp shaders, exported images, rendered animation
  frames) is written under `~/Documents/pixi/{temp,export,renders}`, never into the project tree.
- Shaders live in `app/src/main/resources/data/{vertex,fragment}.glsl` and are the actual rendering
  logic for generated artwork: `fragment.glsl` defines the `g_*` gene primitives (math/trig/logic
  nodes) that `Gene.get()` composes into expressions, plus tone-mapping/anti-aliasing/AA-sampling
  infrastructure. When editing genes, keep `Gene`'s codegen (Java) and `fragment.glsl`'s `g_*`
  functions (GLSL) in sync — they're two views of the same primitive set.

## Notes for shader/rendering work

- Coordinates: `g_x()`/`g_y()` in `fragment.glsl` derive per-pixel "world" coordinates from
  `gl_FragCoord`, scaled/offset by uniforms computed in `Artwork.update()`/`setShader()`
  (`u_g_off`/`u_g_scale` from the on-screen box size, `u_off`/`u_scale` from `dna.offset`/`dna.scale`
  pan/zoom). `Pixi.displaySquare()` crops any panel (single view, sidebar preview) to a centered
  square before calling `pop.display()`, so every view shares the grid's square aspect/crop.
- Several `g_*` functions guard against NaN/Infinity/periodic-aliasing blowups (unbounded `pow`,
  `tan`'s asymptotes, `log`-based division by zero, division near zero) — see comments in
  `fragment.glsl` before "fixing" values that look clamped; it's usually intentional bounding, not a
  precision bug.
- `dna.scale` (zoom) is clamped in `Artwork.addScale()` to keep periodic genes from aliasing into
  dense repeating stripes at extreme zoom.

## Dependency setup

Native JOGL/gluegen libraries are extracted per-platform into `build/natives` by the `extractNatives`
Gradle task (wired as a dependency of `run`), with `java.library.path` and JOGL-related
`--add-exports`/`--add-opens` JVM args configured on the `run` task in `app/build.gradle.kts`.
Dependency versions are centralized in `gradle/libs.versions.toml` (a Gradle version catalog) except
for the Processing/JOGL/controlP5 dependencies, which are declared directly. Java toolchain is pinned
to language version 21. Tests use JUnit Jupiter, run through the JUnit Platform (`useJUnitPlatform()`).
