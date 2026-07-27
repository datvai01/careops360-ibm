import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, knowledgeArticlesTable, knowledgeSourcesTable } from "@workspace/db";
import { desc, eq, sql, and, type SQL } from "drizzle-orm";
import { getSessionUser } from "./auth";
import { logger } from "../lib/logger";
import { retrieveArticles, askWithRag, generateArticlesFromLiveData, type ArticleRow } from "../lib/knowledgeLlm";
import { KNOWLEDGE_SOURCES, syncSource, type SourceType } from "../lib/knowledgeConnectors";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const user = getSessionUser(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "No valid session" });
    return;
  }
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
  next();
}

export function toSummary(a: ArticleRow) {
  return {
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    domain: a.domain,
    tags: a.tags ? a.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    sourceType: a.sourceType,
    sourceUrl: a.sourceUrl,
    author: a.author,
    viewCount: a.viewCount,
    updatedAt: a.updatedAt.toISOString(),
  };
}

export function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 140);
}

router.get("/knowledge/articles", requireAuth, async (req, res) => {
  const { q, domain, sourceType } = req.query as { q?: string; domain?: string; sourceType?: string };
  let rows: ArticleRow[];
  if (q && q.trim()) {
    rows = await retrieveArticles(q, 50);
    if (domain) rows = rows.filter((r) => r.domain === domain);
    if (sourceType) rows = rows.filter((r) => r.sourceType === sourceType);
  } else {
    const conditions: SQL[] = [];
    if (domain) conditions.push(eq(knowledgeArticlesTable.domain, domain));
    if (sourceType) conditions.push(eq(knowledgeArticlesTable.sourceType, sourceType));
    rows = await db
      .select()
      .from(knowledgeArticlesTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(knowledgeArticlesTable.updatedAt))
      .limit(200);
  }
  res.json(rows.map(toSummary));
});

router.get("/knowledge/articles/:slug", requireAuth, async (req, res) => {
  const [row] = await db.select().from(knowledgeArticlesTable).where(eq(knowledgeArticlesTable.slug, req.params.slug));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ...toSummary(row), body: row.body, createdAt: row.createdAt.toISOString() });
});

router.post("/knowledge/articles/:slug/view", requireAuth, async (req, res) => {
  const [row] = await db
    .update(knowledgeArticlesTable)
    .set({ viewCount: sql`${knowledgeArticlesTable.viewCount} + 1` })
    .where(eq(knowledgeArticlesTable.slug, req.params.slug))
    .returning({ viewCount: knowledgeArticlesTable.viewCount });
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ viewCount: row.viewCount });
});

router.get("/knowledge/stats", requireAuth, async (_req, res) => {
  const all = await db.select().from(knowledgeArticlesTable);
  const byDomain = new Map<string, number>();
  const bySourceType = new Map<string, number>();
  let totalViews = 0;
  let aiGeneratedCount = 0;
  let lastUpdatedAt: Date | null = null;
  for (const a of all) {
    byDomain.set(a.domain, (byDomain.get(a.domain) ?? 0) + 1);
    bySourceType.set(a.sourceType, (bySourceType.get(a.sourceType) ?? 0) + 1);
    totalViews += a.viewCount;
    if (a.sourceType === "ai-generated") aiGeneratedCount += 1;
    if (!lastUpdatedAt || a.updatedAt > lastUpdatedAt) lastUpdatedAt = a.updatedAt;
  }
  const topViewed = [...all].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
  res.json({
    totalArticles: all.length,
    totalViews,
    byDomain: [...byDomain.entries()].map(([domain, count]) => ({ domain, count })).sort((a, b) => b.count - a.count),
    bySourceType: [...bySourceType.entries()].map(([sourceType, count]) => ({ sourceType, count })).sort((a, b) => b.count - a.count),
    topViewed: topViewed.map(toSummary),
    aiGeneratedCount,
    lastUpdatedAt: lastUpdatedAt ? lastUpdatedAt.toISOString() : null,
  });
});

router.get("/knowledge/sources", requireAuth, async (_req, res) => {
  const rows = await db.select().from(knowledgeSourcesTable);
  const byType = new Map(rows.map((r) => [r.sourceType, r]));
  res.json(
    KNOWLEDGE_SOURCES.map((def) => {
      const r = byType.get(def.sourceType);
      return {
        sourceType: def.sourceType,
        displayName: def.displayName,
        status: r?.status ?? "not_connected",
        lastSyncAt: r?.lastSyncAt ? r.lastSyncAt.toISOString() : null,
        lastSyncMessage: r?.lastSyncMessage ?? null,
        articleCount: r?.articleCount ?? 0,
      };
    }),
  );
});

router.post("/knowledge/sources/:sourceType/sync", requireAdmin, async (req, res) => {
  const sourceType = req.params.sourceType as SourceType;
  const def = KNOWLEDGE_SOURCES.find((s) => s.sourceType === sourceType);
  if (!def) {
    res.status(404).json({ error: "Unknown source" });
    return;
  }
  const outcome = await syncSource(sourceType);
  let imported = 0;
  let status = "not_connected";
  if (outcome.connected) {
    status = "connected";
    for (const doc of outcome.docs) {
      const slug = slugify(`${sourceType}-${doc.title}`);
      if (!slug) continue;
      try {
        await db
          .insert(knowledgeArticlesTable)
          .values({
            slug,
            title: doc.title,
            summary: doc.summary,
            body: doc.body,
            domain: "Imported Documents",
            tags: sourceType,
            sourceType,
            sourceUrl: doc.sourceUrl,
            author: doc.author,
          })
          .onConflictDoUpdate({
            target: knowledgeArticlesTable.slug,
            set: { title: doc.title, summary: doc.summary, body: doc.body, sourceUrl: doc.sourceUrl, updatedAt: new Date() },
          });
        imported += 1;
      } catch (err) {
        logger.warn({ err, slug }, "Failed to upsert imported article");
      }
    }
  }
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(knowledgeArticlesTable)
    .where(eq(knowledgeArticlesTable.sourceType, sourceType));
  await db
    .insert(knowledgeSourcesTable)
    .values({
      sourceType,
      displayName: def.displayName,
      status,
      lastSyncAt: new Date(),
      lastSyncMessage: outcome.message,
      articleCount: count,
    })
    .onConflictDoUpdate({
      target: knowledgeSourcesTable.sourceType,
      set: { status, lastSyncAt: new Date(), lastSyncMessage: outcome.message, articleCount: count },
    });
  res.json({ sourceType, status, imported, message: outcome.message });
});

router.post("/knowledge/generate", requireAdmin, async (req, res) => {
  const domains: string[] =
    Array.isArray(req.body?.domains) && req.body.domains.length
      ? req.body.domains.slice(0, 6)
      : ["Claims", "Prior Auth", "IT Ops / AIOps"];
  const generated = await generateArticlesFromLiveData(domains);
  if (!generated) {
    res.status(503).json({
      error: "AI generation unavailable",
      message: "The AI service is not reachable right now. Try again shortly.",
    });
    return;
  }
  const saved: ArticleRow[] = [];
  for (const g of generated) {
    const slug = slugify(g.title);
    if (!slug) continue;
    try {
      const [row] = await db
        .insert(knowledgeArticlesTable)
        .values({
          slug,
          title: g.title,
          summary: g.summary,
          body: g.body,
          domain: g.domain,
          tags: (g.tags ?? []).join(","),
          sourceType: "ai-generated",
          sourceUrl: null,
          author: "CareOps360 AI",
        })
        .onConflictDoUpdate({
          target: knowledgeArticlesTable.slug,
          set: { summary: g.summary, body: g.body, tags: (g.tags ?? []).join(","), updatedAt: new Date() },
        })
        .returning();
      if (row) saved.push(row);
    } catch (err) {
      logger.warn({ err, title: g.title }, "Failed to save generated article");
    }
  }
  res.json({ generated: saved.length, articles: saved.map(toSummary), llmUsed: true });
});

router.post("/knowledge/teams/message", requireAuth, async (req, res) => {
  const message = String(req.body?.message ?? "").trim();
  if (!message) {
    res.status(400).json({ error: "message is required" });
    return;
  }
  const llm = await askWithRag(message);
  if (llm) {
    res.json({
      answer: llm.answer,
      sources: llm.sources,
      relatedMetrics: llm.relatedMetrics,
      followUpQuestions: llm.followUpQuestions,
      citedArticles: llm.citedArticles.map(toSummary),
      answeredBy: "ai",
    });
    return;
  }
  const articles = await retrieveArticles(message, 2);
  res.json({
    answer: articles.length
      ? `Here's what I found in the knowledge base: ${articles[0].summary} See the cited articles for details.`
      : "I couldn't find anything in the knowledge base for that. Try asking about claims, prior auth, SLA compliance, providers, or automation savings.",
    sources: articles.map((a) => a.title),
    relatedMetrics: [],
    followUpQuestions: [
      "What is our SLA compliance this week?",
      "How is the prior auth backlog trending?",
      "Which automation runbooks save the most time?",
    ],
    citedArticles: articles.map(toSummary),
    answeredBy: "rules",
  });
});

export default router;
