import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Settings, Users } from "lucide-react";
import { RefreshDataTab } from "./TalentPlan";

const IBM_BLUE = "#0F62FE";

export default function Administration() {
  return (
    <div className="p-6 space-y-5">
      {/* Page header */}
      <Card className="p-5 border-l-4" style={{ borderLeftColor: IBM_BLUE }}>
        <div className="flex items-start gap-4">
          <div className="rounded-lg p-2.5 flex-shrink-0" style={{ background: `${IBM_BLUE}15` }}>
            <Settings size={20} style={{ color: IBM_BLUE }} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Administration</h1>
            <p className="text-sm leading-relaxed text-muted-foreground mt-1">
              Operational controls for keeping the CareOps360 portal in sync with the latest source-of-truth data.
              Use the tabs below to refresh datasets that power the executive views.
            </p>
          </div>
        </div>
      </Card>

      {/* Admin tabs */}
      <Tabs defaultValue="talent-plan" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto justify-start gap-1 bg-muted/50 p-1">
          <TabsTrigger
            value="talent-plan"
            className="text-xs data-[state=active]:bg-white data-[state=active]:text-[#0F62FE] data-[state=active]:shadow-sm gap-1.5"
          >
            <Users size={12} /> Talent Plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="talent-plan" className="mt-4">
          <RefreshDataTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
