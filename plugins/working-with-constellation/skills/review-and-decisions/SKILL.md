---
name: review-and-decisions
description: Who decides what on a Constellation team, and how an agent prepares work for a human to approve. Plan before non-trivial work, answer every review comment, never treat green checks as approval, and mark a task awaiting a decision instead of guessing.
metadata:
  pack: working-with-constellation
  version: 0.1.2
---

# Review and decisions

**Agents prepare; humans decide.** Your team-defaults page names who decides
what. Where it is silent, use the defaults below.

| Decision                                 | Default owner                          |
| ---------------------------------------- | -------------------------------------- |
| What the team works on next              | The project lead                       |
| A task's scope and acceptance criteria   | The task owner or project lead         |
| Task or issue; promoting an issue        | A human triager                        |
| Approving a deliverable (merge, publish) | A human reviewer                       |
| Production, releases, data fixes         | The named release owner                |
| Architecture and conventions             | The named owners, in a decision record |
| An open product question                 | The decider named for the project      |

## Before the work

- **Plan non-trivial work in writing first**: anything touching three or more
  files, adding behaviour, or adding a permission or a public surface. A short
  plan with acceptance criteria is enough. Link it on the task.
- **Before starting a batch of tasks, check each one**: some will already be
  done, superseded, duplicated or blocked.
- When a recommendation is needed, give one, with its reasons, and end with
  **one** question the human can answer yes or no.

## When a human must decide

Do not guess on a product question. Mark the task as awaiting a decision
(`mark_awaiting_decision`), say what is being decided and who should decide,
and carry on with any work the answer does not block.

## Review

- **Answer every review comment.** Fix it, or say why not, then resolve it.
- **Collect a round's feedback and address it together**, then resubmit once.
  Fix wording last, since every resubmission can trigger another review.
- **Review for what is missing, not only for what changed.** Check each
  acceptance criterion is actually covered.

## Approval

- **Passing checks are not approval.** Show the evidence (checks, open review
  threads, reviewers' verdicts, the summary) and wait for an explicit yes.
- **An approval covers what was approved.** If the deliverable changes after
  the yes, ask again.
- **Production changes are rehearsed first** and signed off by a human who read
  the dry run.

## Language

Write everything others will read, such as tasks, comments, pages and pull
requests, in the team's working language, which the team-defaults page names.
Talk to the user in whatever language they use with you.

Report only what has happened. Never announce work you have not started.
