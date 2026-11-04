---
name: consult-the-kb
description: Ask the Constellation knowledge base what your team has already decided before non-trivial work, read the pages it cites, and cite them back. Also how to record a lesson after a correction, and what an empty answer means.
metadata:
  pack: working-with-constellation
  version: 0.1.1
---

# Consult the knowledge base

The knowledge base is the part of the wiki where your team keeps what it has
decided and learned. Ask it **before** non-trivial work: a new feature, a
change in behaviour, anything touching several files. Then cite what you used.

## The one call

```
query_knowledge_base({ organisationId: "<id>", question: "How do we version our public API?" })
```

One call returns the topic map, ranked against your question, and the best
matching curated pages, each with its slug and the `spaceSlug` it lives in.

1. Read the map to find the relevant topics.
2. To read a page in full, use
   `get_page({ page: "<slug>", spaceSlug: "<the returned spaceSlug>", organisationId: "<id>" })`.
   **Pass the `spaceSlug`.** Without it the slug is looked up in the default
   space and opens the wrong page, or none.
3. **Cite the slugs you relied on** in your pull request, commit or hand-over,
   so the next reader can trace why.

The ranking matches words, not meaning, so phrase the question in the terms of
your task. When the map says topics were left out, ask again in their terms or
search the wiki.

## What an answer means

- **Results are scoped to you.** You only see pages you are allowed to see.
- **"No knowledge-base content found" means the space you queried returned
  nothing**: it may be empty, or the organisation may not have a knowledge base
  yet. Both are normal for a new team. Carry on, and say what you asked.
- **A configuration or connection error is a problem to report**, not a reason
  to skip the step.
- A page that does not answer your question is not evidence that nothing was
  decided. Say what you looked for.

## Write back what you learn

- **After a correction**, from a reviewer or from the user, record the lesson
  so the next session does not repeat the mistake. Your team-defaults page says
  where lessons go.
- **After writing any page, read it back.** A successful response does not
  prove the body landed as you wrote it.
- Decisions and conventions belong in the wiki, where every person and agent
  can find them. Notes in a local file help only you.
