import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import NotFound from "@/pages/not-found";

import Login from "@/pages/Login";
import { AppShell } from "@/components/layout/AppShell";
import ExecutiveOverview from "@/pages/dashboard/ExecutiveOverview";
import Members from "@/pages/dashboard/Members";
import Claims from "@/pages/dashboard/Claims";
import PriorAuth from "@/pages/dashboard/PriorAuth";
import Providers from "@/pages/dashboard/Providers";
import ContactCenter from "@/pages/dashboard/ContactCenter";
import Finance from "@/pages/dashboard/Finance";
import AppHealth from "@/pages/dashboard/AppHealth";
import IbmAms from "@/pages/dashboard/IbmAms";
import Ask from "@/pages/dashboard/Ask";

const queryClient = new QueryClient();

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
        <Route path="/dashboard/finance" component={Finance} />
        <Route path="/dashboard/app-health" component={AppHealth} />
        <Route path="/dashboard/ibm-ams" component={IbmAms} />
        <Route path="/dashboard/ask" component={Ask} />
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
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
