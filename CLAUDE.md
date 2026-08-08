# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Build and run via the Gradle wrapper (do not invoke `gradle` directly):

```bash
./gradlew build          # compile, test, assemble
./gradlew run             # run the application (processing_template.App main class)
./gradlew test            # run all tests (JUnit 5 / Jupiter)
./gradlew test --tests "processing_template.AppTest"          # run a single test class
./gradlew test --tests "processing_template.AppTest.appHasAGreeting"  # run a single test method
```

## Architecture

Standard single-module Gradle Java application, generated via `gradle init` and not yet customized:

- `app/` — the sole subproject (registered in `settings.gradle.kts`), containing all source under `app/src/main/java/processing_template` and tests under `app/src/test/java/processing_template`.
- Entry point: `processing_template.App` (configured as `application.mainClass` in `app/build.gradle.kts`).
- Dependency versions are centralized in `gradle/libs.versions.toml` (a Gradle version catalog) and referenced in `app/build.gradle.kts` via `libs.*`.
- Java toolchain is pinned to language version 21 in `app/build.gradle.kts`.
- Tests use JUnit Jupiter, run through the JUnit Platform (`useJUnitPlatform()`).
