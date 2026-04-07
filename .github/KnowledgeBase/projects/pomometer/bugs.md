# Bug fixes (Pomometer)

*(Pomometer-specific incidents and fixes.)*

---

## Bug: Sub-task completion reverts (duplicate sync ops) [2025-08-24]

- **Project:** Pomometer
- **Symptom:** After marking a sub-task complete, the checkmark appears then disappears; state reverts to incomplete.
- **Repro:**
  1. User completes sub-task; Redux sets `completed = true`.
  2. Sync request goes to the server.
  3. Client applies server-returned ops and overwrites state with `undefined` for some fields.
- **Cause:** The client did not filter echo of its own ops. The server echoed the same op; field mapping mismatches (e.g. `checked` vs `undefined`) overwrote Redux incorrectly.
- **Fix:** In `/api/todos/sync/route.ts`, dedupe by tracking `clientOperationIds` (from `type` + `payload`) and ignore self-echoed ops.
- **Lesson:** In bidirectional sync, echo is common — filter at receive time; keep client/server field names aligned (`checked` vs `completed`).

---

## Bug: Server Google API calls missing token [2025-08-20]

- **Project:** Pomometer
- **Symptom:** Crash in Next.js API route when creating Google Tasks during sync: `Error: No Google access token available`.
- **Repro:** Route calls `TodoService.addSubTodo()` → `getOrCreatePomometerTaskList()` → `getGoogleAccessToken()` from the frontend helper.
- **Cause:** `getGoogleAccessToken()` reads `localStorage`, which does not exist on the server.
- **Fix:** `getOrCreatePomometerTaskList(token?: string)` accepts an optional token. Server paths call `getUserGoogleToken(userId)` and pass it in; browser paths still use `localStorage` when no arg is passed.
- **Lesson:** Never rely on browser-only globals inside shared code that may run on the server — inject dependencies explicitly.

---

## Bug: Invalid CSS pseudo-class (`flex-row is not recognized`) [date unknown]

- **Project:** Pomometer
- **Symptom:** Build/parsing error: `flex-row is not recognized as a valid pseudo-class`.
- **Repro:** Using `lg\\:flex-row` as a selector fragment.
- **Cause:** Tailwind class names were used where CSS expects pseudo-classes/selectors.
- **Fix:** Use semantic classes (`.TodoContainer`, `.ClockContainer`, etc.) instead of Tailwind strings in raw CSS selectors.
- **Lesson:** Avoid Tailwind-as-selector; use semantic hooks in CSS.

---

## Bug: Unknown `@apply` at-rule [date unknown]

- **Project:** Pomometer
- **Symptom:** `Unknown at rule @apply` during CSS compile.
- **Repro:** `.App { @apply h-full; }` in a file processed without Tailwind/PostCSS.
- **Cause:** Some pipelines do not run PostCSS/Tailwind on that file.
- **Fix:** Replace `@apply` with plain CSS (e.g. `height: 100vh` / `min-height: 100%` as appropriate).
- **Lesson:** Use `@apply` only where Tailwind is guaranteed; plain properties are the safest default.

---

## Bug: Mobile page scroll / layout broken [date unknown]

- **Project:** Pomometer
- **Symptom:** Page does not scroll on mobile; height feels clipped; poor touch UX.
- **Repro:** Open on a phone; try to scroll or tap controls.
- **Cause:** Global `overflow: hidden` and fixed heights; touch targets too small.
- **Fix:** Media queries to relax `overflow` and height on small screens; touch targets at least ~44px.
- **Lesson:** Mobile-first — do not let desktop-only layout constraints break phones; test both after CSS changes.

---

## Bug: Full sync overwrote fresh local state [date unknown]

- **Project:** Pomometer
- **Symptom:** After a local update, state snapped back to an older value.
- **Repro:** 1) Complete task. 2) Full sync `POST /api/todos/google-sync`. 3) Delayed Google API returns stale data and overwrites local state.
- **Cause:** Light sync had protection; `syncGoogleTasks()` did not and blindly applied Google data.
- **Fix:** Same ~10s protection as light sync (`recentlyUpdatedTasks` / equivalent); skip remote updates for tasks/sub-tasks in the window.
- **Lesson:** All sync entry points (light, full, etc.) need the same conflict/debounce story for third-party latency.

---

## Bug: Duplicate “AA Pomometer” lists (race) [2026-04-06]

- **Project:** Pomometer
- **Symptom:** Two identical “AA Pomometer” lists after login.
- **Repro:** Concurrent `initializeGoogleTasks` and other calls (e.g. `addSubTodo`); both queries miss the list; both create. API latency hides the first create from the second read.
- **Cause:** No concurrency guard or cache.
- **Fix:** Persist `googlePomometerListId` in DB; in-memory `pomometerListCache` in `googleTasks.ts`. Resolve order: DB → memory → Google API.
- **Lesson:** Critical external resources need locking or layered cache (memory + persistence) to prevent duplicate creates and extra API calls.

---

## Bug: Sub-tasks created as top-level tasks in Google Tasks [date unknown]

- **Project:** Pomometer
- **Symptom:** Sub-tasks appear as top-level tasks; parent/child lost.
- **Repro:** In `addSubTodo`, `parent: parent.googleTaskId` was sent in the JSON body.
- **Cause:** Google Tasks requires `parent` as a **query** parameter for child creation, not in the body.
- **Fix:** Move `parent` from body to `?parent=${parent.googleTaskId}` on the URL.
- **Lesson:** Follow the docs for path, query, body, and headers — do not put everything in the JSON body by habit.
