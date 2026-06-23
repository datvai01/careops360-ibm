import { useCallback, useEffect, useMemo, useState } from "react";
import type { Alert } from "@workspace/api-client-react";

const STORAGE_KEY = "horizon_notifications_v1";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface StoredRecord {
  dismissedAt?: number;
  seenAt?: number;
  bannerDismissedAt?: number;
}

type Store = Record<string, StoredRecord>;

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function saveStore(store: Store) {
  const now = Date.now();
  const pruned: Store = {};
  for (const [id, rec] of Object.entries(store)) {
    const oldest = Math.min(
      rec.dismissedAt ?? Infinity,
      rec.seenAt ?? Infinity,
      rec.bannerDismissedAt ?? Infinity,
    );
    if (now - oldest < TTL_MS) pruned[id] = rec;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
}

function patch(id: string, update: Partial<StoredRecord>): Store {
  const store = loadStore();
  store[id] = { ...store[id], ...update };
  saveStore(store);
  return loadStore();
}

export interface NotificationItem {
  id: string;
  severity: Alert["severity"];
  title: string;
  description: string;
  status: string;
  seenAt?: number;
  dismissedAt?: number;
  bannerDismissedAt?: number;
}

export function useNotifications(alerts: Alert[] | undefined) {
  const [store, setStore] = useState<Store>(loadStore);

  useEffect(() => {
    setStore(loadStore());
  }, [alerts]);

  const notifications = useMemo((): NotificationItem[] => {
    if (!alerts) return [];
    const now = Date.now();
    const result: NotificationItem[] = [];
    for (const a of alerts) {
      const rec = store[a.id] ?? {};
      const dismissedAt = rec.dismissedAt;
      if (dismissedAt && now - dismissedAt < TTL_MS) continue;
      result.push({
        id: a.id,
        severity: a.severity,
        title: a.title,
        description: a.description,
        status: a.status,
        seenAt: rec.seenAt,
        dismissedAt: rec.dismissedAt,
        bannerDismissedAt: rec.bannerDismissedAt,
      });
    }
    return result;
  }, [alerts, store]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.seenAt).length,
    [notifications],
  );

  const isBannerDismissed = useCallback(
    (id: string): boolean => {
      const rec = store[id] ?? {};
      const ts = rec.bannerDismissedAt;
      return !!ts && Date.now() - ts < TTL_MS;
    },
    [store],
  );

  const dismissBanner = useCallback((id: string) => {
    setStore(patch(id, { bannerDismissedAt: Date.now() }));
  }, []);

  const dismiss = useCallback((id: string) => {
    setStore(patch(id, { dismissedAt: Date.now(), bannerDismissedAt: Date.now() }));
  }, []);

  const markAllSeen = useCallback(() => {
    const now = Date.now();
    const s = loadStore();
    for (const n of notifications.filter((x) => !x.seenAt)) {
      s[n.id] = { ...s[n.id], seenAt: now };
    }
    saveStore(s);
    setStore(loadStore());
  }, [notifications]);

  return { notifications, unreadCount, isBannerDismissed, dismissBanner, dismiss, markAllSeen };
}
