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
        executiveKpis: executiveKpis as Record<string, unknown> | null,
        alerts: alerts as Record<string, unknown>[] | null,
        claimsKpis: claimsKpis as Record<string, unknown> | null,
        claimsQueue: claimsQueue as Record<string, unknown>[] | null,
        denialReasons: denialReasons as Record<string, unknown>[] | null,
        claimsByLob: claimsByLob as Record<string, unknown>[] | null,
        priorAuthKpis: priorAuthKpis as Record<string, unknown> | null,
        priorAuthAging: priorAuthAging as Record<string, unknown>[] | null,
        topProcedures: topProcedures as Record<string, unknown>[] | null,
        reviewerWorkload: reviewerWorkload as Record<string, unknown>[] | null,
        enrollmentKpis: enrollmentKpis as Record<string, unknown> | null,
        enrollmentExceptions: enrollmentExceptions as Record<string, unknown>[] | null,
        appList: appList as Record<string, unknown>[] | null,
        incidents: incidents as Record<string, unknown>[] | null,
        batchJobs: batchJobs as Record<string, unknown>[] | null,
        ibmAmsKpis: ibmAmsKpis as Record<string, unknown> | null,
        automationRunbooks: automationRunbooks as Record<string, unknown>[] | null,
        costSavings: costSavings as Record<string, unknown>[] | null,
        roadmapInitiatives: roadmapInitiatives as Record<string, unknown>[] | null,
      });
    } finally {
      setExporting(false);
    }
  };

  return { trigger, exporting };
}
