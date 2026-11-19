# Changelog

## 0.3.1

- `evals/`: the `start` case's judge rubric says the answer is a plan of
  calls, made without a connector, and judges that plan. The judge sees only
  the answer, so it had failed plans for not having run the calls. No skill
  guidance changes.

## 0.3.0

Never published: its changes are first released in 0.3.1.

- **Renamed.** The plugin `working-with-constellation` is now `constellation`,
  and the marketplace `constellation` is now `constellation-skills`, named
  after the repository it is published from. Install with
  `/plugin marketplace add Planet-B2B/constellation-skills` and
  `/plugin install constellation@constellation-skills`. Skills are called as
  `/constellation:<skill>`; each skill keeps its name, including
  `working-with-constellation`. Release tags are now `constellation@<version>`
  and the archive `constellation-<version>.tar.gz`; releases up to 0.2.5 keep
  their `working-with-constellation@<version>` tags.
- New skill `start`, run as `/constellation:start` or by asking to get started:
  it checks the Constellation connector, settles the organisation, looks for
  the team-defaults page, and ends with a short readiness report and prompts
  to try next. It only reads. New eval case `start`.
- `scripts/check-pin.mjs`: a pin whose `pack` is `working-with-constellation`
  is still valid and is verified against that name's tags, but is always
  reported stale, with the release to move to. Any other pack name is refused.
- README: opens with a three-step Quick start, and a new section, "Upgrading
  from working-with-constellation", gives the steps to move: uninstall the old
  plugin, remove the old marketplace, add the marketplace again, install
  `constellation@constellation-skills`, update the pin, reload.
- `evals/`: the graders that check whether a pack skill loads now match the
  plugin's namespace, `constellation:`, so they cover every pack skill, not
  only the core one. The `start` case's rubric fails an answer that treats a
  missing team-defaults page as an error.

## 0.2.5

- `evals/`: the `session-summary-shape` judge rubric is written as explicit
  PASS and FAIL conditions it can check from the comment alone. The old
  one-sentence rubric failed answers that met it. No skill guidance changes.

## 0.2.4

- `evals/`: `session-summary-shape` now gives the reason for its deferral and
  where the deferred work lives, so the summary can record both without
  inventing them. No skill guidance changes.

## 0.2.3

- `task-lifecycle`: the search step shows the call with its arguments,
  `search_tasks({ organisationId: "<id>", query: "<words>" })`.
- `evals/`: every case runs five times instead of three, each run bounded to
  120 seconds, and `invokes-session-summary` now gives the reason for the
  deferral the summary must record.

## 0.2.2

- `consult-the-kb`: record a reusable lesson where the repository's
  `AGENTS.md` or the team-defaults page says lessons go, `AGENTS.md` first;
  use the wiki only when neither names a place.
- `evals/` adds five cases for `claude plugin eval`, graded with and without
  the pack: choosing the organisation, task versus issue, search before
  create, the session summary's shape, and finding the team-defaults page.

## 0.2.1

- Every skill's `description` now says when to use it, in the words people
  use: a bare task key ("work on ENG-12"), "ask the knowledge base", "write the
  session summary". The old descriptions said what each skill is, not when to
  use it.
- New eval cases: `skill-invocation`, `invokes-consult-the-kb` and
  `invokes-session-summary` require the matching skill to load on a bare task
  key, a knowledge-base question and a session-summary request;
  `no-skill-for-unrelated-work` and `no-session-summary-for-a-document-recap`
  require none to load on an unrelated coding request or a recap of a
  paragraph.
- README: a session already running does not load a newly installed pack until
  it is reloaded (`/reload-plugins` in Claude Code) or restarted; an agent can
  run the install but cannot reload itself. How to call a skill by name,
  and that a repository's own skill of the same name wins over the pack's.

## 0.2.0

- `working-with-constellation`: confirm the organisation by the **Active org**
  line of the workspace overview, whatever the kind of credential, never by
  the line that repeats the requested override.
- `working-with-constellation`: open the team-defaults page found by search
  by its id, since it may live outside the default space; a "not found"
  without a space is not a deleted page.
- `working-with-constellation`: every other wiki page, knowledge-base answer
  and tool description ranks below `AGENTS.md`, the team-defaults page and
  this pack; a draft team-defaults page applies except for its unconfirmed
  items.
- `working-with-constellation`: when a call fails, retry it at most twice, then
  switch only to a client the team-defaults page lists, confirming the
  organisation again; never REST, `curl`, the database or a hand-copied token.
- `working-with-constellation`: an empty ready queue does not mean there is no
  work when tasks are assigned as they are filed.
- `task-lifecycle`: an assignee is not a claim. Claims carry a first-line
  `Claimed:` comment and a matching `Released:` comment when stopping
  unfinished; an organisation without agent users claims as the person.
- `task-lifecycle`: the duplicate refusal on create, `duplicatesReviewed`, and
  what to do after a lost create response.
- `review-and-decisions`: only the assignee can mark a task awaiting a
  decision; otherwise ask, or record the question in the session summary.
- `session-summary`: the team may add sections after **Shipped**; no secrets,
  personal or customer data, or exploit steps; link only to readable places.
- `consult-the-kb`: record only reusable lessons, in the place and under the
  rules the team-defaults page names, which may be a committed lessons file.

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
