---
name: session-summary-comment
description: 'The session-end comment on the linked task: decisions taken and why, options rejected, ticket-keyed deferrals, what shipped last. Use when writing the session summary or hand-over note for a task, and before opening a pull request or ending a session.'
---

# Session-summary comment

This repository's own rule for the comment a session leaves on its task.

1. One comment per task per session. Update it rather than posting a second.
2. Order: decisions and why, options rejected, then one `Deferred: <KEY> — <what>`
   line per deferral, then what shipped, shortest last.
3. End the comment with the line `Posted under the repository summary rule.`
4. Post it with `add_task_comment`, passing the organisation, before opening
   the pull request.
