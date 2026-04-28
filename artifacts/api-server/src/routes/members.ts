import { Router, type IRouter } from "express";
import { db, memberEnrollmentsTable, memberExceptionsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { fetchPageKpis } from "../lib/kpiHelper";

const router: IRouter = Router();

router.get("/members/kpis", async (_req, res): Promise<void> => {
  const kpis = await fetchPageKpis("members");
  res.json(kpis);
});

router.get("/members/enrollments", async (_req, res): Promise<void> => {
  const all = await db
    .select()
    .from(memberEnrollmentsTable)
    .orderBy(asc(memberEnrollmentsTable.id));

  const daily = all
    .filter((r) => r.periodType === "daily")
    .map((r) => ({ date: r.periodLabel, enrollments: r.enrollments, terminations: r.terminations }));

  const weekly = all
    .filter((r) => r.periodType === "weekly")
    .map((r) => ({ date: r.periodLabel, enrollments: r.enrollments, terminations: r.terminations }));

  const monthly = all
    .filter((r) => r.periodType === "monthly")
    .map((r) => ({ date: r.periodLabel, enrollments: r.enrollments, terminations: r.terminations }));

  res.json({ daily, weekly, monthly });
});

router.get("/members/by-product", async (_req, res): Promise<void> => {
  res.json([
    { product: "Commercial", count: 2141670, percentage: 49.9, change: 1.2 },
    { product: "Medicare Advantage", count: 944216, percentage: 22.0, change: 3.4 },
    { product: "Medicaid", count: 728847, percentage: 17.0, change: -0.8 },
    { product: "Exchange / ACA", count: 472608, percentage: 11.0, change: 5.7 },
  ]);
});

router.get("/members/by-region", async (_req, res): Promise<void> => {
  res.json([
    { region: "Northern NJ", count: 1328876, percentage: 31.0 },
    { region: "Central NJ", count: 1157581, percentage: 27.0 },
    { region: "Southern NJ", count: 900342, percentage: 21.0 },
    { region: "Metro NY", count: 686174, percentage: 16.0 },
    { region: "Delaware Valley", count: 214368, percentage: 5.0 },
  ]);
});

router.get("/members/exceptions", async (_req, res): Promise<void> => {
  const exceptions = await db
    .select()
    .from(memberExceptionsTable)
    .orderBy(asc(memberExceptionsTable.id));

  res.json(exceptions);
});

export default router;
