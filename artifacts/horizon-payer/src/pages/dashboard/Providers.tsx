import { useGetProviderKpis, useGetProviderList, useGetProviderIssues } from "@workspace/api-client-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";
import { LastRefresh } from "@/components/admin/LastRefresh";
import { HelpHint } from "@/components/admin/HelpHint";

export default function Providers() {
  const { data: kpis, isLoading: isKpisLoading } = useGetProviderKpis();
  const { data: providersList, isLoading: isProvidersLoading } = useGetProviderList({});
  const { data: issues, isLoading: isIssuesLoading } = useGetProviderIssues();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Provider Operations</h1>
          <p className="text-muted-foreground mt-1">Provider credentialing, directories, and disputes</p>
          <LastRefresh datasetKey="providers" variant="compact" className="mt-2" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Network Operations KPIs</h2>
        <HelpHint
          title="Provider Network KPIs"
          description="Onboarding pipeline, credentialing backlog, dispute caseload, directory hygiene, open tickets, and contract loads."
          tables={["provider_kpis", "providers", "provider_issues"]}
          datasetKey="providers"
          adminAction="Upload the Providers dataset workbook to refresh the network roster, KPIs, and issue heatmap."
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard title="Onboarding Requests" metric={kpis?.onboardingRequests} isLoading={isKpisLoading} />
        <KpiCard title="Credentialing Pending" metric={kpis?.credentialingPending} isLoading={isKpisLoading} />
        <KpiCard title="Dispute Cases" metric={kpis?.disputeCases} isLoading={isKpisLoading} />
        <KpiCard title="Directory Updates" metric={kpis?.directoryUpdates} isLoading={isKpisLoading} />
        <KpiCard title="Open Tickets" metric={kpis?.openTickets} isLoading={isKpisLoading} />
        <KpiCard title="Contract Loads" metric={kpis?.contractLoads} isLoading={isKpisLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Provider Directory
              <HelpHint
                title="Provider Directory"
                description="Roster of in-network providers with NPI, specialty, status, and credentialing state. Drives directory hygiene reports."
                tables={["providers"]}
                datasetKey="providers"
                adminAction="Upload the Providers workbook to refresh roster, specialties, and credentialing status."
              />
            </CardTitle>
            <CardDescription>Recent provider updates and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider Name</TableHead>
                    <TableHead>NPI</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Credentialing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isProvidersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Loading providers...</TableCell>
                    </TableRow>
                  ) : providersList?.providers ? (
                    providersList.providers.map((p) => (
                      <TableRow key={p.providerId}>
                        <TableCell className="font-medium">{p.providerName}</TableCell>
                        <TableCell>{p.npi}</TableCell>
                        <TableCell>{p.specialty}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            p.status === 'active' ? 'bg-status-green/10 text-status-green border-status-green/20' :
                            p.status === 'pending' ? 'bg-status-yellow/10 text-status-yellow border-status-yellow/20' :
                            'bg-status-red/10 text-status-red border-status-red/20'
                          }>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{p.credentialingStatus}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">No providers found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Top Provider Issues
              <HelpHint
                title="Top Provider Issues"
                description="Most-frequent provider-side ticket categories with priority and trend. Used by provider services to triage call drivers."
                tables={["provider_issues"]}
                datasetKey="providers"
                adminAction="Refresh by uploading the Providers workbook with the latest issue rollups."
              />
            </CardTitle>
            <CardDescription>Active ticket categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isIssuesLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading issues...</div>
              ) : issues ? (
                issues.map((issue, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{issue.issueType}</span>
                      <span className="text-xs text-muted-foreground">{issue.count} cases</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={
                        issue.priority === 'high' ? 'bg-status-red/10 text-status-red border-status-red/20' :
                        issue.priority === 'medium' ? 'bg-status-yellow/10 text-status-yellow border-status-yellow/20' : ''
                      }>
                        {issue.priority}
                      </Badge>
                      {issue.trend === 'up' && <ArrowUpIcon className="w-4 h-4 text-status-red" />}
                      {issue.trend === 'down' && <ArrowDownIcon className="w-4 h-4 text-status-green" />}
                      {issue.trend === 'flat' && <MinusIcon className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                ))
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}