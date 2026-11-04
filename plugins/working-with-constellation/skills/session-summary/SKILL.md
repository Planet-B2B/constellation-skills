---
name: session-summary
description: The one comment a session leaves on its Constellation task. Decisions and why, what was rejected, deferrals each with a task key, open questions, and what shipped, shortest last. Post it before the first review-triggering action.
metadata:
  pack: working-with-constellation
  version: 0.1.0
---

# Session summary

When a session ends, everything it decided goes with it, unless it is written
down where the next session will look. That place is one comment on the task.

## When

**Bring the comment up to date, then do the thing that triggers review**:
asking for a review, opening a pull request, pushing to it, or handing the work
to someone else. A summary written only at the very end arrives after the first
reviewer has already read the thread.

Never wait for the task to close. Automation may close it first.

**One comment per task per session.** Keep the id you get back when you post
it, and update that same comment as the session goes on. If you lose the id,
find your summary in the thread by its heading.

## The template

Keep the order and the headings exactly.

```markdown
## Session summary — <TASK-KEY>

**Decisions**

- <what was decided> — <why>. Rejected: <option> (<why not>).

**Deferred**

- Deferred: `<surface>` — <what and why, one sentence> → <TASK-KEY>

**Open questions**

- <question> — <who decides>

**Shipped**

- <link> — <one line: what landed>
```

- **Decisions**, **Deferred** and **Shipped** are required. An empty required
  section is written `- (none)`, never left out, so a reader can tell "nothing
  deferred" from "forgot the section".
- **Open questions** is optional. Leave the heading out when there are none.

### Decisions

One bullet per decision, with its reason. When a real alternative was weighed,
name it and say why it lost: that is what stops the next session reopening a
settled question. Record choices that constrain future work, not routine steps.

### Deferred

Every deferral is one line, never wrapped:

```
- Deferred: `<surface>` — <what and why> → <TASK-KEY>
```

- `<surface>` is the file, folder, page or area it applies to, with no spaces.
- The `→` arrow binds the deferral to its task key. Use `→`, not `->`.
- **No task key, no deferral.** File the follow-up task first, then write the
  line. The key must be a task, not an issue.
- Do not use the word `Deferred:` anywhere else in the comment.

### Shipped

Usually two lines: the link to what landed, and the few files or pages a reader
needs to find their way in. Do not restate the change.

## Keep it short

Aim for under 40 lines and about 2,000 characters. Comments have a hard size
limit, and every later reader pays for each line. **If it does not fit, you are
writing a transcript.** Put long material on a wiki page and link it.

Signs you are writing a transcript:

- a step-by-step story of the session;
- pasted diffs, file lists or command output;
- the task description repeated back;
- follow-ups mentioned with no task key.

## The description is not the summary

The task description holds the agreed contract: scope, acceptance criteria,
links. The summary holds what happened. Record in-flight changes as comments,
not as description edits. Filling in the `## Links` section is fine.

## Posting it

```
add_task_comment({ organisationId: "<id>", projectId: "<PROJECT>", taskId: "<TASK-KEY>", body: "<summary>" })
update_task_comment({ organisationId: "<id>", projectId: "<PROJECT>", taskId: "<TASK-KEY>", commentId: "<id>", body: "<summary>" })
```

Always pass the organisation. On the CLI, write the body to a file first:
multi-line text does not survive being typed as a shell argument.
