import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, vendorInvoicesTable, vendorInvoiceAlertsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { fetchPageKpis } from "../lib/kpiHelper";
import { getSessionUser } from "./auth";

const router: IRouter = Router();

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

function mkKpi(value: number, formatted: string, change: number, status: "green" | "yellow" | "red", trend: "up" | "down" | "flat") {
  return { value, formatted, change, changeLabel: `${change > 0 ? "+" : ""}${change}% vs last period`, status, trend };
}

router.get("/vendor-invoices/kpis", async (_req, res): Promise<void> => {
  const rows = await db.select().from(vendorInvoicesTable);
  const total = rows.length;
  const processed = rows.filter((r) => r.status === "Processed").length;
  const pendingOnHold = rows.filter((r) => r.status === "Pending" || r.status === "On Hold").length;
  const totalValue = rows.reduce((s, r) => s + r.amount, 0);
  const paidCount = rows.filter((r) => r.paymentStatus === "Paid").length;
  const withCycle = rows.filter((r) => r.cycleTimeDays != null);
  const avgCycle = withCycle.length > 0 ? withCycle.reduce((s, r) => s + (r.cycleTimeDays ?? 0), 0) / withCycle.length : 0;
  const exceptions = rows.filter((r) => r.hasException === 1).length;
  res.json({
    totalReceived: mkKpi(total, `${total}`, 8.4, "green", "up"),
    totalProcessed: mkKpi(processed, `${processed}`, 4.1, "green", "up"),
    pendingOnHold: mkKpi(pendingOnHold, `${pendingOnHold}`, 12.5, "yellow", "up"),
    totalValue: mkKpi(totalValue, `$${(totalValue / 1000000).toFixed(2)}M`, 6.2, "green", "up"),
    paidCount: mkKpi(paidCount, `${paidCount}`, 3.7, "green", "up"),
    avgCycleTime: mkKpi(Math.round(avgCycle * 10) / 10, `${(Math.round(avgCycle * 10) / 10)} days`, -2.1, "green", "down"),
    exceptionCount: mkKpi(exceptions, `${exceptions}`, 33.3, "yellow", "up"),
  });
});

router.get("/finance/kpis", async (_req, res): Promise<void> => {
  const kpis = await fetchPageKpis("finance");
  res.json(kpis);
});

router.get("/vendor-invoices/list", async (req, res): Promise<void> => {
  let rows = await db.select().from(vendorInvoicesTable);
  const { vendor, status, workNumber, serviceCategory, dateFrom, dateTo } = req.query as Record<string, string | undefined>;
  if (vendor) rows = rows.filter((r) => r.vendor === vendor);
  if (status) rows = rows.filter((r) => r.status === status);
  if (workNumber) rows = rows.filter((r) => r.workNumber === workNumber);
  if (serviceCategory) rows = rows.filter((r) => r.serviceCategory === serviceCategory);
  if (dateFrom) rows = rows.filter((r) => r.invoiceDate >= dateFrom);
  if (dateTo) rows = rows.filter((r) => r.invoiceDate <= dateTo);
  res.json(rows);
});

router.get("/vendor-invoices/aging", async (_req, res): Promise<void> => {
  const rows = await db.select().from(vendorInvoicesTable);
  const vendors = [...new Set(rows.map((r) => r.vendor))].sort();
  const result = vendors.map((v) => {
    const vRows = rows.filter((r) => r.vendor === v);
    return {
      vendor: v,
      bucket0to30: vRows.filter((r) => r.ageDays <= 30).length,
      bucket30to60: vRows.filter((r) => r.ageDays > 30 && r.ageDays <= 60).length,
      bucket60plus: vRows.filter((r) => r.ageDays > 60).length,
      total: vRows.length,
    };
  });
  res.json(result);
});

router.get("/vendor-invoices/alerts", async (_req, res): Promise<void> => {
  const rows = await db.select().from(vendorInvoiceAlertsTable);
  res.json(rows);
});

router.patch("/vendor-invoices/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const { id } = req.params;
  const { action } = req.body as { action?: string };

  const statusMap: Record<string, { status: string; paymentStatus?: string }> = {
    release: { status: "Processed", paymentStatus: "Paid" },
    hold: { status: "On Hold", paymentStatus: "Unpaid" },
    processed: { status: "Processed", paymentStatus: "Unpaid" },
  };

  if (!action || !statusMap[action]) {
    res.status(400).json({ error: "Invalid action. Use: release, hold, or processed" });
    return;
  }

  const update = statusMap[action];
  const updated = await db
    .update(vendorInvoicesTable)
    .set({
      status: update.status as "Processed" | "Pending" | "On Hold",
      ...(update.paymentStatus ? { paymentStatus: update.paymentStatus as "Paid" | "Unpaid" } : {}),
    })
    .where(eq(vendorInvoicesTable.id, id))
    .returning();

  if (updated.length === 0) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }
  res.json(updated[0]);
});

const ALLOWED_STATUS = ["Processed", "Pending", "On Hold"] as const;
const ALLOWED_PAYMENT_STATUS = ["Paid", "Unpaid"] as const;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

router.patch("/vendor-invoices/:id", requireAdmin, async (req, res): Promise<void> => {
  const { id } = req.params;
  const body = req.body as Partial<{
    vendor: string;
    workNumber: string;
    serviceCategory: string;
    invoiceDate: string;
    amount: number;
    status: "Processed" | "Pending" | "On Hold";
    paymentStatus: "Paid" | "Unpaid";
    exceptionNote: string | null;
  }>;

  const update: Record<string, unknown> = {};

  if (body.vendor !== undefined) {
    if (typeof body.vendor !== "string" || body.vendor.trim() === "") {
      res.status(400).json({ error: "vendor must be a non-empty string" });
      return;
    }
    update.vendor = body.vendor.trim();
  }
  if (body.workNumber !== undefined) {
    if (typeof body.workNumber !== "string" || body.workNumber.trim() === "") {
      res.status(400).json({ error: "workNumber must be a non-empty string" });
      return;
    }
    update.workNumber = body.workNumber.trim();
  }
  if (body.serviceCategory !== undefined) {
    if (typeof body.serviceCategory !== "string" || body.serviceCategory.trim() === "") {
      res.status(400).json({ error: "serviceCategory must be a non-empty string" });
      return;
    }
    update.serviceCategory = body.serviceCategory.trim();
  }
  if (body.invoiceDate !== undefined) {
    if (typeof body.invoiceDate !== "string" || !ISO_DATE_RE.test(body.invoiceDate)) {
      res.status(400).json({ error: "invoiceDate must be in YYYY-MM-DD format" });
      return;
    }
    const ts = new Date(body.invoiceDate).getTime();
    if (Number.isNaN(ts)) {
      res.status(400).json({ error: "invoiceDate is not a valid date" });
      return;
    }
    update.invoiceDate = body.invoiceDate;
    const today = new Date().toISOString().split("T")[0];
    const diffDays = Math.floor((new Date(today).getTime() - ts) / 86400000);
    update.ageDays = Math.max(0, diffDays);
  }
  if (body.amount !== undefined) {
    if (typeof body.amount !== "number" || !Number.isFinite(body.amount) || body.amount < 0) {
      res.status(400).json({ error: "amount must be a non-negative number" });
      return;
    }
    update.amount = body.amount;
  }
  if (body.status !== undefined) {
    if (!ALLOWED_STATUS.includes(body.status as (typeof ALLOWED_STATUS)[number])) {
      res.status(400).json({ error: `status must be one of: ${ALLOWED_STATUS.join(", ")}` });
      return;
    }
    update.status = body.status;
  }
  if (body.paymentStatus !== undefined) {
    if (!ALLOWED_PAYMENT_STATUS.includes(body.paymentStatus as (typeof ALLOWED_PAYMENT_STATUS)[number])) {
      res.status(400).json({ error: `paymentStatus must be one of: ${ALLOWED_PAYMENT_STATUS.join(", ")}` });
      return;
    }
    update.paymentStatus = body.paymentStatus;
  }
  if (body.exceptionNote !== undefined) {
    if (body.exceptionNote !== null && typeof body.exceptionNote !== "string") {
      res.status(400).json({ error: "exceptionNote must be a string or null" });
      return;
    }
    const note = body.exceptionNote && body.exceptionNote.trim() !== "" ? body.exceptionNote.trim() : null;
    update.exceptionNote = note;
    update.hasException = note ? 1 : 0;
  }

  if (Object.keys(update).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  const updated = await db
    .update(vendorInvoicesTable)
    .set(update)
    .where(eq(vendorInvoicesTable.id, id))
    .returning();

  if (updated.length === 0) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }
  res.json(updated[0]);
});

router.post("/vendor-invoices", requireAdmin, async (req, res): Promise<void> => {
  const { vendor, workNumber, serviceCategory, invoiceDate, amount, exceptionNote } = req.body as {
    vendor?: string;
    workNumber?: string;
    serviceCategory?: string;
    invoiceDate?: string;
    amount?: number;
    exceptionNote?: string;
  };

  if (!vendor || !workNumber || !serviceCategory || !invoiceDate || amount == null) {
    res.status(400).json({ error: "Missing required fields: vendor, workNumber, serviceCategory, invoiceDate, amount" });
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const diffDays = Math.floor((new Date(today).getTime() - new Date(invoiceDate).getTime()) / 86400000);

  const newId = `INV-${Date.now().toString().slice(-6)}`;

  const inserted = await db
    .insert(vendorInvoicesTable)
    .values({
      id: newId,
      vendor,
      workNumber,
      serviceCategory,
      invoiceDate,
      amount,
      status: "Pending",
      paymentStatus: "Unpaid",
      ageDays: Math.max(0, diffDays),
      cycleTimeDays: null,
      hasException: exceptionNote ? 1 : 0,
      exceptionNote: exceptionNote ?? null,
    })
    .returning();

  res.status(201).json(inserted[0]);
});

export default router;
