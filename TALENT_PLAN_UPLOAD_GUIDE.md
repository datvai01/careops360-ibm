# Talent Plan Upload Guide

**Audience:** Horizon BCBS / IBM AMS Talent Operations team
**Purpose:** Refresh the data behind every Talent Plan widget — KPI tiles, Skill Readiness Heatmap, role mapping, and reports — by uploading a single Excel workbook.
**Frequency:** Weekly, or any time the resource roster or skill matrix changes.

---

## At a Glance

1. Sign in to **CareOps360** with your admin account.
2. Open **Talent Plan → Refresh Data** tab.
3. Click **Download Talent_Plan_Template.xlsx**.
4. Update the workbook (resources and product skills).
5. Drag the file back onto the upload zone.
6. Confirm the success toast and the new "Last Refresh" timestamp.

The portal updates instantly. No restart, no engineering ticket.

---

## Step 1 — Sign In

- URL: the CareOps360 portal link your admin distributed.
- Use one of the executive accounts:
  - `exec@horizon.com`
  - `ibm@horizon.com`
- Password: provided by your admin.

---

## Step 2 — Open the Refresh Data Tab

- From the left navigation, choose **Talent Plan**.
- Click the **Refresh Data** tab at the top.
- You will see three cards:
  - **Last Refresh** — who uploaded last, when, and the dataset version.
  - **Step 1 — Download Template** — the canonical Excel file.
  - **Step 2 — Upload Refreshed Workbook** — the drag-and-drop zone.

---

## Step 3 — Download the Template

Click **Download Talent_Plan_Template.xlsx**.

The file is regenerated on the fly from the **current live data**, so it always reflects the latest roster. You are essentially downloading a working copy you can edit and re-upload.

The workbook contains four sheets:

| Sheet | Purpose |
|---|---|
| **Product Level - Required Skills** | One row per product (~120 products). Captures the target skill mix for each product. |
| **Resource Level - Talent Plan** | One row per resource (~1,000 people). Captures current and planned skills per person. This sheet powers the Skill Readiness Heatmap. |
| **References** | Lookup lists for Role, Type of Work, and Location. Edit here when you add a new role. |
| **Instructions** | Quick-start notes embedded in the workbook itself. |

---

## Step 4 — Edit the Resource Sheet (drives the Heatmap)

The Skill Readiness Heatmap reads two ranges of columns from the **Resource Level - Talent Plan** sheet:

### Current State columns — J through P

| Col | Skill area | What to enter |
|---|---|---|
| **J** | Tech Stack | Current production stack the person is fluent in (e.g. "Java, OCP, Kafka") |
| **K** | Future Stack | Target stack the person is already trained on (e.g. "watsonx, LangGraph") |
| **L** | Industry | Healthcare / payer domain training completed |
| **M** | Agile | Agile certifications held (Agile Explorer, CSM, DASSM, etc.) |
| **N** | Agentic AI | GenAI / watsonx / prompt engineering training completed |
| **O** | DevSecOps | DevSecOps essentials or advanced badges held |
| **P** | AIOps | AIOps overview or operations badges held |

### Future Plan columns — Q through W

Same seven skill areas, in the same order, but representing the **planned** state for FY26:

| Col | Skill area |
|---|---|
| **Q** | Tech Stack (target) |
| **R** | Future Stack (target) |
| **S** | Industry (planned training) |
| **T** | Agile (planned cert) |
| **U** | Agentic AI (planned cert) |
| **V** | DevSecOps (planned cert) |
| **W** | AIOps (planned cert) |

### Cell value rules

- **Filled with a value** → counts as **covered** for that skill in that view.
- **Blank** → counts as a **gap** (red on the heatmap).
- **`NA`** → also counts as a gap. Use `NA` deliberately when the skill is not applicable so the gap is intentional and auditable.

> Tip: do not delete columns or rename headers. The parser matches by column position, not by header text. Reorder, hide, or add helper columns to the right of column W if needed — they are ignored.

---

## Step 5 — Upload the Workbook

1. Save the workbook as **.xlsx** (Excel Workbook). The system does not accept `.xls` or `.csv`.
2. Return to the **Refresh Data** tab.
3. Drag the file onto **Step 2 — Upload Refreshed Workbook**, or click the zone to browse.
4. Wait for "Uploading and parsing…" to finish (typically 2–5 seconds for ~1,000 resources).

---

## Step 6 — Confirm the Refresh

A green toast will appear at the bottom of the screen:

> **Refresh complete** — vNN, 1,012 resources, uploaded by `exec@horizon.com`.

The **Last Refresh** card on the left will update with the new timestamp, your name, the source filename, and the new dataset version number.

Every other tab on the page (Overview, Skill Heatmap, Role Mapping, Roadmap, Reports) refreshes automatically — no page reload needed.

---

## What Happens Behind the Scenes

1. The portal sends your file to the API.
2. The API parses the four sheets, validates structure, and writes a new versioned snapshot to disk.
3. The dashboard re-fetches within five seconds and re-renders every chart from the new data.
4. The previous version is retained as `vNN-1` for rollback.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| **"Upload failed — sheet not found"** | A required sheet was renamed or deleted | Re-download the template and copy your data into it |
| **A skill column is all red on the heatmap** | The column is blank or filled with `NA` for that group | Add at least one trained resource, or confirm `NA` is intentional |
| **A new role doesn't show up in filters** | Role missing from the **References** sheet | Add the role to References and re-upload |
| **The Last Refresh card still shows the old timestamp** | Browser cached the metadata | Hard refresh (Ctrl/Cmd + Shift + R) |
| **Resources missing from the heatmap** | Their `Product` value doesn't match any product in the Product sheet | Either add the product or correct the spelling on the resource row |
| **Numbers don't match the workbook** | Filters at the top of the page are narrowing the view | Click **Clear Filters**, then re-check |

---

## Governance

- Keep a copy of every uploaded workbook in the shared OneDrive folder `Horizon BCBS / Talent Plan / Weekly Snapshots`, named `Talent_Plan_YYYY-MM-DD.xlsx`.
- Only members of the **Talent Operations** distribution list should have admin access to the upload tab.
- For audit, the system records the uploader's email, filename, timestamp, and version on every save — visible on the **Last Refresh** card and in the change log.

---

*Questions or workbook issues — contact the CareOps360 admin team.*
