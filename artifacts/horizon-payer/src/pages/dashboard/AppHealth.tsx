import { useGetApplicationHealth, useGetApplicationList, useGetIncidents, useGetBatchJobs, useGetInterfaceHealth, useGetSlaCompliance, useGetApplicationKpis } from "@workspace/api-client-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AppHealth() {
  const { data: kpis, isLoading: isKpisLoading } = useGetApplicationKpis({ query: { refetchInterval: 30000 } });
  const { data: appList, isLoading: isAppListLoading } = useGetApplicationList({ query: { refetchInterval: 30000 } });
  const { data: incidents, isLoading: isIncidentsLoading } = useGetIncidents({}, { query: { refetchInterval: 30000 } });
  const { data: batchJobs, isLoading: isBatchJobsLoading } = useGetBatchJobs({ query: { refetchInterval: 30000 } });
  const { data: interfaces, isLoading: isInterfacesLoading } = useGetInterfaceHealth({ query: { refetchInterval: 30000 } });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Application Health</h1>
          <p className="text-muted-foreground mt-1">IT operations, infrastructure, and application reliability</p>
        </div>
        <Tabs defaultValue="prod" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prod">PROD</TabsTrigger>
            <TabsTrigger value="uat">UAT</TabsTrigger>
            <TabsTrigger value="qa">QA</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Overall Availability" metric={kpis?.overallAvailability} isLoading={isKpisLoading} />
        <KpiCard title="Open Incidents" metric={kpis?.openIncidents} isLoading={isKpisLoading} />
        <KpiCard title="MTTR" metric={kpis?.mttr} isLoading={isKpisLoading} />
        <KpiCard title="Batch Success Rate" metric={kpis?.batchSuccessRate} isLoading={isKpisLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Core Applications Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-[300px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Availability</TableHead>
                    <TableHead className="text-right">SLA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isAppListLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Loading applications...</TableCell>
                    </TableRow>
                  ) : appList ? (
                    appList.map((app) => (
                      <TableRow key={app.appId}>
                        <TableCell className="font-medium text-sm">{app.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            app.status === 'healthy' ? 'bg-status-green/10 text-status-green border-status-green/20' :
                            app.status === 'degraded' ? 'bg-status-yellow/10 text-status-yellow border-status-yellow/20' :
                            'bg-status-red/10 text-status-red border-status-red/20'
                          }>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">{app.availability}%</TableCell>
                        <TableCell className="text-right">
                          <Progress value={app.slaActual} className="h-2 w-16 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">No applications found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-[300px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Application</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isIncidentsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Loading incidents...</TableCell>
                    </TableRow>
                  ) : incidents ? (
                    incidents.map((inc) => (
                      <TableRow key={inc.incidentId}>
                        <TableCell className="font-medium text-xs">{inc.incidentId}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            inc.severity === 'sev1' || inc.severity === 'sev2' ? 'bg-status-red/10 text-status-red border-status-red/20' :
                            'bg-status-yellow/10 text-status-yellow border-status-yellow/20'
                          }>
                            {inc.severity.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{inc.affectedApplication}</TableCell>
                        <TableCell className="text-xs">{inc.status}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">No incidents found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Batch Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {isBatchJobsLoading ? (
                <div className="col-span-full text-center text-muted-foreground py-8">Loading batches...</div>
              ) : batchJobs ? (
                batchJobs.map((job) => (
                  <div key={job.jobId} className="border rounded-md p-3 flex flex-col gap-1">
                    <div className="text-xs font-medium truncate" title={job.jobName}>{job.jobName}</div>
                    <Badge variant="outline" className={
                      job.status === 'success' ? 'bg-status-green/10 text-status-green border-status-green/20 w-fit' :
                      job.status === 'running' ? 'bg-primary/10 text-primary border-primary/20 w-fit' :
                      'bg-status-red/10 text-status-red border-status-red/20 w-fit'
                    }>
                      {job.status}
                    </Badge>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {job.duration ? `Duration: ${job.duration}s` : 'Pending'}
                    </div>
                  </div>
                ))
              ) : null}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Interfaces</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="rounded-md border max-h-[300px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Interface</TableHead>
                    <TableHead>Source &rarr; Target</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isInterfacesLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">Loading interfaces...</TableCell>
                    </TableRow>
                  ) : interfaces ? (
                    interfaces.map((intf) => (
                      <TableRow key={intf.interfaceId}>
                        <TableCell className="font-medium text-xs">{intf.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{intf.sourceSystem} &rarr; {intf.targetSystem}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            intf.status === 'healthy' ? 'bg-status-green/10 text-status-green border-status-green/20' :
                            'bg-status-red/10 text-status-red border-status-red/20'
                          }>
                            {intf.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">No interfaces found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}