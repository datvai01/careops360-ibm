import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import { getSessionUser } from "./auth";

const router: IRouter = Router();

export const FEATURE_REGISTRY = [
  { key: "executive-overview", name: "Executive Overview", path: "/dashboard", group: "Overview", locked: true },
  { key: "app-health", name: "App Health", path: "/dashboard/app-health", group: "Overview" },
  { key: "enrollment-intelligence", name: "Member & Enrollment Ops", path: "/dashboard/enrollment-intelligence", group: "Member & Care Operations" },
  { key: "claims", name: "Claims", path: "/dashboard/claims", group: "Member & Care Operations" },
  { key: "prior-auth", name: "Prior Auth", path: "/dashboard/prior-auth", group: "Member & Care Operations" },
  { key: "providers", name: "Providers", path: "/dashboard/providers", group: "Member & Care Operations" },
  { key: "account-management", name: "Account Management", path: "/dashboard/account-management", group: "Operations & Support" },
  { key: "member-services", name: "Member Services", path: "/dashboard/member-services", group: "Operations & Support" },
  { key: "ibm-ams", name: "AIOps & Service KPIs", path: "/dashboard/ibm-ams", group: "Value & Insights" },
  { key: "digital-roadmap", name: "Transformation Roadmap", path: "/dashboard/digital-roadmap", group: "Value & Insights" },
  { key: "transition", name: "Transition Timeline", path: "/dashboard/transition", group: "Value & Insights" },
  { key: "transformation-mindset", name: "Mindset Survey", path: "/dashboard/transformation-mindset", group: "Value & Insights" },
  { key: "capability-uplift", name: "Skills & Enablement", path: "/dashboard/capability-uplift", group: "Value & Insights" },
  { key: "autonomous-agents", name: "Autonomous Agents", path: "/dashboard/autonomous-agents", group: "Value & Insights" },
  { key: "transformation-initiatives", name: "Transformation Initiatives", path: "/dashboard/transformation-initiatives", group: "Value & Insights" },
  { key: "knowledge", name: "Knowledge Base", path: "/dashboard/knowledge", group: "Assistant" },
  { key: "teams-bot", name: "Teams Bot (Preview)", path: "/dashboard/teams-bot", group: "Assistant" },
  { key: "ask", name: "Ask Assistant", path: "/dashboard/ask", group: "Assistant" },
  { key: "help", name: "Help & Walkthrough", path: "/dashboard/help", group: "Resources" },
] as const;

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const user = getSessionUser(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "No valid session" });
    return;
  }
  (req as Request & { sessionUser: typeof user }).sessionUser = user;
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
  (req as Request & { sessionUser: typeof user }).sessionUser = user;
  next();
}

router.get("/feature-toggles", requireAuth, async (_req, res): Promise<void> => {
  const result = await pool.query<{
    feature_key: string;
    enabled: boolean;
    updated_at: Date;
    updated_by: string | null;
  }>("SELECT feature_key, enabled, updated_at, updated_by FROM feature_toggles");
  const byKey = new Map(result.rows.map((row) => [row.feature_key, row]));
  res.json({
    features: FEATURE_REGISTRY.map((feature) => ({
      ...feature,
      enabled: byKey.get(feature.key)?.enabled ?? true,
      updatedAt: byKey.get(feature.key)?.updated_at ?? null,
      updatedBy: byKey.get(feature.key)?.updated_by ?? null,
    })),
  });
});

router.patch("/feature-toggles/:key", requireAdmin, async (req, res): Promise<void> => {
  const feature = FEATURE_REGISTRY.find((item) => item.key === req.params.key);
  if (!feature) {
    res.status(404).json({ error: "Unknown feature" });
    return;
  }
  if ("locked" in feature && feature.locked) {
    res.status(400).json({ error: "This recovery feature must remain enabled" });
    return;
  }
  if (typeof req.body?.enabled !== "boolean") {
    res.status(400).json({ error: "enabled must be a boolean" });
    return;
  }

  const user = (req as Request & { sessionUser: NonNullable<ReturnType<typeof getSessionUser>> }).sessionUser;
  const result = await pool.query<{
    feature_key: string;
    enabled: boolean;
    updated_at: Date;
    updated_by: string | null;
  }>(
    `INSERT INTO feature_toggles (feature_key, enabled, updated_at, updated_by)
     VALUES ($1, $2, now(), $3)
     ON CONFLICT (feature_key) DO UPDATE
     SET enabled = EXCLUDED.enabled, updated_at = now(), updated_by = EXCLUDED.updated_by
     RETURNING feature_key, enabled, updated_at, updated_by`,
    [feature.key, req.body.enabled, user.email],
  );
  const saved = result.rows[0];
  res.json({
    feature: {
      ...feature,
      enabled: saved.enabled,
      updatedAt: saved.updated_at,
      updatedBy: saved.updated_by,
    },
  });
});

export default router;