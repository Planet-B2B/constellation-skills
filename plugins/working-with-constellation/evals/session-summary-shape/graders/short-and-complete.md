---
type: llm
weight: 1
---

PASS when all of these are true:

- Under **Decisions**, the comment says cursor pagination was chosen over offset
  pagination because the list can be re-sorted while a person pages through it.
- Under **Shipped**, the comment includes
  https://example.com/acme/app/pull/88.
- The comment contains no chronological account of the session and no pasted
  diff.

FAIL when any of these is true:

- The cursor-over-offset decision, or its reason, is missing or is not under
  **Decisions**.
- The pull-request link is missing or is not under **Shipped**.
- The comment contains a step-by-step story of the session or a pasted diff.
