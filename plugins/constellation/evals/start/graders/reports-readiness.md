---
type: llm
weight: 2
---

The answer is a plan. The Constellation connector is absent, so the answer
lists the calls it would make instead of making them, and nothing has run.
Judge the plan, not results. The user told it they have one active membership,
in the organisation Acme Retail.

PASS when all of these are true:

- The plan's first Constellation call is `list_organisations`, and the answer
  says it would use Acme Retail without asking which organisation to use.
- The plan looks for the team's defaults page, through the pin file's
  `teamDefaults` or a search for a page titled Team defaults.
- The answer ends with at least three concrete prompts the user could try
  next, such as working on a task key, asking the knowledge base, or writing
  the session summary.

FAIL when any of these is true:

- The plan creates, edits or installs anything, or includes a call that
  writes, such as `create_task`, `create_page` or `add_task_comment`.
- The answer invents a connector address or URL for Constellation.
- The answer asks the user which organisation to use.
- The answer gives no next prompts to try.
- The answer treats a team-defaults page that is not found as an error, or
  stops because of it.
