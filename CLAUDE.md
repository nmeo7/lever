# CLAUDE.md

Build simple, predictable systems. **correctness > clarity > performance**

---

## New Projects

- Design for no-code configurability from day one: Use dynamic values, not hardcoded constants scattered inline in code. Prefer config files for feature defaults and structure (what exists, feature switches, tuneable parameters); DB stores runtime overrides that take precedence. Config is the seed — the app boots with structure already in place, no migration hassles.
- Backend: Express with an ORM, or Firebase (auth is always custom, not Firebase Auth). Use TanStack Query (`useQuery`, `useMutation`) only with Express backends.
- Frontend: React + Tailwind always.

---

## Code Style

- Prefer arrow functions.
- Use `async`/`await`. Avoid `.then()` chains.
- Use optional chaining (`?.`) and nullish coalescing (`??`) over verbose null checks.
- Use destructuring for objects and arrays wherever it improves readability.
- Prefer template literals over string concatenation.
- Prefer `Array` methods (`map`, `filter`, `find`, `some`, `every`) over `for` loops.
- `const` over `let`. Never `var`.
- Spread over `Object.assign` and manual array construction — `{ ...a, ...b }`, `[...xs, x]`.
- Ternaries for simple conditionals; never nest beyond one level deep.
- No comments unless the _why_ is non-obvious. Comments are a necessary evil.
- Small, single-purpose functions. If you need "and" to describe it, split it.
- Prefer early returns. Avoid deep nesting.
- No magic numbers or strings inline — named constants.
- No hidden side effects. No swallowed errors — propagate or rethrow.

---

## React

- Functional components only — no class components.
- No inline styles — Tailwind utility classes exclusively.
- Prefer TanStack Query (`useQuery`, `useMutation`) over direct queries for async server state.

---

## Structure

- Organize by feature, not type. Each feature owns its model, service, router, and types.
- No direct feature-to-feature imports. Share via `shared/` or a feature's `index` barrel.
- Wrap every external dependency at the edge. Swapping providers touches one file.
- Prefer dependency injection — pass deps in as arguments rather than importing them inside functions. Makes swapping and testing painless.
- Operations should be safe to repeat — running them twice gives the same result as once.

---

## Responsibilities

- `router` / `api.js` → HTTP translation only
- `service.js` → business logic and workflow rules
- `utils.js` → pure helpers
- `middleware` → access control only (who can act, not what is valid)

No mixing.

---

## Naming

- Files: kebab-case. Classes: PascalCase. Functions/variables: camelCase. DB columns: snake_case.
- Functions are verb + noun: `retrieveUser`, `submitOrder`.
- Name variables after what they represent. No single-letter names outside loop counters.

---

## Reuse

- Duplicate first. Extract after real reuse.
- If you start an abstraction, commit to it or delete it. Half-used layers are worse than none.
- If the same check or setup line appears at the top of every handler in a router (auth, scoping, validation), it's not incidental duplication — extract it as middleware (`router.use(...)` or per-route middleware) instead of repeating the call in each handler. Keep it inline only when a single call site does it, or when each usage genuinely differs.

---

## Errors

- Add context. Fail fast — especially on missing config at startup.

---

## Done means

- Easy to find and follow.
- No dead, commented-out, or confusing code.
- Break these rules when you have a good reason — but know _why_, and make it obvious.
