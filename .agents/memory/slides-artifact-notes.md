---
name: Slides artifact gotchas
description: Non-obvious constraints when building slides-deck artifacts in this monorepo
---

# Slides artifact gotchas

- **wouter must be in the pnpm catalog before install.** The slides scaffold imports `wouter`, but a fresh `pnpm install` fails unless `wouter` has a `catalog:` entry in `pnpm-workspace.yaml`. Add it to the catalog first, then install.
  **Why:** the scaffold references `wouter` via `catalog:` and pnpm errors on an unresolved catalog key.
  **How to apply:** when a new artifact pulls in a dep not yet in the catalog, add the catalog pin before running install.

- **16:9 containment is the binding visual constraint, not the preview viewport.** The dev/screenshot preview renders at 1280x720 = exactly 16:9, the same ratio the PPTX/PDF export uses, so overflow seen in a screenshot is real overflow in the export. Slides with dense bodies (tables + 6 value bars, 5+ From/To rows) push the timeline band and footer below the fold.
  **Why:** the slide root is `h-screen overflow-hidden`; a body whose min-content exceeds the space left after header+band+footer gets clipped silently.
  **How to apply:** compress body `py`/gaps/row padding (vh units) until the footer page-number is visible at the bottom. The shared header markup must stay identical across all slides, so buy space from the body zones, not the header. Keep all text >= 1.5vw (visual_qa floor) even for eyebrows/footers/labels.
