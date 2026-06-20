## Methodology
The project was built using a phased plan-based approach — breaking the full spec into four plan documents (plan-phase1.md through plan-phase4.md) covering auth, core sessions, social features, and polish. Git commits were made incrementally as each phase completed: an initial MVP commit capturing all four phases, followed by a .gitignore cleanup commit once the project stabilized.

## Evidence — Claude Code usage

### MCP
- path: .mcp.json
- what: Supabase MCP server — used to manage the Postgres database (migrations, tables, SQL queries), interact with Supabase Auth, and generate TypeScript types for the project schema. The project reference is `ogyucvkubmicmlbhlawx`.

### Skill
- path: .claude/skills/verify.md
- what: Runs the full verification pipeline for BooksWithYou — lint (npm run lint), typecheck (npx tsc -b), and build (npm run build). Used after making changes or before declaring work done to confirm the project is clean.

### Agent
- path: .claude/agents/code-quality-reviewer.md
- what: A senior code quality reviewer agent that audits recently written or modified code for correctness bugs, security vulnerabilities, and best-practice compliance. Used after feature implementations, bug fixes, or significant refactors to catch issues before moving on.
