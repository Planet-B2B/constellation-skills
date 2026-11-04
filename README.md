# Working with Constellation — skill pack

One versioned set of skills that teaches a coding agent how your team works
with Constellation: choosing the organisation, tasks versus issues, the task
lifecycle, the knowledge base, session summaries, review and decisions. The
same skills install in **Claude Code** and in **Codex**.

| Skill                        | What it covers                                                        |
| ---------------------------- | --------------------------------------------------------------------- |
| `working-with-constellation` | Start here: organisation, orientation, team-defaults page, tool rules |
| `task-lifecycle`             | Search before create, tasks vs issues, claiming, links, follow-ups    |
| `consult-the-kb`             | Ask the knowledge base first, cite it, record lessons                 |
| `session-summary`            | The one comment a session leaves on its task                          |
| `review-and-decisions`       | Who decides, planning, review, approval                               |

The pack holds the defaults that are true for every team. Your own conventions
go on your organisation's **Team defaults** wiki page, which the skills read at
the start of each session and which wins where the two differ.

## Before you start

The skills drive the Constellation MCP connector. Add the connector from your
Constellation instance's connector page first; the address is specific to your
instance.

## Install

`<source>` is where your organisation gets the pack: a git URL, `owner/repo`,
or a local path to a checkout. `<version>` is the release you want, for example
`0.1.0`; each release is a git tag named `working-with-constellation@<version>`.

### Claude Code

```bash
claude plugin marketplace add "<git url>#working-with-constellation@<version>" --scope project
claude plugin install working-with-constellation@constellation --scope project
```

The `#<tag>` suffix pins the marketplace to that release: Claude Code records
it as the source's `ref` and refuses a tag that does not exist. `--scope
project` records the marketplace and the plugin in the repository's
`.claude/settings.json`, so everyone who opens the repository is offered the
same release. Inside a session, `/plugin` does the same interactively.

### Codex

```bash
codex plugin marketplace add <source> --ref working-with-constellation@<version>
codex plugin add working-with-constellation@constellation
```

`--ref` applies to a git source. A local path is read as it is, so check out
the release tag there first. Codex keeps marketplaces in your own Codex
configuration, not in the repository, which is why the repository also commits
a pin file.

### Pin the version in the repository

Commit `.constellation/skill-pack.json` so a readiness check, and every
teammate, can see which release the repository expects:

```json
{
  "pack": "working-with-constellation",
  "version": "0.1.0",
  "commit": "<the release tag's 40-character commit>",
  "treeDigest": "<the release's treeDigest>",
  "teamDefaults": { "spaceSlug": "<space>", "page": "team-defaults" }
}
```

Record at least one of `commit` and `treeDigest`: a version alone names a tag,
and a tag can move. `teamDefaults` is optional; it names your team-defaults
page when that is not the one titled **Team defaults** in your default wiki
space.

## Upgrade

1. Change `version` (and `commit`, `treeDigest`) in
   `.constellation/skill-pack.json`, and commit it.
2. Claude Code: re-add the marketplace with the new `#<tag>` (`--scope
project`), then run
   `claude plugin update working-with-constellation@constellation --scope project`.
3. Codex: re-add the marketplace with the new `--ref` (for a git source; for a
   local path, check out the new tag), then run
   `codex plugin add working-with-constellation@constellation` again.

The pin's version bump is the whole decision; steps 2 and 3 bring each
machine in line with it, and the pin check below flags any that has not.

## Check the pin

```bash
node <plugin dir>/scripts/check-pin.mjs --repo . --source <source>
node <plugin dir>/scripts/check-pin.mjs --repo . --source <source> --installed <installed plugin dir>
node <plugin dir>/scripts/check-pin.mjs --repo . --latest 0.2.0
```

With `--source`, the latest release is the highest
`working-with-constellation@<semver>` tag the source carries, and a pinned
`commit` must be the commit of the pinned version's tag. `--latest` names the
latest version by hand, and `--marketplace` reads it from a checkout of the
newest release.

Each check prints `pass`, `fail` or `unknown` with its evidence. The exit code
is 0 when all pass, 1 when any fails, and 2 when none fails but one is unknown.
A pin older than the latest release is a `fail`.

## Verify a release

Each release also ships as `working-with-constellation-<version>.tar.gz` with a
`.sha256` file and a `manifest.json` that lists every file's SHA-256 and the
pack's `treeDigest`. To check a copy you have:

```bash
node scripts/tree-digest.mjs <plugin dir> --exclude manifest.json
```

The printed digest must equal the release's `treeDigest`.
