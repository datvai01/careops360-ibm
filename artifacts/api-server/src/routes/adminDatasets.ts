import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import { logger } from "../lib/logger";
import { getSessionUser } from "./auth";
import {
  DATASET_REGISTRY,
  getAllDatasetMeta,
  getDatasetMeta,
  saveDatasetUpload,
  hasImporter,
  buildTemplateForKey,
  runImporterForKey,
} from "../lib/adminDatasets";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

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

// Read-only metadata endpoints — available to any authenticated user so the
// "Last refreshed" widget can render for exec / ibm roles too.
router.get("/admin/datasets", requireAuth, (_req, res) => {
  const meta = getAllDatasetMeta();
  const merged = DATASET_REGISTRY.map((def) => {
    const m = meta.find((x) => x.key === def.key)!;
    return { ...def, ...m, hasImporter: hasImporter(def.key), hasTemplate: hasImporter(def.key) };
  });
  res.json({ datasets: merged });
});

router.get("/admin/datasets/:key/metadata", requireAuth, (req, res) => {
  const def = DATASET_REGISTRY.find((d) => d.key === req.params.key);
  if (!def) {
    res.status(404).json({ error: "Unknown dataset" });
    return;
  }
  res.json({ ...def, ...getDatasetMeta(req.params.key) });
});

// Write & template endpoints stay admin-only.
router.post("/admin/datasets/:key/upload", requireAdmin, upload.single("file"), async (req, res) => {
  try {
    const def = DATASET_REGISTRY.find((d) => d.key === req.params.key);
    if (!def) {
      res.status(404).json({ error: "Unknown dataset" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const sessionUser = (req as Request & { sessionUser: { email: string } }).sessionUser;
    const uploader = sessionUser?.email || "unknown";

    const reportMonthRaw = typeof req.body?.reportMonth === "string" ? req.body.reportMonth.trim() : "";
    if (reportMonthRaw && !/^[A-Za-z]{3} \d{4}$/.test(reportMonthRaw)) {
      res.status(400).json({ error: "reportMonth must be in 'Mon YYYY' format, e.g. 'Jun 2026'" });
      return;
    }

    let importResults: { results?: unknown; totalRows?: number; warnings?: string[] } = {};
    if (hasImporter(req.params.key)) {
      const out = await runImporterForKey(req.params.key, req.file.buffer, reportMonthRaw ? { defaultReportMonth: reportMonthRaw } : undefined);
      if (!out.ok) {
        logger.warn(
          { key: req.params.key, uploader, errors: out.validationErrors?.length, warnings: out.warnings?.length },
          "admin dataset import rejected",
        );
        res.status(400).json({
          error: out.error || "Import failed",
          validationErrors: out.validationErrors || [],
          warnings: out.warnings || [],
        });
        return;
      }
      importResults = { results: out.results, totalRows: out.totalRows, warnings: out.warnings };
    }

    const meta = saveDatasetUpload(req.params.key, req.file.buffer, req.file.originalname, uploader);
    logger.info(
      { key: req.params.key, uploader, file: req.file.originalname, version: meta.version, totalRows: importResults.totalRows },
      "admin dataset uploaded",
    );
    res.json({ success: true, meta: { ...def, ...meta }, ...importResults });
  } catch (err) {
    logger.error({ err }, "admin dataset upload failed");
    res.status(500).json({ error: err instanceof Error ? err.message : "Upload failed" });
  }
});

router.get("/admin/datasets/:key/template", async (req, res) => {
  try {
    const def = DATASET_REGISTRY.find((d) => d.key === req.params.key);
    if (!def) {
      res.status(404).json({ error: "Unknown dataset" });
      return;
    }
    const buf = await buildTemplateForKey(req.params.key);
    if (!buf) {
      res.status(404).json({ error: "No template available for this dataset yet" });
      return;
    }
    const fname = `${def.label.replace(/[^a-zA-Z0-9]+/g, "_")}_Template.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${fname}"`);
    res.setHeader("Cache-Control", "no-store");
    res.send(buf);
  } catch (err) {
    logger.error({ err }, "admin dataset template generation failed");
    res.status(500).json({ error: err instanceof Error ? err.message : "Template generation failed" });
  }
});

export default router;
