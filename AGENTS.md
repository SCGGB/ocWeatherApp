# AGENTS.md

## Project

Bun-based CLI weather app (Spanish-language UI). Reads from stdin, prints to stdout — not an HTTP server. Data comes from OpenMeteo (free, no API key).

## Commands

- Run: `bun run index.ts` (no npm; only Bun is used)
- Typecheck: `bunx tsc --noEmit` (tsconfig sets `noEmit: true`; there is no lint or test setup)
- Compile to binary (per README goal): `bun build --compile index.ts --outfile <name>`

## State

- Entry point is a single file: `index.ts` — currently still the `bun init` scaffold (`console.log("Hello via Bun!")`). The app is unimplemented.
- Only dependency is `@types/bun` (dev). No framework, no runtime deps.

## Conventions

- README and expected menu/UI copy are in Spanish; keep user-facing strings in Spanish.
- App flow (from README): geocoding step → forecast step. Example endpoints:
  - `https://geocoding-api.open-meteo.com/v1/search?name=...&count=1&language=es&format=json`
  - `https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=temperature_2m`
