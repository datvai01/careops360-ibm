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
import Members from "@/pages/dashboard/Members";
import Claims from "@/pages/dashboard/Claims";
import PriorAuth from "@/pages/dashboard/PriorAuth";
import Providers from "@/pages/dashboard/Providers";
import ContactCenter from "@/pages/dashboard/ContactCenter";
import VendorInvoices from "@/pages/dashboard/VendorInvoices";
import AppHealth from "@/pages/dashboard/AppHealth";
import IbmAms from "@/pages/dashboard/IbmAms";
import Ask from "@/pages/dashboard/Ask";
import DigitalRoadmap from "@/pages/dashboard/DigitalRoadmap";
import EnrollmentIntelligence from "@/pages/dashboard/EnrollmentIntelligence";
import DigitalFrontDoorRoadmap from "@/pages/dashboard/DigitalFrontDoorRoadmap";
import Help from "@/pages/dashboard/Help";
import CapabilityUplift from "@/pages/dashboard/CapabilityUplift";

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
        <Route path="/dashboard/members" component={Members} />
        <Route path="/dashboard/claims" component={Claims} />
        <Route path="/dashboard/prior-auth" component={PriorAuth} />
        <Route path="/dashboard/providers" component={Providers} />
        <Route path="/dashboard/contact-center" component={ContactCenter} />
        <Route path="/dashboard/vendor-invoices" component={VendorInvoices} />
        <Route path="/dashboard/app-health" component={AppHealth} />
        <Route path="/dashboard/ibm-ams" component={IbmAms} />
        <Route path="/dashboard/ask" component={Ask} />
        <Route path="/dashboard/digital-roadmap" component={DigitalRoadmap} />
        <Route path="/dashboard/enrollment-intelligence" component={EnrollmentIntelligence} />
        <Route path="/dashboard/digital-front-door-roadmap" component={DigitalFrontDoorRoadmap} />
        <Route path="/dashboard/help" component={Help} />
        <Route path="/dashboard/capability-uplift" component={CapabilityUplift} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard/*" component={() => <ProtectedRoute component={DashboardRouter} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={DashboardRouter} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="horizon-ui-theme">
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
