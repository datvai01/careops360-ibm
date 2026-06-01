---
name: transformation-deck constraints
description: Hard, canonical constraints for artifacts/transformation-deck slides — they override any generic/stale slide spec.
---

# transformation-deck canonical constraints

The deck at `artifacts/transformation-deck` has hard constraints that take precedence over any generic slide guidance or older spec (some stale specs demand a Jan–Jun timeline and dollar figures — those are WRONG for this deck).

Rules (canonical, from `.local/tasks/restructure-slide-layout.md`):
- Layout per slide is top→middle→bottom: a 60/90/180 timeline band on TOP, activities in the MIDDLE, outcomes on the BOTTOM (slide 4 is itself the month timeline; slide 6 is asks, no band).
- Contract/roadmap starts in AUGUST and runs Aug→Jan. Never Jan–Jun.
- NO dollar ($) figures anywhere in the deck. Verify with `rg '\$' artifacts/transformation-deck/src/pages/slides/`.
- CareOps / CareRadius is the worked example.
- Each slide root is `w-screen h-screen overflow-hidden relative`; all sizing in vw/vh; text floor ≥1.5vw.
- The header markup must be IDENTICAL across all six slides — including the `<h1>` `max-w-*` value (normalized to `max-w-[84vw]`). A per-slide max-w difference is treated as a constraint violation by code review.
- Static JSX, figures baked at build time, sourced only from real DB values.
- Must fit 16:9 (1920×1080) with no clipping — screenshot every slide at that viewport after layout edits.

**Why:** the auto code-review repeatedly rejects on a stale spec; cite the task file to override. Card padding added during the visual upgrade caused the densest slide (Asks/slide6) to clip its footer — tightening per-card py and grid gaps fixed it.

**How to apply:** after any edit to these slides, re-screenshot all six at [1920,1080], run `pnpm --filter @workspace/transformation-deck run typecheck` and `run validate-slides`, then re-export via `exportSlides` (code_execution) writing to `.local/outputs/`.
