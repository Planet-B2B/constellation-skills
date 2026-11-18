---
runs: 5
timeout_seconds: 120
max_turns: 8
allowed_tools: [Skill]
---

We track our work in Constellation, in the organisation with id
`5f0c2a8e-0000-4000-8000-000000000001`. This session worked on ENG-12: we
added the CSV export in `src/invoices/export-csv.ts` (merged as
https://example.com/acme/billing/pull/41) and decided to leave archived
invoices out until ENG-15, because archived invoices are still being moved to
the new storage and a CSV read now would miss half of them. We considered
reading them from the old storage, and rejected it because that storage is
switched off next week. Write the session summary for ENG-12.

The Constellation connector is not connected in this session, so do not try to call it and do not look for it. Instead, answer with the exact calls you would make, in order, each written as `tool_name({ ...arguments })`, with one line on why. Stop where you would need an answer from me, and ask it.
