import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dist/ → api-server/ → artifacts/ → workspace/ → attached_assets/
const assetsDir = path.resolve(__dirname, "../../../attached_assets");

const FILES: Record<string, { file: string; mime: string; name: string }> = {
  "ams-exec-summary": {
    file: "IBM_Horizon_AMS_Executive_Summary_April2026.docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    name: "IBM_Horizon_AMS_Executive_Summary_April2026.docx",
  },
};

router.get("/downloads/:key", (req, res) => {
  const entry = FILES[req.params.key];
  if (!entry) return res.status(404).json({ error: "File not found" });

  const filePath = path.join(assetsDir, entry.file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not generated yet — run the generation script first." });
  }

  res.setHeader("Content-Type", entry.mime);
  res.setHeader("Content-Disposition", `attachment; filename="${entry.name}"`);
  res.setHeader("Cache-Control", "no-store");
  fs.createReadStream(filePath).pipe(res);
});

export default router;
