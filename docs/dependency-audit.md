# Dependency audit — 2026-10-08

## Changes

- Removed unused `codemirror` and `lucide`. Editor integration imports `@codemirror/view` directly; icons use Obsidian's `setIcon`.
- Removed unused `recoil`; no replacement state library was needed.
- Updated within existing major versions: Day.js 1.11.23, react-virtuoso 4.18.16, es-toolkit 1.52.0, PapaParse 5.7.0, ESLint 10.12.0, globals 17.13.0, @types/markdown-it 14.2.0 and @types/react 18.3.31.
- Removed obsolete `@types/uuid` (UUID 11 supplies types) and the redundant direct `@typescript-eslint/parser` declaration (`typescript-eslint` supplies the parser).
- Migrated all 57 test files to Vitest 5.0.3 with jsdom 26.1.0. Removed Jest, Jest types, jest-date-mock, Babel presets, babel-jest, ts-node and their configurations.
- Replaced Jest mocks/timers with Vitest APIs, preserved UTC date expectations, and configured source and Obsidian mock aliases. Node-specific encoding tests retain their Node environment.
- Upgraded esbuild to 0.28.2, TypeScript to 6.0.3 and Node types to the tested Node 24 major. Vitest 5 requires Node 22.12 or newer on a supported major.
- Updated typescript-eslint to 8.71.1, whose supported TypeScript range ends below 6.1. TypeScript 6.0.3 is the highest stable version within that range; TypeScript 7 and compatibility aliases are not installed. Migrated legacy baseUrl/node resolution to explicit source paths and bundler resolution, and declared CSS side-effect imports for the compiler's stricter import checks.
- Refreshed compatible transitive dependencies with `npm audit fix`, without `--force`.
- Scoped a Moment override to Obsidian API packages, replacing their pinned vulnerable version with 2.31.0. This affects development dependencies; the running plugin uses the host Obsidian API.
- Removed two redundant ArrayBuffer assertions exposed by the updated compiler's inference.

React 18, Redux and CodeMirror's Obsidian-compatible version remain on their existing major versions to avoid unrelated runtime migrations.

## Security results

| npm audit | Before | After |
| --- | ---: | ---: |
| High | 40 | 0 |
| Moderate | 10 | 0 |
| Low | 2 | 0 |
| Total affected package records | 52 | 0 |
| Production dependency records (including root) | 84 | 52 |

The final `pnpm audit` reports zero vulnerabilities. Migrating to Vitest removed the Jest/Babel coverage dependency chain responsible for the remaining sprintf-js advisory.

## Verification

On the main-based branch, Vitest passed all 57 test files / 250 tests, build and lint. All tests present on main were retained. The original working branch had one additional mobile-menu test file with four tests from a separate commit; that commit and its test file were not included in this branch. Clean installation was verified by removing the project node_modules directory and running `pnpm install --frozen-lockfile`. Only esbuild dependency build scripts are allowed in pnpm-workspace.yaml.

Reproduce with Node 24, pnpm 12.10.1 and the checked-in pnpm lockfile:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run lint
pnpm run build
pnpm audit
```

Interactive Obsidian desktop/mobile smoke testing remains a manual release check. CI and release workflows use Node 24, the pinned pnpm version and frozen-lockfile installation.

pnpm migration imported the existing npm resolutions, removed package-lock.json, and moved the scoped Moment override to pnpm-workspace.yaml. Known peer warnings remain in the Obsidian lint toolchain: eslint-plugin-import, eslint-plugin-react and @microsoft/eslint-plugin-sdl declare ESLint ranges ending at 9, while eslint-plugin-obsidianmd declares Obsidian 1.8.7. The project's ESLint 10.12.0 / Obsidian API 1.13.1 combination passed lint, build and tests. These warnings are not suppressed and do not block the frozen install. GitHub-hosted CI/release execution has not been run locally.

Additional PapaParse round-trip checks passed for quotes, commas, Unicode, multiline values, empty cells, and LF/CRLF line endings using the import flow's trim/skipEmptyLines options. Virtualized table scrolling and focus still need manual verification inside Obsidian.

Build optimization enabled production minification and explicit production/development NODE_ENV values while preserving function/class names. JavaScript decreased from 2,429,803 to 816,911 bytes (~66%); CSS decreased from 24,009 to 17,610 bytes (~27%). `pnpm run build:analyze` emits optional metafile and text reports under ignored dist/. Asset postprocessing now skips failed builds; production contexts are disposed in finally instead of forcing process exit. Isolated smoke checks passed for production output, analysis reports, failed-build handling and development watch; all 250 tests also passed. These checks do not replace an Obsidian runtime smoke test of the minified bundle.

Use `pnpm run test:watch` for interactive development. CI uses `pnpm run test` for a non-watching run.

References: [Vitest migration guide](https://vitest.dev/guide/migration/), [Moment advisory](https://github.com/advisories/GHSA-4p3w-j4w9-5jqw).
