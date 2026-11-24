#!/usr/bin/env bash
# Installs the skills in repository-skills/ as the agent's own skills, beside
# the pack, so the case can check which one a request loads. They stand for a
# repository's own skills: `claude plugin eval` starts each run with
# `--setting-sources user`, so a project's .claude/skills is not read, and the
# agent's user skills are the place an unnamespaced skill can come from.
#
# The agent's configuration directory is `config/` next to the run's home,
# and the runner creates both afresh for every run (measured with
# --keep-temp), so the skill reaches no other case.
# If a later CLI moves it, stop here rather than run the case without the
# repository skill, which would only measure the pack alone.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
config_dir="$(dirname "$HOME")/config"
if [[ ! -d "$config_dir" ]]; then
  echo "scaffold: no agent configuration directory at $config_dir" >&2
  exit 1
fi
mkdir -p "$config_dir/skills"
cp -R "$here/repository-skills/." "$config_dir/skills/"
