---
runs: 5
timeout_seconds: 120
max_turns: 8
allowed_tools: [Skill]
---

We track our work in Constellation. I am wrapping up a session on task ENG-12,
"Paginate the supplier list". Here is what happened:

- We chose cursor pagination over offset pagination, because the list is
  re-sorted while people page through it.
- We decided not to add a page-size selector for now, because the design team
  has not settled the allowed sizes yet; the follow-up is filed as ENG-31. The
  selector would live in the supplier list page, `src/suppliers/list-page.tsx`.
- Pull request https://example.com/acme/app/pull/88 adds the cursor to the
  supplier list endpoint and the list page.

Write the session summary comment I should leave on ENG-12. Reply with the
comment body only, in Markdown, ready to post.
