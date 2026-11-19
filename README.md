# Constellation — skill pack

## Quick start

In an interactive Claude Code session, run:

```text
/plugin marketplace add Planet-B2B/constellation-skills
/plugin install constellation@constellation-skills
/constellation:start
```

1. The first command adds this repository as a plugin marketplace named
   `constellation-skills`.
2. The second installs the `constellation` plugin from it.
3. The third runs the `start` skill: it checks that the Constellation connector
   is connected, settles your organisation, looks for your team's defaults page
   and suggests what to try first. It only reads; it changes nothing.

A session that is already running does not load a plugin installed during it:
run `/reload-plugins` (or start a new session) between the second command and
the third. To lock the whole team to one release, use the pinned install below
instead.

## What the pack holds

One versioned set of skills that teaches a coding agent how your team works
with Constellation: choosing the organisation, tasks versus issues, the task
lifecycle, the knowledge base, session summaries, review and decisions. The
same skills install in **Claude Code** and in **Codex**.

| Skill                        | What it covers                                                        |
| ---------------------------- | --------------------------------------------------------------------- |
| `start`                      | A first run: connector, organisation, team defaults, what to try      |
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
`0.3.1`; each release is a git tag named `constellation@<version>`. Releases
before 0.3.0 were tagged `working-with-constellation@<version>`, the pack's
earlier name.

### Claude Code

```bash
claude plugin marketplace add "<git url>#constellation@<version>" --scope project
claude plugin install constellation@constellation-skills --scope project
```

The `#<tag>` suffix pins the marketplace to that release: Claude Code records
it as the source's `ref` and refuses a tag that does not exist. `--scope
project` records the marketplace and the plugin in the repository's
`.claude/settings.json`, so everyone who opens the repository is offered the
same release. In an interactive Claude Code terminal session, `/plugin` does
the same through a menu; it is not available in a non-interactive run. Either
way, a session that is already running does not load the pack until you reload
it: see [Install during a session](#install-during-a-session).

### Codex

```bash
codex plugin marketplace add <source> --ref constellation@<version>
codex plugin add constellation@constellation-skills
```

`--ref` applies to a git source. A local path is read as it is, so check out
the release tag there first. Codex keeps marketplaces in your own Codex
configuration, not in the repository, which is why the repository also commits
a pin file.

**Codex installs the pack once per machine**, for your user, and every
repository you open with Codex on that machine gets that one version. Each
teammate runs the two commands above on their own machine, and repeats them on
every upgrade.

### Where the plugin is installed

`check-pin.mjs --installed` needs the directory of the installed copy:

- **Claude Code**: `~/.claude/plugins/cache/constellation-skills/constellation/<version>/`.
  `claude plugin list --json` prints the exact `installPath`.
- **Codex**: `~/.codex/plugins/cache/constellation-skills/constellation/<version>/`,
  under `$CODEX_HOME` instead of `~/.codex` when that is set.
  `codex plugin add` prints it as the installed plugin root.

### Check that the pack is loaded

```bash
claude plugin list | grep -A3 'constellation@constellation-skills'
codex plugin list | grep 'constellation@constellation-skills'
```

The output must show the version you pinned, and the plugin as enabled: an
installed plugin that is disabled is not loaded. This list is the check. Do not
rely on asking an agent which version it has loaded, since it can read a
version from this README or from the pin without having the pack.

### Install during a session

A session loads its plugins when it starts. Installing the pack while a session
is running, by hand or by asking the agent to run the commands above, writes
the settings but leaves that session without the pack:

- **Claude Code**: run `/reload-plugins` in the session, or start a new
  session. Claude Code prints the same advice after an install.
- **Codex**: start a new session.

An agent cannot do this step for you. It can run the install commands in a
shell, but it cannot run a slash command, reload its own plugins or open a new
session. Asked to "install the skill pack", it should run the commands and then
tell you to reload or start a new session. Until then, none of the pack's
skills can fire, and the pack cannot explain why, because it is not loaded yet.

### Use the skills

You do not have to name a skill. Ask for the work in your own words, such as
"work on ENG-12", "ask the knowledge base what we decided about caching" or
"write the session summary for ENG-12", and the agent picks the matching skill
from its description. Before the first Constellation call of a session it
should load `working-with-constellation`. Ask to "get started" or run
`/constellation:start` for a first run.

To call a skill by name in Claude Code, use the plugin's namespace:
`/constellation:task-lifecycle`, or ask "use the task-lifecycle
skill". If no skill loads, check first that the pack is loaded (above), then
that the session was started or reloaded after the install.

A skill of the repository's own with the same name wins over the pack's: in a
repository that keeps its own `consult-the-kb`, "ask the knowledge base" and
even "use the consult-the-kb skill" load the repository's. A repository skill
that only covers the same request may be picked instead of the pack's. In
either case, call the pack's by its namespaced name, as above.

### Keep `AGENTS.md` working without the pack

An agent that opens the repository without the pack installed still reads
`AGENTS.md`. Write it so it holds on its own: state there the rules the
repository depends on, or say plainly that the pack is required and how to
install it. Do not rely on pointers to skills an agent may not have.

### Pin the version in the repository

Commit `.constellation/skill-pack.json` so a readiness check, and every
teammate, can see which release the repository expects:

```json
{
  "pack": "constellation",
  "version": "0.3.1",
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
2. Claude Code: re-add the marketplace with the new `#<tag>` and
   `--scope project`, then run
   `claude plugin update constellation@constellation-skills --scope project`.
3. Codex: remove the marketplace and add it again with the new `--ref` (Codex
   refuses to re-add a marketplace from a different ref), then add the plugin
   again: `codex plugin marketplace remove constellation-skills`,
   `codex plugin marketplace add <source> --ref constellation@<version>`,
   `codex plugin add constellation@constellation-skills`.

The pin's version bump is the whole decision; steps 2 and 3 bring each
machine in line with it, and the pin check below flags any that has not.

## Upgrading from working-with-constellation

Before 0.3.0 the plugin was named `working-with-constellation` and the
marketplace `constellation`. Both were renamed: the plugin is now
`constellation` and the marketplace `constellation-skills`, so skills are
called as `/constellation:<skill>`. The skills themselves keep their names.
To move:

1. Uninstall the old plugin and remove the old marketplace. In a Claude Code
   session: `/plugin uninstall working-with-constellation@constellation`, then
   `/plugin marketplace remove constellation`. In a shell:
   `claude plugin uninstall working-with-constellation@constellation`, then
   `claude plugin marketplace remove constellation` (add `--scope project` to
   both if you installed it that way).
2. Add the marketplace again:
   `/plugin marketplace add Planet-B2B/constellation-skills`, or for a pinned
   install `claude plugin marketplace add "<git url>#constellation@<version>" --scope project`.
3. Install the plugin: `/plugin install constellation@constellation-skills`,
   or `claude plugin install constellation@constellation-skills --scope project`.
4. Update `.constellation/skill-pack.json`: set `"pack"` to `"constellation"`,
   `version` to the release (`0.3.1` or later), and `commit` and `treeDigest`
   to that release's. Commit it.
5. Reload: `/reload-plugins` in Claude Code, or start a new session.

Codex: `codex plugin remove working-with-constellation@constellation`, then
`codex plugin marketplace remove constellation`, then
`codex plugin marketplace add <source> --ref constellation@<version>` and
`codex plugin add constellation@constellation-skills`, then start a new
session.

A pin that still names `working-with-constellation` keeps working with
`check-pin.mjs`: it is verified against the earlier name's tags and reported as
stale until you move it.

## Check the pin

```bash
node <plugin dir>/scripts/check-pin.mjs --repo . --source <source>
node <plugin dir>/scripts/check-pin.mjs --repo . --source <source> --installed <installed plugin dir>
node <plugin dir>/scripts/check-pin.mjs --repo . --latest 0.3.1
```

With `--source`, the latest release is the highest `constellation@<semver>`
tag the source carries, and a pinned `commit` must be the commit of the pinned
version's tag. A pin under the earlier name, `working-with-constellation`, is
checked against that name's tags and always reported stale. `--latest` names the
latest version by hand, and `--marketplace` reads it from a checkout of the
newest release.

Each check prints `pass`, `fail` or `unknown` with its evidence. The exit code
is 0 when all pass, 1 when any fails, and 2 when none fails but one is unknown.
A pin older than the latest release is a `fail`.

## Verify a release

Each release also ships as `constellation-<version>.tar.gz` with a
`.sha256` file and a `manifest.json` that lists every file's SHA-256 and the
pack's `treeDigest`. To check a copy you have:

```bash
node scripts/tree-digest.mjs <plugin dir> --exclude manifest.json
```

The printed digest must equal the release's `treeDigest`.
