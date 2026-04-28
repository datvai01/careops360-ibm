import { Router, type IRouter } from "express";
import express from "express";
import {
  getTalentPlan,
  getTalentPlanMeta,
  saveTalentPlan,
  parseTalentPlanWorkbook,
  buildTalentPlanTemplate,
} from "../lib/talentPlan";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/talent-plan", async (_req, res) => {
  try {
    const data = await getTalentPlan();
    res.setHeader("Cache-Control", "no-store");
    res.json(data);
  } catch (err) {
    logger.error({ err }, "talent-plan: failed to read data");
    res.status(500).json({ error: "Failed to load talent plan data." });
  }
});

router.get("/talent-plan/metadata", async (_req, res) => {
  try {
    const meta = await getTalentPlanMeta();
    res.setHeader("Cache-Control", "no-store");
    res.json(meta);
  } catch (err) {
    logger.error({ err }, "talent-plan: failed to read metadata");
    res.status(500).json({ error: "Failed to load talent plan metadata." });
  }
});

router.get("/talent-plan/template", async (_req, res) => {
  try {
    const buf = await buildTalentPlanTemplate();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Talent_Plan_Template.xlsx"`,
    );
    res.setHeader("Cache-Control", "no-store");
    res.send(buf);
  } catch (err) {
    logger.error({ err }, "talent-plan: template generation failed");
    res.status(500).json({ error: "Failed to generate template." });
  }
});

router.post(
  "/talent-plan/upload",
  express.raw({
    type: () => true,
    limit: "20mb",
  }),
  async (req, res) => {
    try {
      const buf: Buffer | undefined = req.body;
      if (!buf || !Buffer.isBuffer(buf) || buf.length === 0) {
        return res.status(400).json({
          error:
            "No file received. Send the .xlsx file as the request body with Content-Type: application/octet-stream.",
        });
      }
      const filename = (req.header("X-Filename") || "uploaded.xlsx").replace(
        /[^\w.\-]/g,
        "_",
      );
      const uploader = req.header("X-Uploader") || "unknown";

      const { data, warnings } = parseTalentPlanWorkbook(buf);

      if (data.resources.length === 0 && data.products.length === 0) {
        return res.status(400).json({
          error:
            "Workbook parsed but contained no resource or product rows. Please verify the template format.",
          warnings,
        });
      }

      const meta = await saveTalentPlan(data, uploader, filename);
      logger.info(
        { uploader, filename, version: meta.version, resources: meta.resourceCount },
        "talent-plan: refreshed",
      );
      return res.json({
        success: true,
        meta,
        warnings,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown parse error";
      logger.error({ err }, "talent-plan: upload failed");
      return res.status(400).json({ error: message });
    }
  },
);

export default router;
