---
runs: 5
timeout_seconds: 120
max_turns: 4
allowed_tools: [Skill]
---

Give me a three-line recap of this paragraph: "Caching cuts response times
for repeated reads, but it can serve stale data after a write unless every
write path invalidates the cache entries it touches."
