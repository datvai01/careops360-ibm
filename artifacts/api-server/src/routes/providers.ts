import { Router, type IRouter } from "express";

const router: IRouter = Router();

function mkKpi(value: number, formatted: string, change: number, status: "green" | "yellow" | "red", trend: "up" | "down" | "flat") {
  return { value, formatted, change, changeLabel: `${change > 0 ? "+" : ""}${change}% vs yesterday`, status, trend };
}

router.get("/providers/kpis", async (_req, res): Promise<void> => {
  res.json({
    onboardingRequests: mkKpi(142, "142", 8.4, "yellow", "up"),
    directoryUpdates: mkKpi(2841, "2,841", -3.2, "green", "down"),
    credentialingPending: mkKpi(387, "387", 12.1, "yellow", "up"),
    openTickets: mkKpi(412, "412", -8.3, "green", "down"),
    disputeCases: mkKpi(87, "87", 4.8, "yellow", "up"),
    contractLoads: mkKpi(24, "24", 33.3, "yellow", "up"),
  });
});

router.get("/providers/list", async (req, res): Promise<void> => {
  const page = parseInt(String(req.query.page ?? "1"));
  const statuses: ("active" | "pending" | "suspended" | "terminated")[] = ["active", "active", "active", "active", "pending", "pending", "suspended"];
  const specialties = ["Internal Medicine", "Cardiology", "Orthopedic Surgery", "Family Medicine", "Oncology", "Neurology", "Psychiatry", "Radiology", "Obstetrics", "Pediatrics"];
  const credStatuses = ["Credentialed", "Credentialed", "Credentialed", "Pending Review", "Initial Application", "Expired - Renewal Pending"];

  const providerNames = [
    "Atlantic Health System",
    "RWJBarnabas Health",
    "Hackensack Meridian Health",
    "St. Barnabas Medical Center",
    "Cooper University Hospital",
    "Virtua Health System",
    "Valley Health System",
    "Holy Name Medical Center",
    "Morristown Medical Center",
    "Jersey Shore University Medical Center",
    "CarePoint Health",
    "Bergen New Bridge Medical Center",
    "Robert Wood Johnson University Hospital",
    "Newark Beth Israel Medical Center",
    "Trinitas Regional Medical Center",
  ];

  const providers = providerNames.map((name, i) => ({
    providerId: `PRV${String(i + 10001).padStart(6, "0")}`,
    providerName: name,
    npi: String(Math.floor(Math.random() * 9000000000) + 1000000000),
    specialty: specialties[Math.floor(Math.random() * specialties.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    credentialingStatus: credStatuses[Math.floor(Math.random() * credStatuses.length)],
    openClaims: Math.floor(Math.random() * 500) + 10,
    openTickets: Math.floor(Math.random() * 20),
    lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString().split("T")[0],
  }));

  res.json({ providers, total: providerNames.length, page });
});

router.get("/providers/issues", async (_req, res): Promise<void> => {
  res.json([
    { issueType: "Claims Billing Errors", count: 187, trend: "up", priority: "high" },
    { issueType: "Directory Information Outdated", count: 142, trend: "flat", priority: "medium" },
    { issueType: "Credentialing Delays", count: 98, trend: "up", priority: "high" },
    { issueType: "Contract Rate Disputes", count: 87, trend: "up", priority: "high" },
    { issueType: "Portal Access Issues", count: 64, trend: "down", priority: "medium" },
    { issueType: "ERA/EFT Setup", count: 41, trend: "flat", priority: "low" },
    { issueType: "Prior Auth Denials Appeals", count: 38, trend: "up", priority: "medium" },
  ]);
});

export default router;
