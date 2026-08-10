import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import {
  db,
  admActionItemsTable,
  admInitiativesTable,
  admMeetingsTable,
  admHeadcountTable,
  admStaffChangesTable,
  admInvoiceSummaryTable,
  admHourlyTrendsTable,
  admMipsTrendTable,
  admMipsInsightsTable,
  admTeamCompositionTable,
  admOtherUpdatesTable,
} from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import PDFDocument from "pdfkit";
import { getSessionUser } from "./auth";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const user = getSessionUser(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "No valid session" });
    return;
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = getSessionUser(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "No valid session" });
    return;
  }
  if (user.role !== "admin") {
    res.status(403).json({ error: "Forbidden", message: "Administrator role required" });
    return;
  }
  next();
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function monthSortValue(label: string): number {
  const m = /^([A-Za-z]{3})\w*\s+(\d{4})$/.exec(label.trim());
  if (!m) return 0;
  const idx = MONTHS.findIndex((x) => x.toLowerCase() === m[1].toLowerCase());
  if (idx < 0) return 0;
  return parseInt(m[2], 10) * 12 + idx;
}
function sortByMonth<T>(rows: T[], get: (r: T) => string): T[] {
  return [...rows].sort((a, b) => monthSortValue(get(a)) - monthSortValue(get(b)));
}

async function collectReport(month: string) {
  const cutoff = monthSortValue(month);
  const upToMonth = <T>(rows: T[], get: (r: T) => string): T[] =>
    cutoff > 0
      ? rows.filter((r) => {
          const v = monthSortValue(get(r));
          return v > 0 && v <= cutoff;
        })
      : rows;
  const [meetings, headcount, staffChanges, invoiceSummary, hourlyTrends, mipsTrend, mipsInsights, teamComposition, otherUpdates, actionItems, initiatives] =
    await Promise.all([
      db.select().from(admMeetingsTable).where(eq(admMeetingsTable.reportMonth, month)),
      db.select().from(admHeadcountTable),
      db.select().from(admStaffChangesTable).where(eq(admStaffChangesTable.reportMonth, month)),
      db.select().from(admInvoiceSummaryTable).where(eq(admInvoiceSummaryTable.reportMonth, month)),
      db.select().from(admHourlyTrendsTable),
      db.select().from(admMipsTrendTable),
      db.select().from(admMipsInsightsTable).where(eq(admMipsInsightsTable.reportMonth, month)).orderBy(asc(admMipsInsightsTable.ord)),
      db.select().from(admTeamCompositionTable).where(eq(admTeamCompositionTable.reportMonth, month)),
      db.select().from(admOtherUpdatesTable).where(eq(admOtherUpdatesTable.reportMonth, month)),
      db.select().from(admActionItemsTable).orderBy(asc(admActionItemsTable.id)),
      db.select().from(admInitiativesTable).orderBy(asc(admInitiativesTable.id)),
    ]);
  return {
    month,
    actionItems,
    initiatives,
    meetings,
    headcount: sortByMonth(upToMonth(headcount, (r) => r.monthLabel), (r) => r.monthLabel),
    staffChanges,
    invoiceSummary,
    hourlyTrends: sortByMonth(upToMonth(hourlyTrends, (r) => r.monthLabel), (r) => r.monthLabel),
    mipsTrend: sortByMonth(upToMonth(mipsTrend, (r) => r.monthLabel), (r) => r.monthLabel),
    mipsInsights,
    teamComposition,
    otherUpdates,
  };
}

// ---- reads ----

router.get("/adm/months", requireAuth, async (_req, res): Promise<void> => {
  const sources = await Promise.all([
    db.select({ m: admMeetingsTable.reportMonth }).from(admMeetingsTable),
    db.select({ m: admStaffChangesTable.reportMonth }).from(admStaffChangesTable),
    db.select({ m: admInvoiceSummaryTable.reportMonth }).from(admInvoiceSummaryTable),
    db.select({ m: admMipsInsightsTable.reportMonth }).from(admMipsInsightsTable),
    db.select({ m: admTeamCompositionTable.reportMonth }).from(admTeamCompositionTable),
    db.select({ m: admOtherUpdatesTable.reportMonth }).from(admOtherUpdatesTable),
  ]);
  const set = [...new Set(sources.flat().map((r) => r.m))];
  set.sort((a, b) => monthSortValue(b) - monthSortValue(a));
  res.json(set);
});

router.get("/adm/report", requireAuth, async (req, res): Promise<void> => {
  const month = String(req.query.month || "").trim();
  if (!month) {
    res.status(400).json({ error: "month query parameter is required, e.g. ?month=Jun 2026" });
    return;
  }
  res.json(await collectReport(month));
});

// ---- action items CRUD (admin) ----

const ACTION_STATUSES = ["Open", "In Progress", "Closed"];

router.post("/adm/action-items", requireAdmin, async (req, res): Promise<void> => {
  const { item, latestUpdate, status, owner, progressSource } = req.body ?? {};
  if (!item || typeof item !== "string") {
    res.status(400).json({ error: "item is required" });
    return;
  }
  if (status !== undefined && !ACTION_STATUSES.includes(status)) {
    res.status(400).json({ error: `status must be one of: ${ACTION_STATUSES.join(", ")}` });
    return;
  }
  const now = new Date().toISOString();
  const inserted = await db
    .insert(admActionItemsTable)
    .values({
      item: item.trim(),
      latestUpdate: typeof latestUpdate === "string" ? latestUpdate : "",
      status: status || "Open",
      owner: typeof owner === "string" ? owner : "",
      progressSource: typeof progressSource === "string" ? progressSource : "",
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  res.status(201).json(inserted[0]);
});

router.patch("/adm/action-items/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  const body = req.body ?? {};
  const update: Record<string, unknown> = {};
  for (const k of ["item", "latestUpdate", "owner", "progressSource"] as const) {
    if (body[k] !== undefined) {
      if (typeof body[k] !== "string") {
        res.status(400).json({ error: `${k} must be a string` });
        return;
      }
      update[k] = body[k];
    }
  }
  if (body.status !== undefined) {
    if (!ACTION_STATUSES.includes(body.status)) {
      res.status(400).json({ error: `status must be one of: ${ACTION_STATUSES.join(", ")}` });
      return;
    }
    update.status = body.status;
  }
  if (Object.keys(update).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }
  update.updatedAt = new Date().toISOString();
  const updated = await db.update(admActionItemsTable).set(update).where(eq(admActionItemsTable.id, id)).returning();
  if (updated.length === 0) {
    res.status(404).json({ error: "Action item not found" });
    return;
  }
  res.json(updated[0]);
});

router.delete("/adm/action-items/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  const deleted = await db.delete(admActionItemsTable).where(eq(admActionItemsTable.id, id)).returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Action item not found" });
    return;
  }
  res.json({ ok: true });
});

// ---- initiatives CRUD (admin) ----

const INITIATIVE_STATUSES = ["Active", "On Hold", "Completed"];

router.post("/adm/initiatives", requireAdmin, async (req, res): Promise<void> => {
  const { title, description, actions, owner, nextSteps, status } = req.body ?? {};
  if (!title || typeof title !== "string") {
    res.status(400).json({ error: "title is required" });
    return;
  }
  if (status !== undefined && !INITIATIVE_STATUSES.includes(status)) {
    res.status(400).json({ error: `status must be one of: ${INITIATIVE_STATUSES.join(", ")}` });
    return;
  }
  const inserted = await db
    .insert(admInitiativesTable)
    .values({
      title: title.trim(),
      description: typeof description === "string" ? description : "",
      actions: typeof actions === "string" ? actions : "",
      owner: typeof owner === "string" ? owner : "",
      nextSteps: typeof nextSteps === "string" ? nextSteps : "",
      status: status || "Active",
      updatedAt: new Date().toISOString(),
    })
    .returning();
  res.status(201).json(inserted[0]);
});

router.patch("/adm/initiatives/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  const body = req.body ?? {};
  const update: Record<string, unknown> = {};
  for (const k of ["title", "description", "actions", "owner", "nextSteps"] as const) {
    if (body[k] !== undefined) {
      if (typeof body[k] !== "string") {
        res.status(400).json({ error: `${k} must be a string` });
        return;
      }
      update[k] = body[k];
    }
  }
  if (body.status !== undefined) {
    if (!INITIATIVE_STATUSES.includes(body.status)) {
      res.status(400).json({ error: `status must be one of: ${INITIATIVE_STATUSES.join(", ")}` });
      return;
    }
    update.status = body.status;
  }
  if (Object.keys(update).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }
  update.updatedAt = new Date().toISOString();
  const updated = await db.update(admInitiativesTable).set(update).where(eq(admInitiativesTable.id, id)).returning();
  if (updated.length === 0) {
    res.status(404).json({ error: "Initiative not found" });
    return;
  }
  res.json(updated[0]);
});

router.delete("/adm/initiatives/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  const deleted = await db.delete(admInitiativesTable).where(eq(admInitiativesTable.id, id)).returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Initiative not found" });
    return;
  }
  res.json({ ok: true });
});

// ---- PDF export ----

const IBM_BLUE = "#0f62fe";
const DARK = "#161616";
const GRAY = "#525252";
const LIGHT = "#f4f4f4";

type Doc = InstanceType<typeof PDFDocument>;

function sectionHeader(doc: Doc, num: number, title: string) {
  if (doc.y > doc.page.height - 160) doc.addPage();
  doc.moveDown(1);
  const y = doc.y;
  doc.rect(50, y, 4, 18).fill(IBM_BLUE);
  doc.fill(DARK).font("Helvetica-Bold").fontSize(14).text(`${num}. ${title}`, 62, y + 1);
  doc.moveDown(0.6);
  doc.font("Helvetica").fontSize(9).fillColor(DARK);
}

function drawTable(doc: Doc, headers: string[], rows: (string | number)[][], widths: number[]) {
  const startX = 50;
  const rowH = (cells: (string | number)[], font: string, size: number) => {
    doc.font(font).fontSize(size);
    let h = 14;
    cells.forEach((c, i) => {
      h = Math.max(h, doc.heightOfString(String(c ?? ""), { width: widths[i] - 8 }) + 6);
    });
    return h;
  };
  const drawRow = (cells: (string | number)[], opts: { bold?: boolean; zebra?: boolean }) => {
    const font = opts.bold ? "Helvetica-Bold" : "Helvetica";
    const h = rowH(cells, font, 8);
    if (doc.y + h > doc.page.height - 60) doc.addPage();
    const y = doc.y;
    if (opts.bold) {
      doc.rect(startX, y, widths.reduce((a, b) => a + b, 0), h).fill(IBM_BLUE);
    } else if (opts.zebra) {
      doc.rect(startX, y, widths.reduce((a, b) => a + b, 0), h).fill(LIGHT);
    }
    let x = startX;
    cells.forEach((c, i) => {
      doc
        .font(font)
        .fontSize(8)
        .fillColor(opts.bold ? "#ffffff" : DARK)
        .text(String(c ?? ""), x + 4, y + 3, { width: widths[i] - 8 });
      x += widths[i];
    });
    doc.y = y + h;
    doc.x = startX;
  };
  drawRow(headers, { bold: true });
  rows.forEach((r, i) => drawRow(r, { zebra: i % 2 === 1 }));
  doc.fillColor(DARK).moveDown(0.5);
  doc.x = 50;
}

router.get("/adm/export-pdf", requireAuth, async (req, res): Promise<void> => {
  const month = String(req.query.month || "").trim();
  if (!/^[A-Za-z]{3} \d{4}$/.test(month)) {
    res.status(400).json({ error: "month must be in 'Mon YYYY' format, e.g. ?month=Jun 2026" });
    return;
  }
  const r = await collectReport(month);

  const doc = new PDFDocument({ size: "LETTER", margins: { top: 50, bottom: 50, left: 50, right: 50 } });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="ADM-Report-${month.replace(/\s+/g, "-")}.pdf"`);
  doc.pipe(res);

  // Cover
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#ffffff");
  doc.rect(0, 0, doc.page.width, 8).fill(IBM_BLUE);
  doc.fill(GRAY).font("Helvetica").fontSize(11).text("IBM × Horizon Blue Cross Blue Shield", 50, 180);
  doc.fill(DARK).font("Helvetica-Bold").fontSize(28).text("Account Management Report", 50, 205);
  doc.fill(IBM_BLUE).font("Helvetica-Bold").fontSize(18).text(month, 50, 250);
  doc
    .fill(GRAY)
    .font("Helvetica")
    .fontSize(10)
    .text(`Generated ${new Date().toISOString().slice(0, 10)} · CareOps360 Command Center`, 50, 285);
  doc.rect(50, 320, 120, 3).fill(IBM_BLUE);

  doc.addPage();
  doc.x = 50;

  // 1. Action items
  sectionHeader(doc, 1, "Action Items");
  drawTable(
    doc,
    ["Item", "Latest Update", "Status", "Owner", "Source"],
    r.actionItems.map((a) => [a.item, a.latestUpdate, a.status, a.owner, a.progressSource]),
    [160, 160, 55, 70, 67],
  );

  // 2. Director meetings
  sectionHeader(doc, 2, "Monthly Meetings with Directors");
  drawTable(
    doc,
    ["Domain / Area", "Date", "Horizon Attendees", "IBM Attendees", "Deck"],
    r.meetings.map((m) => [m.domainArea, m.meetingDate, m.horizonAttendees, m.ibmAttendees, m.deckLink]),
    [95, 60, 120, 120, 117],
  );

  // 3. IBM Team @ Horizon
  sectionHeader(doc, 3, "IBM Team @ Horizon — Headcount");
  drawTable(
    doc,
    ["Month", "Start HC", "Onboards", "Offboards", "End HC", "Attrition %"],
    r.headcount.map((h) => [h.monthLabel, h.startHc, h.onboards, h.offboards, h.endHc, h.attritionPct]),
    [92, 84, 84, 84, 84, 84],
  );
  if (r.staffChanges.length > 0) {
    doc.font("Helvetica-Bold").fontSize(10).text("On/Offboarding — " + month);
    doc.moveDown(0.3);
    drawTable(
      doc,
      ["Name", "Team", "Type", "Reason"],
      r.staffChanges.map((s) => [s.personName, s.team, s.changeType, s.reason]),
      [120, 120, 70, 202],
    );
  }

  // 4. Invoice summary
  sectionHeader(doc, 4, "Invoice Summary");
  drawTable(
    doc,
    ["SOW", "Line Item", "Hours", "Amount (USD)"],
    r.invoiceSummary.map((i) => [i.sow, i.lineItem, i.hours.toLocaleString(), `$${i.amountUsd.toLocaleString()}`]),
    [120, 202, 80, 110],
  );
  doc.font("Helvetica-Bold").fontSize(10).text("Hourly Trends");
  doc.moveDown(0.3);
  drawTable(
    doc,
    ["Month", "Onshore Non-CR", "Offshore Non-CR", "Onshore CR", "Offshore CR"],
    r.hourlyTrends.map((h) => [h.monthLabel, h.onshoreNonCr.toLocaleString(), h.offshoreNonCr.toLocaleString(), h.onshoreCr.toLocaleString(), h.offshoreCr.toLocaleString()]),
    [102, 102, 102, 103, 103],
  );

  // 5. MIPS
  sectionHeader(doc, 5, "MIPS Usage & Capacity");
  drawTable(
    doc,
    ["Month", "Usage (K MIPS)", "Baseline (K MIPS)", "Note"],
    r.mipsTrend.map((m) => [m.monthLabel, m.usageK, m.baselineK, m.note]),
    [92, 110, 110, 200],
  );
  for (const ins of r.mipsInsights) {
    if (doc.y > doc.page.height - 100) doc.addPage();
    doc.font("Helvetica-Bold").fontSize(9).fillColor(IBM_BLUE).text(`${ins.section}: `, { continued: true });
    doc.fillColor(DARK).text(ins.title);
    if (ins.detail) doc.font("Helvetica").fontSize(8.5).fillColor(GRAY).text(ins.detail, { indent: 10 });
    doc.moveDown(0.3);
  }
  doc.fillColor(DARK);

  // 6. Initiatives
  sectionHeader(doc, 6, "Transformation Initiatives");
  drawTable(
    doc,
    ["Initiative", "Description", "Actions", "Owner", "Next Steps", "Status"],
    r.initiatives.map((i) => [i.title, i.description, i.actions, i.owner, i.nextSteps, i.status]),
    [85, 110, 90, 60, 110, 57],
  );

  // 7. Team composition
  sectionHeader(doc, 7, "Team Composition");
  const cats = [...new Set(r.teamComposition.map((t) => t.category))];
  for (const cat of cats) {
    doc.font("Helvetica-Bold").fontSize(10).text(cat);
    doc.moveDown(0.3);
    drawTable(
      doc,
      ["Metric", "Value", "Note"],
      r.teamComposition.filter((t) => t.category === cat).map((t) => [t.label, `${t.value}${t.unit}`, t.note]),
      [180, 80, 252],
    );
  }

  // 8. Other updates
  sectionHeader(doc, 8, "Other Updates");
  drawTable(
    doc,
    ["Update", "Detail", "Status"],
    r.otherUpdates.map((o) => [o.title, o.detail, o.status]),
    [140, 292, 80],
  );

  doc.end();
});

export default router;
