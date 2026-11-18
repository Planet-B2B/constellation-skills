---
type: llm
weight: 2
---

The response searches the whole organisation for existing work before it
creates anything: a `search_tasks` call (or the equivalent organisation-wide
search) with a few distinctive words, ideally tried in more than one phrasing,
comes before any `create_task` call. It says it would adopt or link a matching
task rather than file a duplicate. A response whose first write is
`create_task`, with no search before it, fails.
