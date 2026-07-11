# Legacy bug backlog triage

Disposition of the open `bug`-labeled issues inherited from
[decaf-dev/obsidian-dataloom](https://github.com/decaf-dev/obsidian-dataloom/issues),
based on the 2026-07-11 backlog snapshot. Issue numbers refer to the legacy
repository.

## Fixed on this branch

| Legacy issue | Root cause found in this codebase | Fix |
| --- | --- | --- |
| #941 — Contents deleted after moving a column | `ColumnReorderCommand` sorted row cells in place, mutating the previous state before the undo/redo patch was computed | Copy before sorting; regression tests keyed on column IDs |
| #952 — Reordered rows don't stick | Source rows were rebuilt from scratch (new id, appended last) on every source refresh, including open | Re-match rebuilt rows by source file path and keep saved id/index |
| #913 — Sorting reset when opening a loom | Rows rebuilt from sources were never re-sorted by the saved column sort | Run `sortRows` after every source refresh |
| #932 — Multi-tag fails with property keys containing spaces | Multi-tag deserialization rejected scalar values and non-string list items | Accept scalars as one-item lists; coerce items; tests cover keys with spaces |
| #895 — Frontmatter list type not handled | Same deserialization gaps as above, plus falsy values (`false`, `0`) dropped by a truthiness check | Only `undefined`/`null`/`""` are treated as absent |
| #935 / #942 — Frontmatter key menu exceeds screen, cannot scroll | Key list had no height bound | List bounded to `min(300px, 50vh)` with scroll |
| #892 — Unmatched multi-tag column on import crashes viewer | Splitting an empty string still yields one element, creating empty tags; unmatched numbers became `NaN` | Filter empty tag values; store unparseable numbers as `null` |
| #862 — CSV import garbled | Files always read as UTF-8 with the BOM kept in the output | BOM sniffing (UTF-8/UTF-16 LE/BE), BOM stripped, windows-1252 fallback |
| #809 — Obsidian slows after opening/closing looms | Embedded React roots were dropped from the registry without `unmount()` | Unmount on purge and on plugin unload |
| #947 / #914 — Sluggish edits / freeze after exiting a cell | Saving wrote frontmatter with one awaited file operation per cell (rows × columns) and re-set property types per row | One `processFrontMatter` call per row; property types updated once per key |
| #671 — Cannot edit an embedded table in a pop-out window | Global click/keydown listeners were only attached to the main window's document | Listeners registered on each `window-open` |
| #722 / #778 — Cell height / table styling cannot be customized | Density variables existed but were undocumented (and the x/y spacing variables were transposed) | Documented `--dataloom-cell-*` variables in the README; fixed the axis naming |

## Already fixed before this branch

- #943 — Values deleted after column type change (marked done in the backlog; see `fix: preserve values between number and tag columns`).
- #891 — Arrow-key navigation within a cell (`fix: preserve arrow navigation in cell editors`).
- #580 — Date picker does not appear (`Restore native date picker for Date cells`).

## Needs device- or environment-specific revalidation

These cannot be reproduced or verified in a desktop development environment
and need testing on the named platform against the current release before any
code change is justified:

- #710 — Cell highlighting on iOS during keyboard navigation (iOS)
- #924 — Filter menu only usable in landscape on iOS (iOS)
- #632 — Embedded video missing on mobile (mobile)
- #738 — Column reorder drags the whole loom on mobile (mobile)
- #894 — Loom preview in Canvas (Obsidian Canvas internals)
- #912 — Image embed lost after editing the original file (needs a repro vault)
- #776 — Tag colors too dark in Blue Topaz (third-party theme)

## Feature requests or needs a product decision (not defects)

- #928 — Custom frontmatter key option: the picker only lists known vault properties; free-text entry is a new feature.
- #719 — Relative date input: requires deciding whether relative dates are parsed or stored literally (overlaps legacy #588).
- #789 — Row created in a filtered view is hidden by the filter: expected filter behavior; needs a UX decision (overlaps legacy #965).
- #794 — Drag-and-drop text between cells: new interaction, not a regression.
- #716 — Obsidian hotkeys inside cells: requires defining which shortcuts DataLoom owns before changing event propagation.
- #780 — Loom links absent from the Obsidian graph: requires serializing loom content into something Obsidian's metadata cache indexes — a design change, not a bug fix.
- #524 — Transclusion support: requires defining supported embed syntax and rendering contexts.
- #906 — "Enumeration on entry": report is too vague to act on; needs a concrete expected-versus-actual repro.
