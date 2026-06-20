---
name: verify
description: Run lint, typecheck, and build to verify the project is clean. Use after making changes or before declaring work done.
---

# Verify

Run the full verification pipeline for BooksWithYou:

1. **Lint** — `npm run lint`
2. **Typecheck** — `npx tsc -b` (or `npx tsc --noEmit` if tsconfig has noEmit)
3. **Build** — `npm run build`

If any step fails, report the errors clearly and suggest fixes. Do not declare work done until all three pass.
