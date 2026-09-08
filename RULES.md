# Rules & submission

## Write the code yourself, by hand

**Do not use AI coding assistants for this exercise** — no Copilot, Cursor,
Claude, ChatGPT, or similar for generating, completing, or refactoring the code
you submit. Turn off inline AI completion in your editor while you work on this.

To be clear about *why*: we use AI heavily in day-to-day work and you would too
if you join us. This exercise is not a test of whether you can prompt a model —
it is the one point in the process where we get to see how **you** think: how you
structure a problem, name things, choose data structures, handle the cases the
spec does not spell out, and decide what to cut when the clock runs out. An
AI-generated solution tells us nothing about that, and it is usually easy to
spot.

Using AI or the web for **background reading** is fine — language/stdlib docs,
"how does a Bloom filter behave", the `react-query` API reference. Copying in a
solution, in whole or in part, is not.

### Follow-up

Shortlisted candidates do a short live session where we ask you to walk through
your solution and then extend it with us — a new constraint, another edge case.
Bring the ability to explain every decision and to modify any part of the code on
the spot. A solution the author cannot navigate or change live does not move
forward, regardless of how complete it looks.

## Time

Aim for **one working day, ~6–8 focused hours**. It is fine — expected, even — to
not finish. If you hit your limit, stop and write down in `DECISIONS.md` what is
done, what is not, and what you would do next. We would rather see that judgement
than padding.

## Ground rules

- Node 18+. Stay within the dependencies already in each `package.json` plus the
  Node standard library. If you genuinely need one more package, add it and
  justify it in `DECISIONS.md` (there is a clean solution here that needs
  nothing extra).
- Do not commit the generated `coupons/` files, `node_modules`, or build output.
- Keep the response envelope and error shape from `API_SPEC.md` exactly.
- The provided passing tests must stay green. You may edit them only to fix a
  genuine bug in the test itself — call that out in `DECISIONS.md`.

## How to submit

1. Work on a branch, open a pull request against `main` in the repo we shared
   with you. Do not push straight to `main`.
2. The PR description should point at `DECISIONS.md` and note anything we need to
   know to run it.
3. Reply to the email thread when the PR is up.

## Questions

If something in `API_SPEC.md` is ambiguous, make a reasonable call, write it down
in `DECISIONS.md`, and move on — we are interested in how you resolve ambiguity.
If something is genuinely broken in the skeleton, email us.
