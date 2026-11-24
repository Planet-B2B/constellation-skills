---
name: review-and-decisions
description: 'Who decides what on a Constellation team, and how an agent prepares work for a human to approve. Use when planning non-trivial work, answering review comments, asking for approval or a merge, or when a question needs a human decision ("which option should we take?"). Answer every review comment, never treat green checks as approval, and mark a task awaiting a decision instead of guessing. If the repository has its own skill for review, approval or pull requests, use that skill instead; use this one only when it is called by name, constellation:review-and-decisions.'
metadata:
  pack: constellation
  version: 0.3.3
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

Do not guess on a product question. Say what is being decided and who should
decide, and carry on with any work the answer does not block.

- **If you are the task's assignee** and it is in progress, mark it as
  awaiting a decision (`mark_awaiting_decision`). Only the assignee can.
- **If someone else is the assignee**, do not reassign the task just to raise
  the question. Ask the user first; otherwise put the question under **Open
  questions** in the session summary, naming who decides.

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
