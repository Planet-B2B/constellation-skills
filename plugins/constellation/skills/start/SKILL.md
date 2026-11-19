---
name: start
description: 'Use only when a person explicitly asks to start, get started or set up Constellation in this session: "/constellation:start", "start", "get started with Constellation", "set up Constellation", "is Constellation ready?". Checks that the Constellation connector is available, settles the organisation, looks for the team-defaults page, and ends with a short readiness report and what to try first. Reads only; never creates, edits or installs anything. For work on a task, a knowledge-base question or a session summary, use the other skills of this pack instead.'
metadata:
  pack: constellation
  version: 0.3.1
---

# Start with Constellation

A first run for a person who has just installed this pack. It reads and
reports; it never creates, edits or installs anything. When a step cannot be
done, say so in the report and carry on with the next step that still makes
sense: this skill degrades, it does not fail.

The rules for each step live in the `working-with-constellation` skill of this
pack. Load it and follow its sections as named below; do not restate or change
them here.

## 1. The connector

Check that the Constellation tools are available in this session, for example
`list_organisations`.

If they are not, stop here and tell the person:

- the Constellation connector is not connected in this session;
- to add their organisation's Constellation connector from their Constellation
  instance's connector page. The address is specific to their instance, so
  never guess or suggest one;
- to reload the session (`/reload-plugins` in Claude Code) or start a new one
  after adding it, then run `/constellation:start` again.

Do not try another way in: no REST call, no `curl`, no database.

When the person asks only for the calls you would make, without making them,
say that the connector is not connected and then write those calls out for
steps 2 to 4, in order, instead of stopping here.

## 2. The organisation

Settle the organisation exactly as `working-with-constellation` § 1 says:
`list_organisations`, then use the one the person named, else the only active
membership, else **ask** which one. Confirm it by the **Active org** line of
the workspace overview, `get_workspace_context({ organisationId: "<id>" })`.

If you have to ask, ask, and wait for the answer before step 3. If the
confirmation fails, report it and stop before any other call.

## 3. The team-defaults page

Look for the team's defaults page as `working-with-constellation` § 3 says:
the pin file's `teamDefaults` first, then a search for a page titled **Team
defaults**, passing the organisation's id on every call.

"None found" is a normal result for a new team: report it, and say that the
pack's own defaults apply until someone writes the page. Do not create one.

## 4. The readiness report

End with a short report, a few lines, no more:

- **Connector:** connected, or not, and the next step.
- **Organisation:** its name and id, and how it was confirmed.
- **Team defaults:** the page found (title and where), or "none found".
- **This pack:** in one sentence, what it does: it teaches the agent how this
  team works in Constellation, from picking the organisation to the session
  summary.

Then offer three or four concrete prompts to try next, written as the person
would type them, for example:

- "work on ENG-12" (a key from one of their projects, when you saw one);
- "what should I work on next?";
- "ask the knowledge base what we decided about <topic>";
- "write the session summary for ENG-12".
