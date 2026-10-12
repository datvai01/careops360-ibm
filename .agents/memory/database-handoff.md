---
name: Database handoff constraints
description: DDL packaging and source-control boundaries requested by the user.
---
Keep downloadable DDL handoffs separate from Office deliverables; do not track PowerPoint or Word files in Git.

**Why:** The user requested clear downloadable DDLs and removal of PowerPoint/Word files from Git.

**How to apply:** Preserve local deliverables when untracking them; do not rewrite Git history without explicit authorization. Validate fresh-schema restores on a disposable database and distinguish fresh installs from additive upgrades.
