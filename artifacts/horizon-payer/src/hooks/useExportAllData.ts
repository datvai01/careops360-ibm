import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetExecutiveKpis,
  useGetAlerts,
  useGetClaimsKpis,
  useGetClaimsQueue,
  useGetDenialReasons,
  useGetClaimsByLineOfBusiness,
  useGetPriorAuthKpis,
  useGetPriorAuthAging,
  useGetTopProcedures,
  useGetReviewerWorkload,
  useGetMemberKpis,
  useGetEnrollmentExceptions,
  useGetApplicationList,
  useGetIncidents,
  useGetBatchJobs,
  useGetIbmAmsKpis,
  useGetAutomationRunbooks,
  useGetCostSavings,
  useGetRoadmapInitiatives,
} from "@workspace/api-client-react";
import { exportAllDashboardsToExcel } from "@/lib/exportToExcel";

export function useExportAllData() {
  const [exporting, setExporting] = useState(false);

  const { data: executiveKpis } = useGetExecutiveKpis({});
  const { data: alerts } = useGetAlerts({});
  const { data: claimsKpis } = useGetClaimsKpis({});
  const { data: claimsQueue } = useGetClaimsQueue({});
  const { data: denialReasons } = useGetDenialReasons({});
  const { data: claimsByLob } = useGetClaimsByLineOfBusiness({});
  const { data: priorAuthKpis } = useGetPriorAuthKpis({});
  const { data: priorAuthAging } = useGetPriorAuthAging({});
  const { data: topProcedures } = useGetTopProcedures({});
  const { data: reviewerWorkload } = useGetReviewerWorkload({});
  const { data: enrollmentKpis } = useGetMemberKpis({});
  const { data: enrollmentExceptions } = useGetEnrollmentExceptions({});
  const { data: appList } = useGetApplicationList({});
  const { data: incidents } = useGetIncidents({});
  const { data: batchJobs } = useGetBatchJobs({});
  const { data: ibmAmsKpis } = useGetIbmAmsKpis({});
  const { data: automationRunbooks } = useGetAutomationRunbooks({});
  const { data: costSavings } = useGetCostSavings({});
  const { data: roadmapInitiatives } = useGetRoadmapInitiatives({});

  const trigger = async () => {
    setExporting(true);
    try {
      await exportAllDashboardsToExcel({
        executiveKpis: executiveKpis as unknown as Record<string, unknown> | null,
        alerts: alerts as unknown as Record<string, unknown>[] | null,
        claimsKpis: claimsKpis as unknown as Record<string, unknown> | null,
        claimsQueue: claimsQueue as unknown as Record<string, unknown>[] | null,
        denialReasons: denialReasons as unknown as Record<string, unknown>[] | null,
        claimsByLob: claimsByLob as unknown as Record<string, unknown>[] | null,
        priorAuthKpis: priorAuthKpis as unknown as Record<string, unknown> | null,
        priorAuthAging: priorAuthAging as unknown as Record<string, unknown>[] | null,
        topProcedures: topProcedures as unknown as Record<string, unknown>[] | null,
        reviewerWorkload: reviewerWorkload as unknown as Record<string, unknown>[] | null,
        enrollmentKpis: enrollmentKpis as unknown as Record<string, unknown> | null,
        enrollmentExceptions: enrollmentExceptions as unknown as Record<string, unknown>[] | null,
        appList: appList as unknown as Record<string, unknown>[] | null,
        incidents: incidents as unknown as Record<string, unknown>[] | null,
        batchJobs: batchJobs as unknown as Record<string, unknown>[] | null,
        ibmAmsKpis: ibmAmsKpis as unknown as Record<string, unknown> | null,
        automationRunbooks: automationRunbooks as unknown as Record<string, unknown>[] | null,
        costSavings: costSavings as unknown as Record<string, unknown>[] | null,
        roadmapInitiatives: roadmapInitiatives as unknown as Record<string, unknown>[] | null,
      });
    } finally {
      setExporting(false);
    }
  };

  return { trigger, exporting };
}
