# Decisions

Copy this to `DECISIONS.md` and fill it in. Short and specific beats long.

## Promo-code engine

- **Approach:** <what data structure / index, and why>
- **Memory:** <measured steady-state RSS with default-size files, and how you measured>
- **Latency:** <measured p95 for isValid(), warm>
- **Warm-up:** <lazy? prebuilt index on disk? how long?>
- **False positives / correctness:** <if you use a probabilistic structure, what's the FPR and how do you handle a false "valid">
- **Scaling to 50 files instead of 3:** <what changes>

## API

- Ambiguities in `API_SPEC.md` I resolved, and how.
- How I represented a repeated `productId` in the response.
- Anything that deviates from the spec, and why.

## Frontend

- State split: what's in react-query vs zustand vs local.
- How coupon feedback works given there's no check endpoint.

## Scope

- What I deliberately did **not** do, and what I'd do next.
- Roughly where the time went.

## Anything else

- Extra dependency I added (if any) and why.
- Bugs I found in the skeleton / provided tests.
