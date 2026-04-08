import { Router, type IRouter } from "express";

const router: IRouter = Router();

function mkKpi(value: number, formatted: string, change: number, status: "green" | "yellow" | "red", trend: "up" | "down" | "flat") {
  return { value, formatted, change, changeLabel: `${change > 0 ? "+" : ""}${change}% vs yesterday`, status, trend };
}

router.get("/contactcenter/kpis", async (_req, res): Promise<void> => {
  res.json({
    callsReceived: mkKpi(8421, "8,421", 5.2, "yellow", "up"),
    avgWaitTime: mkKpi(47, "47 sec", 56.7, "red", "up"),
    abandonmentRate: mkKpi(8.2, "8.2%", 37.0, "red", "up"),
    firstCallResolution: mkKpi(72.4, "72.4%", -4.7, "yellow", "down"),
    casesOpened: mkKpi(1247, "1,247", 8.1, "yellow", "up"),
    casesResolved: mkKpi(1084, "1,084", 2.4, "green", "up"),
    memberComplaints: mkKpi(87, "87", 12.8, "yellow", "up"),
    chatbotContainment: mkKpi(41.2, "41.2%", 8.4, "green", "up"),
    digitalAdoption: mkKpi(34.7, "34.7%", 3.1, "green", "up"),
  });
});

router.get("/contactcenter/call-reasons", async (_req, res): Promise<void> => {
  res.json([
    { reason: "Benefits & Coverage Inquiry", count: 1842, percentage: 21.9, trend: "flat" },
    { reason: "Claims Status Check", count: 1687, percentage: 20.0, trend: "up" },
    { reason: "Prior Authorization Status", count: 1241, percentage: 14.7, trend: "up" },
    { reason: "ID Card / Documents Request", count: 842, percentage: 10.0, trend: "down" },
    { reason: "Provider Network Inquiry", count: 714, percentage: 8.48, trend: "flat" },
    { reason: "Billing & Payment Issues", count: 612, percentage: 7.27, trend: "up" },
    { reason: "Enrollment Changes", count: 487, percentage: 5.78, trend: "flat" },
    { reason: "Prescription Drug Coverage", count: 412, percentage: 4.89, trend: "up" },
    { reason: "Appeals & Grievances", count: 341, percentage: 4.05, trend: "up" },
    { reason: "Other", count: 241, percentage: 2.86, trend: "flat" },
  ]);
});

router.get("/contactcenter/hourly-volume", async (_req, res): Promise<void> => {
  const hours = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8;
    const label = `${hour}:00 ${hour < 12 ? "AM" : "PM"}`.replace("12:00 PM", "12:00 PM").replace("13:00 PM", "1:00 PM");
    const isBusy = hour >= 10 && hour <= 14;
    return {
      hour: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`,
      calls: isBusy ? Math.floor(Math.random() * 400) + 600 : Math.floor(Math.random() * 300) + 200,
      chats: isBusy ? Math.floor(Math.random() * 150) + 200 : Math.floor(Math.random() * 100) + 80,
      emails: Math.floor(Math.random() * 80) + 40,
    };
  });
  res.json(hours);
});

export default router;
