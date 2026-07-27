import { logger } from "./logger";

/**
 * Connector-backed knowledge source ingestion.
 *
 * Uses Replit's connector service when a connector (Confluence, SharePoint,
 * OneDrive, Google Drive) has been authorized for this workspace. When a
 * connector is not connected, sync endpoints degrade gracefully and report
 * "not connected" so the demo remains functional without credentials.
 */

export const KNOWLEDGE_SOURCES = [
  { sourceType: "confluence", displayName: "Confluence", connectorName: "confluence" },
  { sourceType: "sharepoint", displayName: "SharePoint Online", connectorName: "sharepoint" },
  { sourceType: "onedrive", displayName: "OneDrive", connectorName: "onedrive" },
  { sourceType: "gdrive", displayName: "Google Drive", connectorName: "google-drive" },
] as const;

export type SourceType = (typeof KNOWLEDGE_SOURCES)[number]["sourceType"];

type ConnectionSettings = {
  settings?: {
    access_token?: string;
    oauth?: { credentials?: { access_token?: string } };
    expires_at?: string;
    [key: string]: unknown;
  };
};

async function getAccessToken(connectorName: string): Promise<{ token: string; settings: Record<string, unknown> } | null> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;
  if (!hostname || !xReplitToken) return null;
  try {
    const res = await fetch(
      `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=${encodeURIComponent(connectorName)}`,
      { headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { items?: ConnectionSettings[] };
    const item = data.items?.[0];
    const token = item?.settings?.access_token || item?.settings?.oauth?.credentials?.access_token;
    if (!token) return null;
    return { token, settings: (item?.settings ?? {}) as Record<string, unknown> };
  } catch (err) {
    logger.warn({ err, connectorName }, "Connector lookup failed");
    return null;
  }
}

export type FetchedDoc = {
  title: string;
  summary: string;
  body: string;
  sourceUrl: string | null;
  author: string;
};

export type SyncOutcome =
  | { connected: false; message: string }
  | { connected: true; docs: FetchedDoc[]; message: string };

const NOT_CONNECTED_MSG: Record<SourceType, string> = {
  confluence: "Confluence is not connected. Connect the Confluence integration to sync wiki pages into the knowledge corpus.",
  sharepoint: "SharePoint Online is not connected. Connect the SharePoint integration to sync document libraries.",
  onedrive: "OneDrive is not connected. Connect the OneDrive integration to sync shared documents.",
  gdrive: "Google Drive is not connected. Connect the Google Drive integration to sync shared drive files.",
};

export async function syncSource(sourceType: SourceType): Promise<SyncOutcome> {
  const def = KNOWLEDGE_SOURCES.find((s) => s.sourceType === sourceType);
  if (!def) return { connected: false, message: `Unknown source: ${sourceType}` };
  const conn = await getAccessToken(def.connectorName);
  if (!conn) return { connected: false, message: NOT_CONNECTED_MSG[sourceType] };

  try {
    switch (sourceType) {
      case "confluence":
        return await syncConfluence(conn.token, conn.settings);
      case "sharepoint":
      case "onedrive":
        return await syncGraphDrive(conn.token, sourceType);
      case "gdrive":
        return await syncGoogleDrive(conn.token);
    }
  } catch (err) {
    logger.warn({ err, sourceType }, "Source sync failed");
    return { connected: true, docs: [], message: `Sync failed: ${err instanceof Error ? err.message : "unknown error"}` };
  }
}

async function syncConfluence(token: string, settings: Record<string, unknown>): Promise<SyncOutcome> {
  const siteUrl = (settings.site_url || settings.cloud_url || settings.base_url) as string | undefined;
  if (!siteUrl) return { connected: true, docs: [], message: "Connected, but no Confluence site URL available." };
  const res = await fetch(`${siteUrl.replace(/\/$/, "")}/wiki/api/v2/pages?limit=25&body-format=storage`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) return { connected: true, docs: [], message: `Confluence API returned ${res.status}` };
  const data = (await res.json()) as { results?: { title?: string; body?: { storage?: { value?: string } }; _links?: { webui?: string } }[] };
  const docs: FetchedDoc[] = (data.results ?? []).map((p) => {
    const text = (p.body?.storage?.value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return {
      title: p.title ?? "Untitled page",
      summary: text.slice(0, 200) || "Confluence page",
      body: text || "(empty page)",
      sourceUrl: p._links?.webui ? `${siteUrl.replace(/\/$/, "")}/wiki${p._links.webui}` : null,
      author: "Confluence",
    };
  });
  return { connected: true, docs, message: `Imported ${docs.length} Confluence pages.` };
}

async function syncGraphDrive(token: string, sourceType: "sharepoint" | "onedrive"): Promise<SyncOutcome> {
  const res = await fetch("https://graph.microsoft.com/v1.0/me/drive/root/children?$top=25", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) return { connected: true, docs: [], message: `Microsoft Graph returned ${res.status}` };
  const data = (await res.json()) as { value?: { name?: string; webUrl?: string; file?: unknown; createdBy?: { user?: { displayName?: string } } }[] };
  const docs: FetchedDoc[] = (data.value ?? [])
    .filter((f) => f.file)
    .map((f) => ({
      title: f.name ?? "Untitled document",
      summary: `${sourceType === "sharepoint" ? "SharePoint" : "OneDrive"} document: ${f.name ?? "file"}`,
      body: `Document reference imported from ${sourceType === "sharepoint" ? "SharePoint Online" : "OneDrive"}. Open the source link to view the full document.`,
      sourceUrl: f.webUrl ?? null,
      author: f.createdBy?.user?.displayName ?? "Microsoft 365",
    }));
  return { connected: true, docs, message: `Imported ${docs.length} document references.` };
}

async function syncGoogleDrive(token: string): Promise<SyncOutcome> {
  const res = await fetch(
    "https://www.googleapis.com/drive/v3/files?pageSize=25&fields=files(id,name,webViewLink,owners(displayName),mimeType)",
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } },
  );
  if (!res.ok) return { connected: true, docs: [], message: `Google Drive API returned ${res.status}` };
  const data = (await res.json()) as { files?: { name?: string; webViewLink?: string; owners?: { displayName?: string }[] }[] };
  const docs: FetchedDoc[] = (data.files ?? []).map((f) => ({
    title: f.name ?? "Untitled file",
    summary: `Google Drive file: ${f.name ?? "file"}`,
    body: "Document reference imported from Google Drive. Open the source link to view the full document.",
    sourceUrl: f.webViewLink ?? null,
    author: f.owners?.[0]?.displayName ?? "Google Drive",
  }));
  return { connected: true, docs, message: `Imported ${docs.length} file references.` };
}
