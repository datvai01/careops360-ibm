import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import { logger } from "../lib/logger";
import { getSessionUser } from "./auth";
import {
  DATASET_REGISTRY,
  getAllDatasetMeta,
  getDatasetMeta,
  saveDatasetUpload,
  getDatasetFilePath,
} from "../lib/adminDatasets";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

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

router.use("/admin/datasets", requireAdmin);

router.get("/admin/datasets", (_req, res) => {
  const meta = getAllDatasetMeta();
  const merged = DATASET_REGISTRY.map((def) => {
    const m = meta.find((x) => x.key === def.key)!;
    return { ...def, ...m };
  });
  res.json({ datasets: merged });
});

router.get("/admin/datasets/:key/metadata", (req, res) => {
  const def = DATASET_REGISTRY.find((d) => d.key === req.params.key);
  if (!def) {
    res.status(404).json({ error: "Unknown dataset" });
    return;
  }
  res.json({ ...def, ...getDatasetMeta(req.params.key) });
});

router.post("/admin/datasets/:key/upload", upload.single("file"), (req, res) => {
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
    const meta = saveDatasetUpload(req.params.key, req.file.buffer, req.file.originalname, uploader);
    logger.info({ key: req.params.key, uploader, file: req.file.originalname, version: meta.version }, "admin dataset uploaded");
    res.json({ success: true, meta: { ...def, ...meta } });
  } catch (err) {
    logger.error({ err }, "admin dataset upload failed");
    res.status(500).json({ error: err instanceof Error ? err.message : "Upload failed" });
  }
});

router.get("/admin/datasets/:key/download", (req, res) => {
  const found = getDatasetFilePath(req.params.key);
  if (!found) {
    res.status(404).json({ error: "No file uploaded for this dataset yet" });
    return;
  }
  res.download(found.fullPath, found.meta.sourceFilename || found.meta.storedFilename || "dataset.bin");
});

export default router;
