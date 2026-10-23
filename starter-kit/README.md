# Cursor agent starter kit

Reusable Cursor agent setup distilled from a Node/Express training API. Copy what you need into another repo, then adapt names, paths, and allowlists to that project.

**Not included on purpose:** debug logs, plans, scratch notes, and anything that only makes sense for that training app (Express seed JSON, OpenAPI-specific stop nag, always-on API rule tied to `src/` / `routes/`).

## What is in this folder

| Path | Purpose |
|------|---------|
| `AGENTS.md` | Short project guide injected for agents: commands, conventions, done-when checks |
| `.cursorignore` | Keep secrets, PII-ish paths, and bulky generated trees out of agent search/context |
| `.cursor/permissions.json` | Terminal allowlist + auto-run allow/block guidance for safer everyday commands |
| `.cursor/hooks.json` | Wires `afterFileEdit` + `stop` hooks |
| `.cursor/hooks/record-edit.mjs` | Records paths edited in the current turn |
| `.cursor/hooks/verify-completion.mjs` | On stop, if files changed, forces a short completion follow-up (max 2 loops) |
| `.cursor/rules/project-conventions.mdc.example` | Template for a **scoped** project rule (prefer globs over `alwaysApply: true`) |
| `.gitignore.snippet` | Hook state files to ignore so ledgers do not get committed |

## How to copy into another repo

From the other repo’s root:

```bash
# 1. Project guide
cp /path/to/starter-kit/AGENTS.md ./AGENTS.md

# 2. Ignore patterns for the agent
cp /path/to/starter-kit/.cursorignore ./.cursorignore

# 3. Cursor config
mkdir -p .cursor/hooks .cursor/rules
cp /path/to/starter-kit/.cursor/permissions.json .cursor/
cp /path/to/starter-kit/.cursor/hooks.json .cursor/
cp /path/to/starter-kit/.cursor/hooks/*.mjs .cursor/hooks/
chmod +x .cursor/hooks/*.mjs

# 4. Optional: start a scoped rule from the example
cp /path/to/starter-kit/.cursor/rules/project-conventions.mdc.example \
  .cursor/rules/project-conventions.mdc

# 5. Ignore hook state
cat /path/to/starter-kit/.gitignore.snippet >> .gitignore
```

Or copy the whole tree and merge:

```bash
cp -R /path/to/starter-kit/.cursor /path/to/starter-kit/AGENTS.md /path/to/starter-kit/.cursorignore .
# then rename the example rule and append the gitignore snippet
```

Commit the copied files in the target repo so the whole team gets the same agent behaviour.

## How to adapt each piece

### `AGENTS.md`

Replace `<PROJECT_NAME>`, stack blurb, commands, ports, and done-when checks with that repo’s reality. Keep it short; overlapping detail belongs in a **scoped** rule, not a second always-on essay.

### `.cursorignore`

Keep the secrets / `node_modules` / build sections. Adjust the “customer data” globs (`**/customers*.json`, `uploads/`, …) to match domains you actually store. Add monorepo paths (e.g. `.next/`, `target/`) if needed.

### `.cursor/permissions.json`

- Extend `terminalAllowlist` for tools you use daily (`pnpm`, `yarn`, `docker compose`, …) — still prefer specific prefixes over bare package-manager names if those would allow publish.
- Rewrite `allow_instructions` / `block_instructions` so they name your real deploy/cloud CLIs.
- If your policy allows agents to stage/commit when asked, you may add `git add` / `git commit` to the allowlist; this kit leaves them out so commits still need an approval click.

### Hooks (`record-edit` + `verify-completion`)

These are **repo-agnostic**. They do not hard-code `src/` or OpenAPI.

- `afterFileEdit` → append relative paths to `.cursor/hooks/.edited-this-turn`
- `stop` → if that ledger is non-empty and status is `completed`, clear it and return a `followup_message` that tells the agent to re-check the request, claimed tests, and TODOs
- `loop_limit: 2` caps automatic follow-ups

Change the follow-up wording in `verify-completion.mjs` if your Definition of Done differs. Raise/lower `loop_limit` in `hooks.json` if two retries is too many or too few.

Requires Node on the machine running Cursor (scripts are ESM `.mjs`).

### Rules (`.cursor/rules/*.mdc`)

Do **not** copy an always-on rule that names another app’s folders. Use `project-conventions.mdc.example`:

1. Rename to `something.mdc`
2. Set `globs` to the files where the conventions matter
3. Set `alwaysApply: false` unless the rule must load in every chat
4. Fill in stack, errors, docs-sync, and test patterns for **this** repo

### Personal vs team

| Keep in the repo (team) | Keep in user Cursor settings / `~/.cursor` (personal) |
|-------------------------|--------------------------------------------------------|
| `AGENTS.md`, `.cursorignore`, project rules, hooks, `permissions.json` | Coding taste, autonomy, commit/PR habits that are about *you* |
| Org AI / data-handling policy that every teammate must follow | Experimental skills, personal MCP servers, one-off subagents |

## Smoke-test the hooks

```bash
echo '{"file_path":"'"$(pwd)"'/scratch-hook-test.txt"}' | node .cursor/hooks/record-edit.mjs
echo '{"status":"completed","loop_count":0}' | node .cursor/hooks/verify-completion.mjs
# Expect JSON with followup_message; ledger file should be gone
rm -f scratch-hook-test.txt
```

Then in Cursor: edit a real file, end the turn, and confirm the completion follow-up appears (Cursor reloads hooks when `hooks.json` is saved).

## Left out of this kit (and why)

| Item from the training repo / session | Why omitted |
|---------------------------------------|-------------|
| `.cursor/rules/api-conventions.mdc` | Hard-coded to that Express training API |
| `.cursor/hooks/verify-finish.mjs` | Nags only when `src/`, `routes/`, `tests/`, `openapi.yaml`, … are dirty |
| `.cursor/debug-*.log` | Transient debug noise |
| Plans / `ideas.md` | Scratch / session notes, not shared config |
| Project skills / subagents | None were added for the team in that repo |
| `~/.cursor/rules/coding-preferences.mdc` | Personal always-on preferences — copy into your own User Rules if you want them |
