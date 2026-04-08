import { Router, type IRouter } from "express";

const router: IRouter = Router();

function mkKpi(value: number, formatted: string, change: number, status: "green" | "yellow" | "red", trend: "up" | "down" | "flat") {
  return { value, formatted, change, changeLabel: `${change > 0 ? "+" : ""}${change}% vs yesterday`, status, trend };
}

router.get("/members/kpis", async (_req, res): Promise<void> => {
  res.json({
    totalActiveMembers: mkKpi(4287341, "4,287,341", 0.3, "green", "up"),
    newEnrollmentsToday: mkKpi(1842, "1,842", 12.4, "green", "up"),
    newEnrollmentsWeek: mkKpi(9217, "9,217", 4.2, "green", "up"),
    newEnrollmentsMonth: mkKpi(38450, "38,450", 7.8, "green", "up"),
    terminations: mkKpi(634, "634", -5.1, "green", "down"),
    exceptionQueueSize: mkKpi(847, "847", 22.3, "yellow", "up"),
    idCardsPending: mkKpi(2341, "2,341", 8.7, "yellow", "up"),
    eligibilityLatency: mkKpi(1.8, "1.8 sec", 12.5, "yellow", "up"),
  });
});

router.get("/members/enrollments", async (_req, res): Promise<void> => {
  const daily = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split("T")[0],
      enrollments: 1400 + Math.floor(Math.random() * 700),
      terminations: 500 + Math.floor(Math.random() * 300),
    };
  });

  const weekly = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (11 - i) * 7);
    return {
      date: `Week of ${date.toISOString().split("T")[0]}`,
      enrollments: 8500 + Math.floor(Math.random() * 2000),
      terminations: 3000 + Math.floor(Math.random() * 1000),
    };
  });

  const monthly = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return {
      date: date.toLocaleString("default", { month: "short", year: "2-digit" }),
      enrollments: 34000 + Math.floor(Math.random() * 8000),
      terminations: 12000 + Math.floor(Math.random() * 4000),
    };
  });

  res.json({ daily, weekly, monthly });
});

router.get("/members/by-product", async (_req, res): Promise<void> => {
  res.json([
    { product: "Commercial", count: 2141670, percentage: 49.9, change: 1.2 },
    { product: "Medicare Advantage", count: 944216, percentage: 22.0, change: 3.4 },
    { product: "Medicaid", count: 728847, percentage: 17.0, change: -0.8 },
    { product: "Exchange / ACA", count: 472608, percentage: 11.0, change: 5.7 },
    { product: "Federal Employee", count: 0, percentage: 0, change: 0 },
  ].filter(p => p.count > 0));
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
  const types = ["Missing SSN", "Duplicate Member ID", "Coverage Gap", "Invalid DOB", "Address Verification Failed", "Plan Code Mismatch", "Dependent Age Override", "Retroactive Change"];
  const products = ["Commercial", "Medicare Advantage", "Medicaid", "Exchange"];
  const statuses = ["Pending Review", "In Progress", "Escalated", "Awaiting Member"];
  const priorities: ("high" | "medium" | "low")[] = ["high", "medium", "low"];

  const exceptions = Array.from({ length: 20 }, (_, i) => ({
    id: `EXC-${String(i + 1001).padStart(5, "0")}`,
    memberId: `HBC${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
    memberName: `Member ${i + 1}`,
    exceptionType: types[Math.floor(Math.random() * types.length)],
    product: products[Math.floor(Math.random() * products.length)],
    ageDays: Math.floor(Math.random() * 30) + 1,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
  }));

  res.json(exceptions);
});

export default router;
