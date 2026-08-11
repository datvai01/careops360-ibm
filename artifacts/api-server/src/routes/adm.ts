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

// ---- invoice rows CRUD (admin) ----

router.post("/adm/invoices", requireAdmin, async (req, res): Promise<void> => {
  const { reportMonth, invoiceNo, poNumber, sow, lineItem, hours, amountUsd, note } = req.body ?? {};
  if (!reportMonth || typeof reportMonth !== "string" || !/^[A-Za-z]{3} \d{4}$/.test(reportMonth.trim())) {
    res.status(400).json({ error: "reportMonth is required in 'Mon YYYY' format, e.g. 'Jun 2026'" });
    return;
  }
  if (!lineItem || typeof lineItem !== "string") {
    res.status(400).json({ error: "lineItem is required" });
    return;
  }
  if (hours !== undefined && (typeof hours !== "number" || !Number.isFinite(hours))) {
    res.status(400).json({ error: "hours must be a finite number" });
    return;
  }
  if (amountUsd !== undefined && (typeof amountUsd !== "number" || !Number.isFinite(amountUsd))) {
    res.status(400).json({ error: "amountUsd must be a finite number" });
    return;
  }
  const inserted = await db
    .insert(admInvoiceSummaryTable)
    .values({
      reportMonth: reportMonth.trim(),
      invoiceNo: typeof invoiceNo === "string" ? invoiceNo.trim() : "",
      poNumber: typeof poNumber === "string" ? poNumber.trim() : "",
      sow: typeof sow === "string" ? sow : "",
      lineItem: lineItem.trim(),
      hours: typeof hours === "number" ? hours : 0,
      amountUsd: typeof amountUsd === "number" ? amountUsd : 0,
      note: typeof note === "string" ? note : "",
    })
    .returning();
  res.status(201).json(inserted[0]);
});

router.patch("/adm/invoices/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  const body = req.body ?? {};
  const update: Record<string, unknown> = {};
  for (const k of ["invoiceNo", "poNumber", "sow", "lineItem", "note"] as const) {
    if (body[k] !== undefined) {
      if (typeof body[k] !== "string") {
        res.status(400).json({ error: `${k} must be a string` });
        return;
      }
      update[k] = body[k];
    }
  }
  if (body.reportMonth !== undefined) {
    if (typeof body.reportMonth !== "string" || !/^[A-Za-z]{3} \d{4}$/.test(body.reportMonth.trim())) {
      res.status(400).json({ error: "reportMonth must be in 'Mon YYYY' format" });
      return;
    }
    update.reportMonth = body.reportMonth.trim();
  }
  for (const k of ["hours", "amountUsd"] as const) {
    if (body[k] !== undefined) {
      if (typeof body[k] !== "number" || !Number.isFinite(body[k])) {
        res.status(400).json({ error: `${k} must be a number` });
        return;
      }
      update[k] = body[k];
    }
  }
  if (Object.keys(update).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }
  const updated = await db.update(admInvoiceSummaryTable).set(update).where(eq(admInvoiceSummaryTable.id, id)).returning();
  if (updated.length === 0) {
    res.status(404).json({ error: "Invoice row not found" });
    return;
  }
  res.json(updated[0]);
});

router.delete("/adm/invoices/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  const deleted = await db.delete(admInvoiceSummaryTable).where(eq(admInvoiceSummaryTable.id, id)).returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Invoice row not found" });
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

const GREEN = "#24a148";
const PURPLE = "#8a3ffc";
const ORANGE = "#ff832b";
const RED = "#da1e28";
const PAGE_W = 512; // usable width at LETTER with 50pt margins

function fmtMoney(n: number): string {
  const abs = Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `($${abs})` : `$${abs}`;
}

/** One-line gray narrative under a section header — tells the story of the section. */
function narrative(doc: Doc, text: string) {
  if (doc.y > doc.page.height - 90) doc.addPage();
  doc.font("Helvetica-Oblique").fontSize(9).fillColor(GRAY).text(text, 50, doc.y, { width: PAGE_W });
  doc.moveDown(0.6);
  doc.font("Helvetica").fontSize(9).fillColor(DARK);
  doc.x = 50;
}

/** Row of KPI stat cards. */
function kpiCards(doc: Doc, items: { label: string; value: string; sub: string }[]) {
  const gap = 10;
  const cardW = (PAGE_W - gap * (items.length - 1)) / items.length;
  const cardH = 58;
  if (doc.y + cardH > doc.page.height - 60) doc.addPage();
  const y = doc.y;
  items.forEach((it, i) => {
    const x = 50 + i * (cardW + gap);
    doc.rect(x, y, cardW, cardH).fill(LIGHT);
    doc.rect(x, y, cardW, 3).fill(IBM_BLUE);
    doc.fillColor(GRAY).font("Helvetica").fontSize(6.5).text(it.label.toUpperCase(), x + 8, y + 10, { width: cardW - 16 });
    doc.fillColor(DARK).font("Helvetica-Bold").fontSize(15).text(it.value, x + 8, y + 20, { width: cardW - 16 });
    doc.fillColor(GRAY).font("Helvetica").fontSize(6.5).text(it.sub, x + 8, y + 40, { width: cardW - 16 });
  });
  doc.y = y + cardH + 12;
  doc.x = 50;
  doc.fillColor(DARK);
}

type ChartSeries = { name: string; color: string; values: number[] };

function chartFrame(doc: Doc, title: string, h: number): { x0: number; y0: number; plotW: number; plotH: number } {
  if (doc.y + h + 60 > doc.page.height - 60) doc.addPage();
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor(DARK).text(title, 50, doc.y);
  doc.moveDown(0.4);
  return { x0: 92, y0: doc.y, plotW: PAGE_W - 52, plotH: h };
}

function chartAxes(doc: Doc, f: { x0: number; y0: number; plotW: number; plotH: number }, maxV: number, yFmt: (v: number) => string) {
  for (let g = 0; g <= 4; g++) {
    const gy = f.y0 + (f.plotH * g) / 4;
    doc.moveTo(f.x0, gy).lineTo(f.x0 + f.plotW, gy).lineWidth(0.5).strokeColor(g === 4 ? "#c6c6c6" : "#e8e8e8").stroke();
    doc.font("Helvetica").fontSize(6.5).fillColor(GRAY).text(yFmt(maxV * (1 - g / 4)), 50, gy - 3, { width: 38, align: "right" });
  }
}

function chartXLabels(doc: Doc, f: { x0: number; y0: number; plotW: number; plotH: number }, labels: string[], xAt: (i: number) => number) {
  const step = Math.max(1, Math.ceil(labels.length / 9));
  labels.forEach((l, i) => {
    if (i % step !== 0 && i !== labels.length - 1) return;
    doc.font("Helvetica").fontSize(6).fillColor(GRAY).text(l, xAt(i) - 20, f.y0 + f.plotH + 4, { width: 40, align: "center" });
  });
}

function chartLegend(doc: Doc, f: { x0: number; y0: number; plotW: number; plotH: number }, series: { name: string; color: string }[]) {
  let lx = f.x0;
  const ly = f.y0 + f.plotH + 16;
  series.forEach((s) => {
    doc.rect(lx, ly, 7, 7).fill(s.color);
    doc.font("Helvetica").fontSize(7).fillColor(DARK).text(s.name, lx + 10, ly, { lineBreak: false });
    lx += 14 + doc.widthOfString(s.name) + 14;
  });
  doc.y = ly + 18;
  doc.x = 50;
  doc.fillColor(DARK);
}

/** Multi-series line chart. */
function drawLineChart(doc: Doc, title: string, labels: string[], series: ChartSeries[], yFmt: (v: number) => string, h = 130) {
  if (labels.length === 0) return;
  const f = chartFrame(doc, title, h);
  const maxV = Math.max(1, ...series.flatMap((s) => s.values)) * 1.15;
  const xAt = (i: number) => f.x0 + (labels.length === 1 ? f.plotW / 2 : (f.plotW * i) / (labels.length - 1));
  const yAt = (v: number) => f.y0 + f.plotH - (f.plotH * v) / maxV;
  chartAxes(doc, f, maxV, yFmt);
  for (const s of series) {
    s.values.forEach((v, i) => {
      if (i === 0) doc.moveTo(xAt(0), yAt(v));
      else doc.lineTo(xAt(i), yAt(v));
    });
    doc.lineWidth(1.5).strokeColor(s.color).stroke();
    s.values.forEach((v, i) => doc.circle(xAt(i), yAt(v), 1.8).fill(s.color));
  }
  chartXLabels(doc, f, labels, xAt);
  chartLegend(doc, f, series);
}

/** Stacked vertical bar chart. */
function drawStackedBarChart(doc: Doc, title: string, labels: string[], series: ChartSeries[], yFmt: (v: number) => string, h = 130) {
  if (labels.length === 0) return;
  const f = chartFrame(doc, title, h);
  const totals = labels.map((_, i) => series.reduce((s, sr) => s + (sr.values[i] || 0), 0));
  const maxV = Math.max(1, ...totals) * 1.15;
  const slot = f.plotW / labels.length;
  const barW = Math.min(26, slot * 0.55);
  chartAxes(doc, f, maxV, yFmt);
  labels.forEach((_, i) => {
    let acc = 0;
    const bx = f.x0 + slot * i + (slot - barW) / 2;
    for (const s of series) {
      const v = s.values[i] || 0;
      if (v <= 0) continue;
      const y1 = f.y0 + f.plotH - (f.plotH * (acc + v)) / maxV;
      const bh = (f.plotH * v) / maxV;
      doc.rect(bx, y1, barW, bh).fill(s.color);
      acc += v;
    }
  });
  chartXLabels(doc, f, labels, (i) => f.x0 + slot * i + slot / 2);
  chartLegend(doc, f, series);
}

/** Horizontal bar chart (one bar per label). */
function drawHBarChart(doc: Doc, title: string, items: { label: string; value: number; color?: string }[], vFmt: (v: number) => string) {
  if (items.length === 0) return;
  const rowH = 18;
  const h = items.length * rowH;
  if (doc.y + h + 50 > doc.page.height - 60) doc.addPage();
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor(DARK).text(title, 50, doc.y);
  doc.moveDown(0.4);
  const y0 = doc.y;
  const labelW = 120;
  const valueW = 78;
  const barMax = PAGE_W - labelW - valueW - 8;
  const maxV = Math.max(1, ...items.map((i) => Math.abs(i.value)));
  items.forEach((it, i) => {
    const y = y0 + i * rowH;
    doc.font("Helvetica").fontSize(7.5).fillColor(DARK).text(it.label, 50, y + 4, { width: labelW - 6, lineBreak: false });
    const bw = Math.max(1.5, (barMax * Math.abs(it.value)) / maxV);
    doc.rect(50 + labelW, y + 3, bw, rowH - 8).fill(it.color || (it.value < 0 ? RED : IBM_BLUE));
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(it.value < 0 ? RED : DARK).text(fmtMoneyShort(it.value, vFmt), 50 + labelW + bw + 5, y + 4, { lineBreak: false });
  });
  doc.y = y0 + h + 10;
  doc.x = 50;
  doc.fillColor(DARK);
}

function fmtMoneyShort(v: number, vFmt: (v: number) => string): string {
  return vFmt(v);
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

  // ── Executive Summary ──
  const latestHc = r.headcount[r.headcount.length - 1];
  const latestMips = r.mipsTrend[r.mipsTrend.length - 1];
  const grandTotal = r.invoiceSummary.reduce((s, i) => s + i.amountUsd, 0);
  const openItems = r.actionItems.filter((a) => a.status !== "Closed").length;
  const activeInits = r.initiatives.filter((i) => i.status === "Active").length;
  const latestHours = r.hourlyTrends[r.hourlyTrends.length - 1];
  const totalHours = latestHours
    ? latestHours.onshoreNonCr + latestHours.offshoreNonCr + latestHours.onshoreCr + latestHours.offshoreCr
    : 0;

  // Invoice groups (shared by summary + invoice section)
  const invoiceGroups = (() => {
    const map = new Map<string, { invoiceNo: string; poNumber: string; note: string; total: number; lines: typeof r.invoiceSummary }>();
    for (const i of r.invoiceSummary) {
      const key = i.invoiceNo || "—";
      const cur = map.get(key) ?? { invoiceNo: key, poNumber: i.poNumber, note: i.note, total: 0, lines: [] as typeof r.invoiceSummary };
      cur.total += i.amountUsd;
      cur.lines.push(i);
      if (!cur.poNumber && i.poNumber) cur.poNumber = i.poNumber;
      if (!cur.note && i.note) cur.note = i.note;
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => a.invoiceNo.localeCompare(b.invoiceNo));
  })();
  const topInvoice = [...invoiceGroups].sort((a, b) => b.total - a.total)[0];
  const mipsPct = latestMips && latestMips.baselineK > 0 ? Math.round((latestMips.usageK / latestMips.baselineK) * 100) : null;

  doc.rect(50, doc.y, 4, 18).fill(IBM_BLUE);
  doc.fill(DARK).font("Helvetica-Bold").fontSize(14).text("Executive Summary", 62, doc.y + 1);
  doc.moveDown(0.8);
  doc.x = 50;

  kpiCards(doc, [
    { label: "IBM Team @ Horizon", value: latestHc ? String(latestHc.endHc) : "—", sub: latestHc ? `Attrition ${latestHc.attritionPct}%` : "No data" },
    { label: `Invoiced — ${month}`, value: grandTotal >= 1e6 ? `$${(grandTotal / 1e6).toFixed(2)}M` : fmtMoney(grandTotal), sub: `${invoiceGroups.length} invoice${invoiceGroups.length === 1 ? "" : "s"} submitted` },
    { label: "MIPS Usage", value: latestMips ? `${latestMips.usageK}K` : "—", sub: latestMips ? (mipsPct !== null ? `vs ${latestMips.baselineK}K baseline (${mipsPct}%)` : "baseline unavailable") : "No data" },
    { label: "Delivery Governance", value: `${openItems}`, sub: `open action items · ${activeInits} active initiatives` },
  ]);

  const storyLines: string[] = [];
  if (latestHc) {
    const first = r.headcount[0];
    const dir = first && latestHc.endHc >= first.endHc ? "grew" : "reduced";
    storyLines.push(
      `The IBM team at Horizon ${dir} from ${first ? first.endHc : "—"} to ${latestHc.endHc} practitioners over the reported period, closing ${month} with ${latestHc.onboards} onboard${latestHc.onboards === 1 ? "" : "s"}, ${latestHc.offboards} offboard${latestHc.offboards === 1 ? "" : "s"}, and attrition at ${latestHc.attritionPct}%.`,
    );
  }
  if (invoiceGroups.length > 0 && topInvoice) {
    storyLines.push(
      `Commercially, ${invoiceGroups.length} invoice${invoiceGroups.length === 1 ? " was" : "s were"} submitted for ${month} totaling ${fmtMoney(grandTotal)}, led by invoice ${topInvoice.invoiceNo} (${topInvoice.poNumber || "no PO"}) at ${fmtMoney(topInvoice.total)}.${totalHours > 0 ? ` Delivery effort for the month reached ${Math.round(totalHours).toLocaleString()} hours across onshore and offshore teams.` : ""}`,
    );
  }
  if (latestMips) {
    storyLines.push(
      mipsPct !== null
        ? `Mainframe consumption stands at ${latestMips.usageK}K MIPS against the ${latestMips.baselineK}K contracted baseline (${mipsPct}%), ${mipsPct <= 100 ? "within contracted capacity" : "above contracted capacity — optimization actions are detailed in the MIPS section"}.`
        : `Mainframe consumption stands at ${latestMips.usageK}K MIPS; no contracted baseline is recorded for comparison.`,
    );
  }
  storyLines.push(
    `Governance remains active with ${openItems} open action item${openItems === 1 ? "" : "s"} and ${activeInits} transformation initiative${activeInits === 1 ? "" : "s"} in flight; details follow in each section.`,
  );
  doc.font("Helvetica").fontSize(9.5).fillColor(DARK);
  for (const line of storyLines) {
    doc.text(line, 50, doc.y, { width: PAGE_W, lineGap: 2 });
    doc.moveDown(0.5);
  }
  doc.moveDown(0.5);

  // 1. Action items
  sectionHeader(doc, 1, "Action Items");
  narrative(doc, `Living list maintained by the IBM account team — ${openItems} of ${r.actionItems.length} item${r.actionItems.length === 1 ? "" : "s"} currently open.`);
  drawTable(
    doc,
    ["Item", "Latest Update", "Status", "Owner", "Source"],
    r.actionItems.map((a) => [a.item, a.latestUpdate, a.status, a.owner, a.progressSource]),
    [160, 160, 55, 70, 67],
  );

  // 2. Key monthly meetings
  sectionHeader(doc, 2, "Key Monthly Meetings");
  narrative(doc, r.meetings.length > 0
    ? `${r.meetings.length} key review${r.meetings.length === 1 ? "" : "s"} held with Horizon leadership in ${month}.`
    : `No key meetings recorded for ${month}.`);
  drawTable(
    doc,
    ["Domain / Area", "Date", "Horizon Attendees", "IBM Attendees", "Deck"],
    r.meetings.map((m) => [m.domainArea, m.meetingDate, m.horizonAttendees, m.ibmAttendees, m.deckLink]),
    [95, 60, 120, 120, 117],
  );

  // 3. IBM Team @ Horizon
  sectionHeader(doc, 3, "IBM Team @ Horizon — Headcount");
  if (latestHc) {
    narrative(doc, `Team of ${latestHc.endHc} at ${month} close · attrition ${latestHc.attritionPct}% · ${latestHc.onboards} onboarded, ${latestHc.offboards} offboarded this month.`);
  }
  drawLineChart(
    doc,
    "Headcount trend (end of month)",
    r.headcount.map((h) => h.monthLabel),
    [{ name: "End HC", color: IBM_BLUE, values: r.headcount.map((h) => h.endHc) }],
    (v) => String(Math.round(v)),
  );
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

  // 4. Invoice summary — grouped by invoice, line items indented
  sectionHeader(doc, 4, `Invoice — ${month}`);
  if (invoiceGroups.length > 0) {
    narrative(doc, `${invoiceGroups.length} invoice${invoiceGroups.length === 1 ? "" : "s"} submitted for ${month} totaling ${fmtMoney(grandTotal)}. Credits for separately-invoiced charges are shown in parentheses.`);
    drawHBarChart(
      doc,
      "Invoice composition",
      invoiceGroups.map((g) => ({ label: `${g.invoiceNo}${g.poNumber ? ` · ${g.poNumber}` : ""}`, value: g.total })),
      (v) => fmtMoney(v),
    );

    const rowGap = 4;
    const invoiceHeader = (g: { invoiceNo: string; poNumber: string; total: number }, continued = false) => {
      const hy = doc.y;
      doc.rect(50, hy, PAGE_W, 18).fill("#edf5ff");
      doc.rect(50, hy, 3, 18).fill(IBM_BLUE);
      doc.fillColor(DARK).font("Helvetica-Bold").fontSize(9)
        .text(`Invoice ${g.invoiceNo}${g.poNumber ? `  ·  ${g.poNumber}` : ""}${continued ? "  (continued)" : ""}`, 60, hy + 5, { lineBreak: false });
      doc.fillColor(g.total < 0 ? RED : DARK).font("Helvetica-Bold").fontSize(9)
        .text(fmtMoney(g.total), 50 + PAGE_W - 130, hy + 5, { width: 124, align: "right" });
      doc.y = hy + 18 + rowGap;
    };
    const ensure = (h: number) => { if (doc.y + h > doc.page.height - 60) { doc.addPage(); return true; } return false; };
    for (const g of invoiceGroups) {
      ensure(60);
      invoiceHeader(g);
      // Indented line items
      for (const li of g.lines) {
        doc.font("Helvetica").fontSize(8);
        const descW = PAGE_W - 24 - 70 - 90;
        const lh = Math.max(11, doc.heightOfString(li.lineItem, { width: descW }) + 3);
        if (ensure(lh + 2)) invoiceHeader(g, true);
        const ly = doc.y;
        doc.fillColor(DARK).text(li.lineItem, 74, ly, { width: descW });
        doc.fillColor(GRAY).text(li.hours ? `${li.hours.toLocaleString()} h` : "", 74 + descW, ly, { width: 66, align: "right", lineBreak: false });
        doc.fillColor(li.amountUsd < 0 ? RED : DARK).font(li.amountUsd < 0 ? "Helvetica" : "Helvetica").fontSize(8)
          .text(fmtMoney(li.amountUsd), 74 + descW + 70, ly, { width: 86, align: "right" });
        doc.y = ly + lh;
      }
      // Subtotal rule + note
      doc.moveTo(74, doc.y + 1).lineTo(50 + PAGE_W, doc.y + 1).lineWidth(0.5).strokeColor("#d0d0d0").stroke();
      doc.y += 4;
      if (g.note) {
        ensure(14);
        doc.font("Helvetica-Oblique").fontSize(7.5).fillColor(GRAY).text(`Note: ${g.note}`, 74, doc.y, { width: PAGE_W - 24 });
        doc.y += 2;
      }
      doc.y += 6;
      doc.x = 50;
      doc.fillColor(DARK);
    }
    // Grand total banner
    ensure(24);
    const gy = doc.y;
    doc.rect(50, gy, PAGE_W, 20).fill(IBM_BLUE);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10).text("Grand total — final invoice total", 60, gy + 5, { lineBreak: false });
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10).text(fmtMoney(grandTotal), 50 + PAGE_W - 150, gy + 5, { width: 144, align: "right" });
    doc.y = gy + 20 + 10;
    doc.x = 50;
    doc.fillColor(DARK);
  } else {
    narrative(doc, `No invoices recorded for ${month}.`);
  }

  doc.font("Helvetica-Bold").fontSize(10).text("Hourly Trends");
  doc.moveDown(0.3);
  drawStackedBarChart(
    doc,
    "Monthly delivery hours by shore and CareRadius split",
    r.hourlyTrends.map((h) => h.monthLabel),
    [
      { name: "Offshore Non-CR", color: IBM_BLUE, values: r.hourlyTrends.map((h) => h.offshoreNonCr) },
      { name: "Onshore Non-CR", color: PURPLE, values: r.hourlyTrends.map((h) => h.onshoreNonCr) },
      { name: "Offshore CR", color: GREEN, values: r.hourlyTrends.map((h) => h.offshoreCr) },
      { name: "Onshore CR", color: ORANGE, values: r.hourlyTrends.map((h) => h.onshoreCr) },
    ],
    (v) => `${Math.round(v / 1000)}K`,
  );
  drawTable(
    doc,
    ["Month", "Onshore Non-CR", "Offshore Non-CR", "Onshore CR", "Offshore CR"],
    r.hourlyTrends.map((h) => [h.monthLabel, h.onshoreNonCr.toLocaleString(), h.offshoreNonCr.toLocaleString(), h.onshoreCr.toLocaleString(), h.offshoreCr.toLocaleString()]),
    [102, 102, 102, 103, 103],
  );

  // 5. MIPS
  sectionHeader(doc, 5, "MIPS Usage & Capacity");
  if (latestMips) {
    narrative(doc, mipsPct !== null
      ? `Current usage ${latestMips.usageK}K MIPS vs ${latestMips.baselineK}K contracted baseline (${mipsPct}% of capacity).`
      : `Current usage ${latestMips.usageK}K MIPS; no contracted baseline recorded.`);
  }
  drawLineChart(
    doc,
    "MIPS usage vs contracted baseline (K MIPS)",
    r.mipsTrend.map((m) => m.monthLabel),
    [
      { name: "Usage", color: IBM_BLUE, values: r.mipsTrend.map((m) => m.usageK) },
      { name: "Baseline", color: RED, values: r.mipsTrend.map((m) => m.baselineK) },
    ],
    (v) => `${Math.round(v)}K`,
  );
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
  narrative(doc, r.initiatives.length > 0
    ? `${activeInits} of ${r.initiatives.length} initiative${r.initiatives.length === 1 ? "" : "s"} currently active — living list maintained by the IBM account team.`
    : "No transformation initiatives recorded.");
  drawTable(
    doc,
    ["Initiative", "Description", "Actions", "Owner", "Next Steps", "Status"],
    r.initiatives.map((i) => [i.title, i.description, i.actions, i.owner, i.nextSteps, i.status]),
    [85, 110, 90, 60, 110, 57],
  );

  // 7. Team composition
  sectionHeader(doc, 7, "Team Composition");
  narrative(doc, r.teamComposition.length > 0
    ? `Composition of the IBM team at Horizon for ${month}, across ${[...new Set(r.teamComposition.map((t) => t.category))].length} dimensions.`
    : `No team composition data recorded for ${month}.`);
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
  narrative(doc, r.otherUpdates.length > 0
    ? `${r.otherUpdates.length} additional update${r.otherUpdates.length === 1 ? "" : "s"} reported for ${month}.`
    : `No additional updates for ${month}.`);
  drawTable(
    doc,
    ["Update", "Detail", "Status"],
    r.otherUpdates.map((o) => [o.title, o.detail, o.status]),
    [140, 292, 80],
  );

  doc.end();
});

export default router;
