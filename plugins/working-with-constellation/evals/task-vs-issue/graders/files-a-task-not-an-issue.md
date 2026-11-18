---
type: llm
weight: 2
---

Before any code change, the response plans to search for existing work and
then, if nothing matches, to file the defect as a task with acceptance criteria
(for example "the export includes archived rows"). It does not file an issue as
a step towards fixing it, and it does not start changing code with no task.
A response that creates an issue (`create_issue`) for this fix fails.
