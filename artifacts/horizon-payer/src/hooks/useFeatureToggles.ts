import { useQuery } from "@tanstack/react-query";

export type FeatureToggle = {
  key: string;
  name: string;
  path: string;
  group: string;
  locked?: boolean;
  enabled: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
};

export function featureToggleHeaders(): HeadersInit {
  const token = localStorage.getItem("horizon_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useFeatureToggles() {
  return useQuery<{ features: FeatureToggle[] }>({
    queryKey: ["feature-toggles"],
    queryFn: async () => {
      const response = await fetch("/api/feature-toggles", { headers: featureToggleHeaders() });
      if (!response.ok) throw new Error("Failed to load feature settings");
      return response.json();
    },
    staleTime: 5_000,
    refetchInterval: 30_000,
  });
}