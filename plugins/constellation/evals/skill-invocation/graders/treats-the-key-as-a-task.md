---
type: llm
weight: 1
---

The user named only a task key, without saying where the task lives. The
response treats ENG-12 as a task tracked in Constellation: it settles the
organisation first (lists the organisations, or asks which one) and reads the
task before it plans or changes anything. A response that guesses what ENG-12
means, starts editing code, or asks the user to paste the task fails.
