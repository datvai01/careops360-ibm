import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { TimeRangeProvider } from "@/contexts/TimeRangeContext";
import NotFound from "@/pages/not-found";

import Login from "@/pages/Login";
import { AppShell } from "@/components/layout/AppShell";
import ExecutiveOverview from "@/pages/dashboard/ExecutiveOverview";
import Claims from "@/pages/dashboard/Claims";
import PriorAuth from "@/pages/dashboard/PriorAuth";
import Providers from "@/pages/dashboard/Providers";
import VendorInvoices from "@/pages/dashboard/VendorInvoices";
import AppHealth from "@/pages/dashboard/AppHealth";
import IbmAms from "@/pages/dashboard/IbmAms";
import Ask from "@/pages/dashboard/Ask";
import DigitalRoadmap from "@/pages/dashboard/DigitalRoadmap";
import EnrollmentIntelligence from "@/pages/dashboard/EnrollmentIntelligence";
import DigitalFrontDoorRoadmap from "@/pages/dashboard/DigitalFrontDoorRoadmap";
import Help from "@/pages/dashboard/Help";
import CapabilityUplift from "@/pages/dashboard/CapabilityUplift";
import MemberServices from "@/pages/dashboard/MemberServices";
import Administration from "@/pages/dashboard/Administration";
import PodTransformation from "@/pages/dashboard/PodTransformation";
import TransformationEcosystem from "@/pages/dashboard/TransformationEcosystem";
import TransformationMindsetDashboard from "@/pages/dashboard/TransformationMindsetDashboard";
import TransformationMindsetSurvey from "@/pages/TransformationMindsetSurvey";
import AutonomousAgents from "@/pages/dashboard/AutonomousAgents";
import TransformationInitiatives from "@/pages/dashboard/TransformationInitiatives";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchInterval: 30000, staleTime: 10000 } },
});

function ProtectedRoute({ component: Component, ...rest }: any) {
  const token = localStorage.getItem("horizon_token");
  if (!token) {
    return <Redirect to="/" />;
  }
  return <Component {...rest} />;
}

function DashboardRouter() {
  return (
    <AppShell>
      <Switch>
        <Route path="/dashboard" component={ExecutiveOverview} />
        <Route path="/dashboard/members" component={() => <Redirect to="/dashboard/enrollment-intelligence" />} />
        <Route path="/dashboard/claims" component={Claims} />
        <Route path="/dashboard/prior-auth" component={PriorAuth} />
        <Route path="/dashboard/providers" component={Providers} />
        <Route path="/dashboard/contact-center" component={() => <Redirect to="/dashboard/enrollment-intelligence" />} />
        <Route path="/dashboard/vendor-invoices"  component={VendorInvoices}  />
        <Route path="/dashboard/member-services"  component={MemberServices}  />
        <Route path="/dashboard/app-health" component={AppHealth} />
        <Route path="/dashboard/ibm-ams" component={IbmAms} />
        <Route path="/dashboard/ask" component={Ask} />
        <Route path="/dashboard/digital-roadmap" component={DigitalRoadmap} />
        <Route path="/dashboard/enrollment-intelligence" component={EnrollmentIntelligence} />
        <Route path="/dashboard/digital-front-door-roadmap" component={DigitalFrontDoorRoadmap} />
        <Route path="/dashboard/help" component={Help} />
        <Route path="/dashboard/capability-uplift" component={CapabilityUplift} />
        <Route path="/dashboard/pod-transformation" component={PodTransformation} />
        <Route path="/dashboard/transformation-ecosystem" component={TransformationEcosystem} />
        <Route path="/dashboard/transformation-mindset" component={TransformationMindsetDashboard} />
        <Route path="/dashboard/autonomous-agents" component={AutonomousAgents} />
        <Route path="/dashboard/transformation-initiatives" component={TransformationInitiatives} />
        <Route path="/dashboard/administration" component={Administration} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/survey" component={TransformationMindsetSurvey} />
      <Route path="/dashboard/*" component={() => <ProtectedRoute component={DashboardRouter} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={DashboardRouter} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="horizon-ui-theme">
        <TimeRangeProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
        </TimeRangeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
