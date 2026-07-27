import { db, knowledgeArticlesTable, executiveAlertsTable, ibmamsRunbooksTable, aiInsightsTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";
import { logger } from "./logger";

const MODEL = "gpt-5.6-terra";

let openaiClient: import("openai").default | null | undefined;

async function getOpenAi(): Promise<import("openai").default | null> {
  if (openaiClient !== undefined) return openaiClient;
  if (!process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || !process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    openaiClient = null;
    return null;
  }
  try {
    const mod = await import("@workspace/integrations-openai-ai-server");
    openaiClient = mod.openai;
  } catch (err) {
    logger.warn({ err }, "OpenAI client unavailable, falling back to rules");
    openaiClient = null;
  }
  return openaiClient;
}

export type ArticleRow = typeof knowledgeArticlesTable.$inferSelect;

/** Keyword retrieval: rank articles by term overlap using Postgres full-text search with ILIKE fallback. */
export async function retrieveArticles(question: string, limit = 4): Promise<ArticleRow[]> {
  const cleaned = question.replace(/[^\w\s]/g, " ").trim();
  if (!cleaned) return [];
  try {
    const tsQuery = cleaned.split(/\s+/).filter((w) => w.length > 2).slice(0, 8).join(" | ");
    if (tsQuery) {
      const rows = await db
        .select()
        .from(knowledgeArticlesTable)
        .where(
          sql`to_tsvector('english', ${knowledgeArticlesTable.title} || ' ' || ${knowledgeArticlesTable.summary} || ' ' || ${knowledgeArticlesTable.body} || ' ' || ${knowledgeArticlesTable.tags}) @@ to_tsquery('english', ${tsQuery})`,
        )
        .orderBy(
          desc(sql`ts_rank(to_tsvector('english', ${knowledgeArticlesTable.title} || ' ' || ${knowledgeArticlesTable.summary} || ' ' || ${knowledgeArticlesTable.body}), to_tsquery('english', ${tsQuery}))`),
        )
        .limit(limit);
      if (rows.length) return rows;
    }
  } catch (err) {
    logger.warn({ err }, "Full-text retrieval failed, using fallback");
  }
  const words = cleaned.toLowerCase().split(/\s+/).filter((w) => w.length > 3).slice(0, 5);
  if (!words.length) return [];
  const likeClauses = words.map(
    (w) => sql`(${knowledgeArticlesTable.title} ILIKE ${"%" + w + "%"} OR ${knowledgeArticlesTable.body} ILIKE ${"%" + w + "%"})`,
  );
  const combined = likeClauses.reduce((a, b) => sql`${a} OR ${b}`);
  return db.select().from(knowledgeArticlesTable).where(sql`(${combined})`).limit(limit);
}

async function buildLiveContext(): Promise<string> {
  const parts: string[] = [];
  try {
    const alerts = await db.select().from(executiveAlertsTable).limit(5);
    if (alerts.length) parts.push("Active executive alerts:\n" + alerts.map((a: Record<string, unknown>) => `- ${JSON.stringify(a)}`).join("\n"));
  } catch { /* table may be empty */ }
  try {
    const runbooks = await db.select().from(ibmamsRunbooksTable).orderBy(desc(ibmamsRunbooksTable.executionsToday)).limit(5);
    if (runbooks.length) parts.push("Top automation runbooks today:\n" + runbooks.map((r) => `- ${r.name} (${r.category}): ${r.executionsToday} runs, ${r.successRate}% success, ${r.timeSavedHours}h saved`).join("\n"));
  } catch { /* ignore */ }
  try {
    const insights = await db.select().from(aiInsightsTable).limit(4);
    if (insights.length) parts.push("Recent AIOps insights:\n" + insights.map((i: Record<string, unknown>) => `- ${JSON.stringify(i)}`).join("\n"));
  } catch { /* ignore */ }
  return parts.join("\n\n");
}

export type LlmAskResult = {
  answer: string;
  sources: string[];
  relatedMetrics: { label: string; value: string }[];
  followUpQuestions: string[];
  citedArticles: ArticleRow[];
} | null;

export async function askWithRag(question: string): Promise<LlmAskResult> {
  const client = await getOpenAi();
  if (!client) return null;
  const [articles, liveContext] = await Promise.all([retrieveArticles(question, 4), buildLiveContext()]);
  const articleContext = articles
    .map((a, i) => `[Article ${i + 1}] "${a.title}" (domain: ${a.domain}, source: ${a.sourceType})\n${a.body.slice(0, 1800)}`)
    .join("\n\n");
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      max_completion_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are the CareOps360 knowledge assistant for Horizon BCBS payer operations leadership. " +
            "Answer using ONLY the provided knowledge articles and live operational data. Be specific with numbers when available. " +
            "If information is missing, say so briefly and suggest what to ask instead. " +
            'Respond as JSON: {"answer": string (2-6 sentences, executive tone), "relatedMetrics": [{"label": string, "value": string}] (up to 3), "followUpQuestions": [string] (exactly 3), "citedArticleIndexes": [int] (1-based indexes of articles actually used)}',
        },
        {
          role: "user",
          content: `Question: ${question}\n\nKnowledge articles:\n${articleContext || "(none matched)"}\n\nLive operational data:\n${liveContext || "(none)"}`,
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      answer?: string;
      relatedMetrics?: { label: string; value: string }[];
      followUpQuestions?: string[];
      citedArticleIndexes?: number[];
    };
    if (!parsed.answer) return null;
    const cited = (parsed.citedArticleIndexes ?? [])
      .map((i) => articles[i - 1])
      .filter((a): a is ArticleRow => Boolean(a));
    const citedFinal = cited.length ? cited : articles.slice(0, 2);
    return {
      answer: parsed.answer,
      sources: citedFinal.map((a) => `${a.title} (${a.sourceType === "ai-generated" ? "AI-generated" : a.sourceType})`),
      relatedMetrics: (parsed.relatedMetrics ?? []).slice(0, 3),
      followUpQuestions: (parsed.followUpQuestions ?? []).slice(0, 3),
      citedArticles: citedFinal,
    };
  } catch (err) {
    logger.warn({ err }, "LLM ask failed, falling back to rule-based answers");
    return null;
  }
}

export type GeneratedArticle = {
  title: string;
  summary: string;
  body: string;
  domain: string;
  tags: string[];
};

export async function generateArticlesFromLiveData(domains: string[]): Promise<GeneratedArticle[] | null> {
  const client = await getOpenAi();
  if (!client) return null;
  const liveContext = await buildLiveContext();
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      max_completion_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write concise internal knowledge-base articles for Horizon BCBS payer operations, capturing institutional knowledge. " +
            "Each article: practical, specific, markdown body (### headings, bullet lists), 250-400 words. " +
            'Respond as JSON: {"articles": [{"title": string, "summary": string (1 sentence), "body": string (markdown), "domain": string, "tags": [string] (3-5)}]}',
        },
        {
          role: "user",
          content: `Write one knowledge article for each of these domains: ${domains.join(", ")}.\n\nGround them in this live operational data where relevant:\n${liveContext || "(use realistic payer-operations best practices)"}`,
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { articles?: GeneratedArticle[] };
    if (!Array.isArray(parsed.articles)) return null;
    return parsed.articles.filter((a) => a.title && a.body && a.domain);
  } catch (err) {
    logger.warn({ err }, "LLM article generation failed");
    return null;
  }
}
