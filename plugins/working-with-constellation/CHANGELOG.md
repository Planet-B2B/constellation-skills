# Changelog

## 0.1.2

- `scripts/check-pin.mjs` reads a tag name with an explicit end index (no
  behaviour change).
- The README's Codex upgrade step removes the marketplace before adding it
  again with the new `--ref`, as Codex requires.

## 0.1.1

- `scripts/check-pin.mjs --source <source>` reads the latest release from the
  source's release tags, fails a pin whose version is not a release there, and
  fails a pinned commit that is not that release's tag.

## 0.1.0

- First release: `working-with-constellation`, `task-lifecycle`,
  `consult-the-kb`, `session-summary` and `review-and-decisions`.
- `scripts/check-pin.mjs` reports whether a repository's pin is present, well
  formed and current.
- `scripts/tree-digest.mjs` computes the pack's tree digest.
