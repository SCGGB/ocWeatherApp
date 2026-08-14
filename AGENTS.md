# AGENTS.md

## Project

Bun-based CLI weather app (Spanish-language UI). Reads from stdin, prints to stdout — not an HTTP server. Data comes from OpenMeteo (free, no API key).

## Commands

- Run: `bun run index.ts` (no npm; only Bun is used)
- Typecheck: `bunx tsc --noEmit` (tsconfig sets `noEmit: true`; there is no lint or test setup)
- Compile to binary: `bun build --compile index.ts --outfile weather-cli` (produces `weather-cli.exe` on Windows; binary and `weather-cli.json` are gitignored)

## State

- App is implemented in a single file: `index.ts`. Interactive menu (opciones 1-5, 8, 9) for: weather of default city, weather of all saved cities, search/add city, delete city, set default city, toggle °C/°F, exit.
- State persists to `weather-cli.json` next to the app. Config path logic: `import.meta.dir` when running from source; compiled binaries report `B:\~BUN\root` as `import.meta.dir`, so it uses `dirname(process.execPath)` instead.

## Gotchas

- `node:readline` `question()` only works for the FIRST prompt when stdin is piped/non-TTY. Input is read via an `async function*` over `Bun.stdin.stream()` that splits on newlines and ends on EOF; EOF mid-prompt throws `InputClosed` to exit cleanly. Keep this mechanism when adding prompts.
- No comments in code.

## Conventions

- README and expected menu/UI copy are in Spanish; keep user-facing strings in Spanish.
- App flow (from README): geocoding step → forecast step. Example endpoints:
  - `https://geocoding-api.open-meteo.com/v1/search?name=...&count=1&language=es&format=json`
  - `https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=temperature_2m` (add `&temperature_unit=fahrenheit` for °F)
