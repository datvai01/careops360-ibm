#!/usr/bin/env node
/**
 * Build the "Horizon Operations Talent Transformation Plan" PowerPoint
 * deck from the parsed Talent Plan data and live dashboard screenshots.
 *
 * Output: ./Horizon_Talent_Transformation_Plan.pptx
 *
 * Usage:
 *   node scripts/generate-talent-pptx.mjs                # captures fresh screenshots
 *   node scripts/generate-talent-pptx.mjs --skip-shots   # reuses any cached shots
 */

import { readFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PptxGenJS from "pptxgenjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT, "artifacts/api-server/data/talentPlan.json");
const SHOT_DIR = path.join(ROOT, "screenshots/talent-deck");
const OUT_PATH = path.join(ROOT, "Horizon_Talent_Transformation_Plan.pptx");

const SHOTS = {
  product:  path.join(SHOT_DIR, "product-treemap.png"),
  role:     path.join(SHOT_DIR, "role-transformation.png"),
  skill:    path.join(SHOT_DIR, "skill-heatmap.png"),
};

const skipShots = process.argv.includes("--skip-shots");

// ---------- IBM colour palette ----------
const C = {
  ibmBlue:    "0F62FE",
  navy:       "002D9C",
  ink:        "161616",
  ash:        "525252",
  gray20:     "C6C7C7",
  gray10:     "E0E0E0",
  bg:         "F4F4F4",
  white:      "FFFFFF",
  accentTeal: "009D9A",
  accentGrn:  "24A148",
  accentOrn:  "FF832B",
  accentPur:  "8A3FFC",
  accentRed:  "DA1E28",
  accentYel:  "F1C21B",
};

const FONT = "Calibri";

// ---------- Capture dashboard screenshots ----------
async function captureScreenshots() {
  mkdirSync(SHOT_DIR, { recursive: true });

  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  // Allow overrides via env so credentials are not strictly hardcoded.
  // Defaults are the project's documented demo credentials.
  const BASE  = process.env.HORIZON_BASE_URL || "http://localhost:80";
  const EMAIL = process.env.HORIZON_EMAIL    || "exec@horizon.com";
  const PASS  = process.env.HORIZON_PASSWORD || "Horizon&IBM2026";

  console.log("• Logging into dashboard...");
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  // Wait for the SPA to render the login form
  await page.waitForSelector('#username', { timeout: 30000 });
  await page.fill('#username', EMAIL);
  await page.fill('#password', PASS);
  await Promise.all([
    page.waitForURL(/\/dashboard/, { timeout: 30000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(2000);

  await page.goto(`${BASE}/dashboard/capability-uplift`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(2500);
  // Open the outer "Talent Plan" tab
  await page.getByRole("tab", { name: /Talent Plan/i }).first().click().catch(() => {});
  await page.waitForTimeout(2000);

  async function snap(tabName, file) {
    await page.getByRole("tab", { name: new RegExp(tabName, "i") }).first().click();
    await page.waitForTimeout(3000);
    // Capture the tab content area, falling back to the full page if missing
    const target = await page.$('[role="tabpanel"][data-state="active"]');
    if (target) {
      await target.screenshot({ path: file });
    } else {
      await page.screenshot({ path: file, fullPage: false });
    }
    console.log(`  ✓ ${path.basename(file)}`);
  }

  console.log("• Capturing screenshots...");
  await snap("Skill Readiness Heatmap", SHOTS.skill);
  await snap("Product-Based Talent View", SHOTS.product);
  await snap("Role Transformation View", SHOTS.role);

  await browser.close();
}

// ---------- Compute KPIs from the data ----------
function computeStats(resources) {
  const byRole = {};
  const byLocation = { Onshore: 0, Offshore: 0 };
  for (const r of resources) {
    byRole[r.role] = (byRole[r.role] || 0) + 1;
    if (r.location === "Onshore" || r.location === "Offshore") {
      byLocation[r.location]++;
    }
  }
  const skillField = (field) => {
    const filled = resources.filter(r => {
      const v = r.plan?.[field];
      return v && String(v).trim() && String(v).toLowerCase() !== "na";
    }).length;
    return Math.round((filled / Math.max(1, resources.length)) * 100);
  };
  return {
    total: resources.length,
    byRole,
    byLocation,
    skillCoverage: {
      Industry:    skillField("industry"),
      Agile:       skillField("agile"),
      "Agentic AI":skillField("agentic"),
      DevSecOps:   skillField("devsecops") || skillField("devops"),
      AIOps:       skillField("aiops"),
      "Future Stack": skillField("futureTech"),
    },
  };
}

// ---------- Reusable slide helpers ----------
function addHeader(slide, pres, title, eyebrow) {
  // Top accent bar
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.18, fill: { color: C.ibmBlue }, line: { color: C.ibmBlue },
  });
  if (eyebrow) {
    slide.addText(eyebrow, {
      x: 0.5, y: 0.32, w: 12, h: 0.3,
      fontFace: FONT, fontSize: 10, color: C.ibmBlue, bold: true,
      charSpacing: 4,
    });
  }
  slide.addText(title, {
    x: 0.5, y: eyebrow ? 0.58 : 0.4, w: 12.3, h: 0.65,
    fontFace: FONT, fontSize: 26, color: C.ink, bold: true,
  });
  // Divider line under header
  slide.addShape(pres.ShapeType.line, {
    x: 0.5, y: 1.32, w: 12.33, h: 0,
    line: { color: C.gray20, width: 0.75 },
  });
}

function addFooter(slide, pres, slideNo, total) {
  slide.addShape(pres.ShapeType.line, {
    x: 0.5, y: 7.0, w: 12.33, h: 0,
    line: { color: C.gray20, width: 0.5 },
  });
  slide.addText("IBM Confidential", {
    x: 0.5, y: 7.05, w: 4, h: 0.3, fontFace: FONT, fontSize: 9, color: C.ash,
  });
  slide.addText("Horizon Operations Talent Transformation Plan", {
    x: 4.5, y: 7.05, w: 5, h: 0.3, fontFace: FONT, fontSize: 9, color: C.ash, align: "center",
  });
  slide.addText(`${slideNo} / ${total}`, {
    x: 11.0, y: 7.05, w: 1.83, h: 0.3, fontFace: FONT, fontSize: 9, color: C.ash, align: "right",
  });
}

// ---------- Build the deck ----------
function buildDeck(data) {
  const stats = computeStats(data.resources);
  const TOTAL_SLIDES = 8;

  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 inches
  pres.title = "Horizon Operations Talent Transformation Plan";
  pres.author = "IBM Consulting";
  pres.company = "IBM";
  pres.subject = "Product-Based Talent Strategy for AI-Led Operations";

  // ============================================================ Slide 1
  const s1 = pres.addSlide();
  s1.background = { color: C.white };
  // Big left blue band
  s1.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 4.6, h: 7.5, fill: { color: C.ibmBlue }, line: { color: C.ibmBlue },
  });
  // Diagonal accent shapes
  s1.addShape(pres.ShapeType.rect, {
    x: 4.6, y: 0, w: 0.18, h: 7.5, fill: { color: C.navy }, line: { color: C.navy },
  });
  // IBM eyebrow on white side
  s1.addText("IBM", {
    x: 5.0, y: 0.7, w: 3, h: 0.6,
    fontFace: FONT, fontSize: 28, bold: true, color: C.ink, charSpacing: 4,
  });
  s1.addText("HORIZON BCBS", {
    x: 5.0, y: 1.18, w: 5, h: 0.4,
    fontFace: FONT, fontSize: 11, color: C.ash, bold: true, charSpacing: 6,
  });

  // Vertical eyebrow on blue band
  s1.addText("APRIL 2026", {
    x: 0.5, y: 0.55, w: 3.5, h: 0.4,
    fontFace: FONT, fontSize: 10, color: C.white, bold: true, charSpacing: 6,
  });
  s1.addText("CONFIDENTIAL", {
    x: 0.5, y: 6.85, w: 3.5, h: 0.4,
    fontFace: FONT, fontSize: 9, color: C.white, charSpacing: 6,
  });

  // Title
  s1.addText("Horizon Operations\nTalent Transformation Plan", {
    x: 5.0, y: 2.2, w: 7.8, h: 1.8,
    fontFace: FONT, fontSize: 36, bold: true, color: C.ink,
  });
  // Subtitle
  s1.addText("Product-Based Talent Strategy for AI-Led Operations", {
    x: 5.0, y: 3.85, w: 7.8, h: 0.7,
    fontFace: FONT, fontSize: 18, color: C.ibmBlue,
  });

  // Pillar lockup on blue
  const pillars = ["Product-Aligned", "AI-Assisted", "AIOps-Driven", "DevSecOps", "Healthcare Domain"];
  pillars.forEach((p, i) => {
    s1.addText(p, {
      x: 0.5, y: 2.6 + i * 0.55, w: 3.7, h: 0.45,
      fontFace: FONT, fontSize: 14, color: C.white, bold: true,
    });
  });

  // Portal access box
  s1.addShape(pres.ShapeType.rect, {
    x: 5.0, y: 5.05, w: 7.8, h: 1.55,
    fill: { color: C.bg }, line: { color: C.gray20, width: 0.5 },
  });
  s1.addText("PORTAL ACCESS FOR REFERENCE", {
    x: 5.2, y: 5.18, w: 7.4, h: 0.3,
    fontFace: FONT, fontSize: 10, color: C.ibmBlue, bold: true, charSpacing: 4,
  });
  s1.addText([
    { text: "URL:  ", options: { bold: true, color: C.ink } },
    { text: "https://horizon-payer.replit.app   (CareOps360 Portal)\n", options: { color: C.ash } },
    { text: "User: ", options: { bold: true, color: C.ink } },
    { text: "exec@horizon.com    ", options: { color: C.ash } },
    { text: "Pwd: ", options: { bold: true, color: C.ink } },
    { text: "Horizon&IBM2026\n", options: { color: C.ash } },
    { text: "Path: ", options: { bold: true, color: C.ink } },
    { text: "Dashboard → Capability Uplift → Talent Plan", options: { color: C.ash } },
  ], {
    x: 5.2, y: 5.5, w: 7.5, h: 1.0,
    fontFace: FONT, fontSize: 12,
  });

  addFooter(s1, pres, 1, TOTAL_SLIDES);

  // ============================================================ Slide 2
  const s2 = pres.addSlide();
  s2.background = { color: C.white };
  addHeader(s2, pres, "IBM's Talent Transformation Strategy", "EXECUTIVE SUMMARY");

  const s2Bullets = [
    {
      h: "Shift to Product-Based Operations",
      d: "Move from role-based application support to product-aligned teams with end-to-end ownership of business outcomes.",
      c: C.ibmBlue,
    },
    {
      h: "Embed AI, AIOps, and Automation",
      d: "Bake GenAI, agentic workflows, AIOps and DevSecOps into the operating model — not as add-ons, but as defaults.",
      c: C.accentTeal,
    },
    {
      h: `Upskill ${stats.total} Resources Across the Stack`,
      d: "Structured 6-month plan covering technology, healthcare domain depth, and AI-first ways of working.",
      c: C.accentPur,
    },
    {
      h: "Faster Delivery, Higher Resiliency, Lower Cost",
      d: "Predictable releases, fewer incidents, automated remediation, and re-investable run savings — measured in business KPIs.",
      c: C.accentGrn,
    },
  ];
  s2Bullets.forEach((b, i) => {
    const x = 0.5 + (i % 2) * 6.2;
    const y = 1.65 + Math.floor(i / 2) * 2.5;
    s2.addShape(pres.ShapeType.rect, {
      x, y, w: 5.95, h: 2.25, fill: { color: C.white }, line: { color: C.gray20, width: 0.75 },
    });
    s2.addShape(pres.ShapeType.rect, {
      x, y, w: 0.12, h: 2.25, fill: { color: b.c }, line: { color: b.c },
    });
    s2.addText(`0${i + 1}`, {
      x: x + 0.35, y: y + 0.2, w: 1, h: 0.4,
      fontFace: FONT, fontSize: 12, color: b.c, bold: true, charSpacing: 4,
    });
    s2.addText(b.h, {
      x: x + 0.35, y: y + 0.55, w: 5.4, h: 0.55,
      fontFace: FONT, fontSize: 17, color: C.ink, bold: true,
    });
    s2.addText(b.d, {
      x: x + 0.35, y: y + 1.15, w: 5.4, h: 1.0,
      fontFace: FONT, fontSize: 12, color: C.ash, valign: "top",
    });
  });

  addFooter(s2, pres, 2, TOTAL_SLIDES);

  // ============================================================ Slide 3
  const s3 = pres.addSlide();
  s3.background = { color: C.white };
  addHeader(s3, pres, "Current Workforce Composition", "SLIDE 03 · CURRENT STATE");

  // KPI strip
  const kpis = [
    { label: "Total Resources", value: stats.total,                 color: C.ibmBlue },
    { label: "Offshore",        value: stats.byLocation.Offshore || 0, color: C.navy },
    { label: "Onshore",         value: stats.byLocation.Onshore  || 0, color: C.accentTeal },
    { label: "Developers",      value: stats.byRole["Developer"]      || 0, color: C.accentPur },
    { label: "Ops Engineers",   value: stats.byRole["Operations Engineer"] || 0, color: C.accentGrn },
    { label: "Tech Leads",      value: stats.byRole["Technical Lead"] || 0, color: C.accentOrn },
  ];
  kpis.forEach((k, i) => {
    const x = 0.5 + i * 2.07;
    s3.addShape(pres.ShapeType.rect, {
      x, y: 1.55, w: 1.97, h: 1.05,
      fill: { color: C.bg }, line: { color: C.gray20, width: 0.5 },
    });
    s3.addShape(pres.ShapeType.rect, {
      x, y: 1.55, w: 1.97, h: 0.08, fill: { color: k.color }, line: { color: k.color },
    });
    s3.addText(String(k.value), {
      x, y: 1.7, w: 1.97, h: 0.55,
      fontFace: FONT, fontSize: 26, bold: true, color: C.ink, align: "center",
    });
    s3.addText(k.label, {
      x, y: 2.22, w: 1.97, h: 0.35,
      fontFace: FONT, fontSize: 10, color: C.ash, align: "center",
    });
  });

  // Pie chart — Onshore vs Offshore
  s3.addText("Onshore vs Offshore", {
    x: 0.5, y: 2.85, w: 6.2, h: 0.4,
    fontFace: FONT, fontSize: 13, bold: true, color: C.ink,
  });
  s3.addChart(pres.ChartType.doughnut, [
    {
      name: "Location",
      labels: ["Offshore", "Onshore"],
      values: [stats.byLocation.Offshore || 0, stats.byLocation.Onshore || 0],
    },
  ], {
    x: 0.5, y: 3.25, w: 6.2, h: 3.5,
    chartColors: [C.ibmBlue, C.accentTeal],
    showLegend: true, legendPos: "r", legendFontSize: 11, legendFontFace: FONT,
    showValue: true,
    dataLabelColor: C.white, dataLabelFontFace: FONT, dataLabelFontSize: 11, dataLabelFontBold: true,
    holeSize: 55,
  });

  // Bar chart — Role distribution
  const roleEntries = Object.entries(stats.byRole).sort((a, b) => b[1] - a[1]).slice(0, 8);
  s3.addText("Role Distribution", {
    x: 6.9, y: 2.85, w: 6.0, h: 0.4,
    fontFace: FONT, fontSize: 13, bold: true, color: C.ink,
  });
  s3.addChart(pres.ChartType.bar, [
    {
      name: "Headcount",
      labels: roleEntries.map(([k]) => k),
      values: roleEntries.map(([, v]) => v),
    },
  ], {
    x: 6.9, y: 3.25, w: 6.0, h: 3.5,
    barDir: "bar",
    chartColors: [C.ibmBlue],
    showValue: true,
    catAxisLabelFontFace: FONT, catAxisLabelFontSize: 9, catAxisLabelColor: C.ink,
    valAxisLabelFontFace: FONT, valAxisLabelFontSize: 9, valAxisLabelColor: C.ash,
    showLegend: false,
    barGapWidthPct: 30,
  });

  addFooter(s3, pres, 3, TOTAL_SLIDES);

  // ============================================================ Slide 4
  const s4 = pres.addSlide();
  s4.background = { color: C.white };
  addHeader(s4, pres, "Shift to a Product-Centric Operating Model", "SLIDE 04 · ALIGNMENT");

  // Left column: hierarchy explanation
  const levels = [
    { label: "DOMAIN",          desc: "Top-level business areas (Health & Network, Service & Admin, Specialty, ...)", color: C.ibmBlue },
    { label: "PORTFOLIO",       desc: "Bundles of related products inside a domain.",                                color: C.navy },
    { label: "PRODUCT",         desc: "The unit of ownership — long-lived, business-aligned.",                       color: C.accentTeal },
    { label: "APPLICATION AREA",desc: "The technology surface a team operates and evolves.",                         color: C.accentPur },
  ];
  s4.addText("Hierarchy of Ownership", {
    x: 0.5, y: 1.55, w: 5.3, h: 0.4,
    fontFace: FONT, fontSize: 13, bold: true, color: C.ink,
  });
  levels.forEach((lv, i) => {
    const y = 2.05 + i * 0.95;
    s4.addShape(pres.ShapeType.rect, {
      x: 0.5, y, w: 0.12, h: 0.85, fill: { color: lv.color }, line: { color: lv.color },
    });
    s4.addText(lv.label, {
      x: 0.75, y, w: 5.0, h: 0.32, fontFace: FONT, fontSize: 11, bold: true, color: lv.color, charSpacing: 4,
    });
    s4.addText(lv.desc, {
      x: 0.75, y: y + 0.32, w: 5.0, h: 0.55, fontFace: FONT, fontSize: 11, color: C.ash, valign: "top",
    });
  });

  // Right column: screenshot (or placeholder)
  if (existsSync(SHOTS.product)) {
    s4.addImage({ path: SHOTS.product, x: 6.2, y: 1.55, w: 6.6, h: 4.2, sizing: { type: "contain", w: 6.6, h: 4.2 } });
  } else {
    s4.addShape(pres.ShapeType.rect, {
      x: 6.2, y: 1.55, w: 6.6, h: 4.2, fill: { color: C.bg }, line: { color: C.gray20, width: 0.5 },
    });
    s4.addText("[ Product treemap screenshot ]", {
      x: 6.2, y: 3.4, w: 6.6, h: 0.5, fontFace: FONT, fontSize: 12, color: C.ash, align: "center",
    });
  }
  s4.addText("Each resource is aligned to a product and application area to enable end-to-end ownership.", {
    x: 6.2, y: 5.85, w: 6.6, h: 0.45,
    fontFace: FONT, fontSize: 11, italic: true, color: C.ash, align: "center",
  });

  addFooter(s4, pres, 4, TOTAL_SLIDES);

  // ============================================================ Slide 5
  const s5 = pres.addSlide();
  s5.background = { color: C.white };
  addHeader(s5, pres, "Evolving Roles for AI-Led Operations", "SLIDE 05 · ROLE TRANSFORMATION");

  // Left column: from -> to mapping
  const roleMap = [
    { from: "Operations Engineer", to: "AIOps Engineer",            color: C.accentTeal },
    { from: "Developer",            to: "AI-Assisted Product Engineer", color: C.ibmBlue },
    { from: "Technical Lead",       to: "AI Delivery Lead",          color: C.accentPur },
    { from: "Project Manager",      to: "Product Delivery Lead",     color: C.accentOrn },
  ];
  s5.addText("From → To Role Mapping", {
    x: 0.5, y: 1.55, w: 6.0, h: 0.4,
    fontFace: FONT, fontSize: 13, bold: true, color: C.ink,
  });
  roleMap.forEach((m, i) => {
    const y = 2.0 + i * 1.1;
    // FROM box
    s5.addShape(pres.ShapeType.rect, {
      x: 0.5, y, w: 2.4, h: 0.85, fill: { color: C.bg }, line: { color: C.gray20, width: 0.5 },
    });
    s5.addText("CURRENT", {
      x: 0.5, y: y + 0.05, w: 2.4, h: 0.25, fontFace: FONT, fontSize: 8, color: C.ash, align: "center", charSpacing: 4,
    });
    s5.addText(m.from, {
      x: 0.5, y: y + 0.32, w: 2.4, h: 0.45, fontFace: FONT, fontSize: 12, bold: true, color: C.ink, align: "center",
    });
    // arrow
    s5.addShape(pres.ShapeType.rightArrow, {
      x: 2.95, y: y + 0.25, w: 0.6, h: 0.35, fill: { color: m.color }, line: { color: m.color },
    });
    // TO box
    s5.addShape(pres.ShapeType.rect, {
      x: 3.6, y, w: 2.95, h: 0.85, fill: { color: m.color }, line: { color: m.color },
    });
    s5.addText("TARGET (AI-LED)", {
      x: 3.6, y: y + 0.05, w: 2.95, h: 0.25, fontFace: FONT, fontSize: 8, color: C.white, align: "center", charSpacing: 4,
    });
    s5.addText(m.to, {
      x: 3.6, y: y + 0.32, w: 2.95, h: 0.45, fontFace: FONT, fontSize: 12, bold: true, color: C.white, align: "center",
    });
  });

  // Right column: screenshot
  if (existsSync(SHOTS.role)) {
    s5.addImage({ path: SHOTS.role, x: 6.85, y: 1.55, w: 5.95, h: 4.2, sizing: { type: "contain", w: 5.95, h: 4.2 } });
  } else {
    s5.addShape(pres.ShapeType.rect, {
      x: 6.85, y: 1.55, w: 5.95, h: 4.2, fill: { color: C.bg }, line: { color: C.gray20, width: 0.5 },
    });
    s5.addText("[ Role transformation screenshot ]", {
      x: 6.85, y: 3.4, w: 5.95, h: 0.5, fontFace: FONT, fontSize: 12, color: C.ash, align: "center",
    });
  }
  s5.addText(`Plan covers all ${stats.total} resources, with role-specific upskilling and certification paths.`, {
    x: 6.85, y: 5.85, w: 5.95, h: 0.45,
    fontFace: FONT, fontSize: 11, italic: true, color: C.ash, align: "center",
  });

  addFooter(s5, pres, 5, TOTAL_SLIDES);

  // ============================================================ Slide 6
  const s6 = pres.addSlide();
  s6.background = { color: C.white };
  addHeader(s6, pres, "Current Skill Baseline and Gaps", "SLIDE 06 · SKILL READINESS");

  // Left: live screenshot of the Skill Readiness Heatmap (with placeholder fallback)
  s6.addText("Live view — Skill Readiness Heatmap", {
    x: 0.5, y: 1.55, w: 7.4, h: 0.4,
    fontFace: FONT, fontSize: 13, bold: true, color: C.ink,
  });
  if (existsSync(SHOTS.skill)) {
    s6.addImage({
      path: SHOTS.skill,
      x: 0.5, y: 2.0, w: 7.4, h: 4.1,
      sizing: { type: "contain", w: 7.4, h: 4.1 },
    });
  } else {
    s6.addShape(pres.ShapeType.rect, {
      x: 0.5, y: 2.0, w: 7.4, h: 4.1,
      fill: { color: C.bg }, line: { color: C.gray20, width: 0.5 },
    });
    s6.addText("[ Skill heatmap screenshot ]", {
      x: 0.5, y: 3.85, w: 7.4, h: 0.5,
      fontFace: FONT, fontSize: 12, color: C.ash, align: "center",
    });
  }

  // Right: gap call-outs
  const gaps = [
    { name: "Agentic AI",  text: "Foundational — needs structured GenAI + Watsonx upskilling." , color: C.accentRed },
    { name: "AIOps",       text: "Limited operational depth — required for zero-touch ops.",     color: C.accentOrn },
    { name: "DevSecOps",   text: "Inconsistent across teams — bake into all engineering paths.", color: C.accentYel },
    { name: "Healthcare Domain", text: "Industry depth varies — universal Horizon onboarding.",  color: C.ibmBlue },
  ];
  s6.addText("Where the gaps are", {
    x: 8.1, y: 1.55, w: 4.7, h: 0.4,
    fontFace: FONT, fontSize: 13, bold: true, color: C.ink,
  });
  gaps.forEach((g, i) => {
    const y = 2.0 + i * 1.05;
    s6.addShape(pres.ShapeType.rect, {
      x: 8.1, y, w: 4.7, h: 0.95,
      fill: { color: C.white }, line: { color: C.gray20, width: 0.5 },
    });
    s6.addShape(pres.ShapeType.rect, {
      x: 8.1, y, w: 0.12, h: 0.95, fill: { color: g.color }, line: { color: g.color },
    });
    s6.addText(g.name, {
      x: 8.35, y: y + 0.08, w: 4.4, h: 0.35,
      fontFace: FONT, fontSize: 12, bold: true, color: g.color,
    });
    s6.addText(g.text, {
      x: 8.35, y: y + 0.42, w: 4.4, h: 0.5,
      fontFace: FONT, fontSize: 11, color: C.ash, valign: "top",
    });
  });

  s6.addShape(pres.ShapeType.rect, {
    x: 0.5, y: 6.2, w: 12.33, h: 0.55,
    fill: { color: C.ibmBlue }, line: { color: C.ibmBlue },
  });
  s6.addText("Structured upskilling required to unlock AI-driven operations.", {
    x: 0.7, y: 6.22, w: 12.0, h: 0.5,
    fontFace: FONT, fontSize: 13, color: C.white, bold: true, valign: "middle",
  });

  addFooter(s6, pres, 6, TOTAL_SLIDES);

  // ============================================================ Slide 7
  const s7 = pres.addSlide();
  s7.background = { color: C.white };
  addHeader(s7, pres, "Structured 6-Month Upskilling Plan", "SLIDE 07 · ROADMAP");

  const phases = [
    {
      name: "Phase 1",
      span: "0 — 2 Months",
      color: C.ibmBlue,
      items: [
        "Healthcare Industry Jumpstart",
        "Agile foundations (CSM, Agile Explorer)",
        "Product & domain familiarization",
      ],
    },
    {
      name: "Phase 2",
      span: "2 — 4 Months",
      color: C.accentTeal,
      items: [
        "GenAI + Watsonx fundamentals",
        "Prompt engineering & agentic workflows",
        "DevSecOps basics (CI/CD, security gates)",
      ],
    },
    {
      name: "Phase 3",
      span: "4 — 6 Months",
      color: C.accentPur,
      items: [
        "AIOps implementation (observability, anomaly detection)",
        "Automation use cases (zero-touch run)",
        "AI-enabled operations workflows in production",
      ],
    },
  ];
  // Timeline track
  s7.addShape(pres.ShapeType.line, {
    x: 0.7, y: 2.4, w: 12.0, h: 0,
    line: { color: C.gray20, width: 2 },
  });
  phases.forEach((p, i) => {
    const x = 0.5 + i * 4.27;
    // dot on the timeline
    s7.addShape(pres.ShapeType.ellipse, {
      x: x + 1.85, y: 2.25, w: 0.3, h: 0.3, fill: { color: p.color }, line: { color: C.white, width: 2 },
    });
    // header chip
    s7.addShape(pres.ShapeType.rect, {
      x: x + 0.2, y: 1.6, w: 3.85, h: 0.55, fill: { color: p.color }, line: { color: p.color },
    });
    s7.addText(`${p.name}  ·  ${p.span}`, {
      x: x + 0.2, y: 1.6, w: 3.85, h: 0.55, fontFace: FONT, fontSize: 13, bold: true, color: C.white, align: "center", valign: "middle",
    });
    // body card
    s7.addShape(pres.ShapeType.rect, {
      x: x + 0.2, y: 2.85, w: 3.85, h: 3.8,
      fill: { color: C.white }, line: { color: C.gray20, width: 0.75 },
    });
    p.items.forEach((it, j) => {
      const y = 3.05 + j * 0.95;
      s7.addShape(pres.ShapeType.ellipse, {
        x: x + 0.4, y: y + 0.1, w: 0.18, h: 0.18, fill: { color: p.color }, line: { color: p.color },
      });
      s7.addText(it, {
        x: x + 0.7, y, w: 3.3, h: 0.85, fontFace: FONT, fontSize: 11, color: C.ink, valign: "top",
      });
    });
  });

  addFooter(s7, pres, 7, TOTAL_SLIDES);

  // ============================================================ Slide 8
  const s8 = pres.addSlide();
  s8.background = { color: C.white };
  addHeader(s8, pres, "AI-Enabled Product Operations Model", "SLIDE 08 · FUTURE STATE");

  const tomPillars = [
    { name: "Product-Aligned Teams",     desc: "End-to-end ownership across business + tech.",        color: C.ibmBlue },
    { name: "AI-Assisted Delivery",      desc: "GenAI co-pilots embedded in every engineering flow.", color: C.accentTeal },
    { name: "AIOps-Driven Operations",   desc: "Predictive, self-healing run with zero-touch SLAs.", color: C.accentPur },
    { name: "DevSecOps Automation",      desc: "Secure-by-default pipelines, policy as code.",        color: C.accentGrn },
    { name: "Healthcare Domain Depth",   desc: "Industry fluency built into every team.",             color: C.accentOrn },
  ];
  tomPillars.forEach((p, i) => {
    const x = 0.5 + i * 2.47;
    s8.addShape(pres.ShapeType.rect, {
      x, y: 1.7, w: 2.35, h: 3.3, fill: { color: C.white }, line: { color: C.gray20, width: 0.75 },
    });
    s8.addShape(pres.ShapeType.rect, {
      x, y: 1.7, w: 2.35, h: 0.18, fill: { color: p.color }, line: { color: p.color },
    });
    s8.addText(`0${i + 1}`, {
      x: x + 0.2, y: 1.95, w: 2.0, h: 0.4, fontFace: FONT, fontSize: 14, bold: true, color: p.color, charSpacing: 4,
    });
    s8.addText(p.name, {
      x: x + 0.2, y: 2.4, w: 2.0, h: 1.0, fontFace: FONT, fontSize: 14, bold: true, color: C.ink, valign: "top",
    });
    s8.addText(p.desc, {
      x: x + 0.2, y: 3.5, w: 2.0, h: 1.4, fontFace: FONT, fontSize: 11, color: C.ash, valign: "top",
    });
  });

  // Closing band
  s8.addShape(pres.ShapeType.rect, {
    x: 0.5, y: 5.4, w: 12.33, h: 1.3,
    fill: { color: C.ibmBlue }, line: { color: C.ibmBlue },
  });
  s8.addText("IBM's approach ensures Horizon's workforce is future-ready, scalable, and aligned to deliver measurable business outcomes in an AI-first operating model.", {
    x: 0.85, y: 5.5, w: 11.7, h: 1.1,
    fontFace: FONT, fontSize: 15, color: C.white, bold: true, valign: "middle",
  });

  addFooter(s8, pres, 8, TOTAL_SLIDES);

  return pres;
}

// ---------- main ----------
(async () => {
  console.log("\n→ Horizon Talent Transformation Plan — deck builder\n");

  if (!skipShots) {
    try {
      await captureScreenshots();
    } catch (e) {
      console.warn("⚠ screenshot capture failed:", e.message);
      console.warn("  Continuing with placeholders for missing images.");
    }
  } else {
    console.log("• Skipping screenshot capture (--skip-shots).");
  }

  console.log("• Loading talent data...");
  const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
  console.log(`  ${data.resources.length} resources · ${data.products.length} products`);

  console.log("• Building deck...");
  const pres = buildDeck(data);

  await pres.writeFile({ fileName: OUT_PATH });
  console.log(`\n✓ Wrote ${path.relative(ROOT, OUT_PATH)}\n`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
