---
marp: true
paginate: true
transition: fade
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?
<!-- 20s -->

**Readers who feel alone in their books.**

They finish a great chapter and have nobody to turn to — no one to say "can you believe that twist?" Reading has become a solo sport, and they miss the energy of a book club without the scheduling nightmares.

---

<!-- slide 2 -->
# Their problem
<!-- 20s -->

Reading is solitary. Book clubs are rigid.

- **No shared accountability** — nobody knows if you quit on page 30
- **Discussion happens nowhere** — group chats get buried, forums are impersonal
- **Progress is invisible** — you don't know where friends are in the same book
- **Starting a group is friction** — scheduling, platforms, invites, and logistics kill momentum *before* page one

---

<!-- slide 3 -->
# What I built
<!-- 20s -->

**BooksWithYou** — a social reading tracker that turns any book into a shared experience.

- Create a **reading session** for any book with a custom chapter list
- Members **join** and log their chapter progress — see everyone's progress bars
- A flat **discussion thread** lives inside each session, with emoji reactions
- **Public** sessions for discovery, **private** sessions for tight groups
- Real-time updates via Supabase Realtime

---

<!-- slide 4 -->
# How I built it
<!-- 20s -->

- **MCP** (`.mcp.json`) — Supabase MCP: applied migrations, managed RLS policies, queried Postgres, provisioned Storage buckets, and generated TypeScript types — all without leaving the editor
- **Skill** (`.claude/skills/verify.md`) — Custom `verify` skill: runs `lint → typecheck → build` as a single command, gatekeeping every phase before declaring work done
- **Agent** (`.claude/agents/code-quality-reviewer.md`) — Custom senior reviewer agent: 15-year full-stack lens, audits security (XSS, RLS gaps, auth bypass), correctness (race conditions, stale closures), and best practices across all changes

---

<!-- slide 5 -->
# Why it matters
<!-- 20s -->

**Connection makes reading stick.** BooksWithYou bridges the gap between solitary reading and the community readers crave — without the overhead of a traditional book club.

For the 60% of readers who say they'd read more if they had someone to discuss with, this is the lowest-friction way to turn reading into a social habit. No calendar invites. No dead group chats. Just books, progress, and conversation.

---

<!-- slide 6 -->
# Done checklist
<!-- 20s -->

- [x] **Repo public** — github.com/myintmyataung/bookswithyou
- [x] **MCP** — Supabase MCP for database, auth, storage, migrations
- [x] **Skill** — `code-review`, `verify`, `init` used across every phase
- [x] **Agent** — Plan agent for architecture, Explore agent for codebase sweeps
- [x] **report.md** — in team repo with full phase breakdown and Supabase setup

**Tech stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · TanStack Query · Supabase (Auth, Postgres, Realtime, Storage)
