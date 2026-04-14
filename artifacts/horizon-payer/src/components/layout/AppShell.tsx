import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useGetCurrentUser, useGetAlerts, useLogout } from "@workspace/api-client-react";
import { 
  BellIcon, 
  SearchIcon, 
  MenuIcon,
  LayoutDashboardIcon,
  UsersIcon,
  FileTextIcon,
  StethoscopeIcon,
  BuildingIcon,
  HeadphonesIcon,
  DollarSignIcon,
  ActivityIcon,
  CpuIcon,
  MessageSquareIcon,
  MapIcon,
  LogOutIcon,
  SunIcon,
  MoonIcon,
  HelpCircleIcon,
  Info,
  GitMerge,
  TrendingUp,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";
import { SessionTimeoutModal } from "./SessionTimeoutModal";

type NavItem = { name: string; path: string; icon: React.ElementType };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { name: "Executive Overview", path: "/dashboard", icon: LayoutDashboardIcon },
      { name: "App Health", path: "/dashboard/app-health", icon: ActivityIcon },
    ],
  },
  {
    label: "Member & Care Operations",
    items: [
      { name: "Claims", path: "/dashboard/claims", icon: FileTextIcon },
      { name: "Prior Auth", path: "/dashboard/prior-auth", icon: StethoscopeIcon },
      { name: "Providers", path: "/dashboard/providers", icon: BuildingIcon },
      { name: "Member & Enrollment Ops", path: "/dashboard/enrollment-intelligence", icon: HeadphonesIcon },
    ],
  },
  {
    label: "Operations & Support",
    items: [
      { name: "Vendor Invoices",  path: "/dashboard/vendor-invoices",  icon: DollarSignIcon },
      { name: "Member Services", path: "/dashboard/member-services", icon: HeadphonesIcon  },
    ],
  },
  {
    label: "Value & Insights",
    items: [
      { name: "IBM AIOps Value", path: "/dashboard/ibm-ams", icon: CpuIcon },
      { name: "Transformation Roadmap", path: "/dashboard/digital-roadmap", icon: MapIcon },
      { name: "Capability Uplift & AI Readiness", path: "/dashboard/capability-uplift", icon: Award },
    ],
  },
  {
    label: "Assistant",
    items: [
      { name: "Ask Assistant", path: "/dashboard/ask", icon: MessageSquareIcon },
    ],
  },
  {
    label: "Resources",
    items: [
      { name: "Help & Walkthrough", path: "/dashboard/help", icon: HelpCircleIcon },
    ],
  },
];

function HMark({ size = 26 }: { size?: number }) {
  return (
    <div
      className="rounded-md flex items-center justify-center flex-shrink-0 select-none"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #1a237e 0%, #1565c0 50%, #0d47a1 100%)",
        boxShadow: "0 2px 6px rgba(21,101,192,0.45)",
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 32 32" fill="none">
        <path d="M4 4h5v10h14V4h5v24h-5V19H9v9H4V4z" fill="white" />
      </svg>
    </div>
  );
}

function IbmMarkInline({ size = 26 }: { size?: number }) {
  const r = size * 0.22;
  return (
    <svg width={size * 1.8} height={size} viewBox={`0 0 ${size * 1.8} ${size}`} className="flex-shrink-0 select-none">
      <rect x="0" y="0" width={size * 1.8} height={size} rx={r} ry={r} fill="#0f62fe" />
      {[0.18, 0.28, 0.42, 0.52, 0.66, 0.76].map((yFrac, i) => (
        <rect key={i} x={size * 0.18} y={size * yFrac} width={size * 1.44} height={size * 0.065} fill="white" opacity={i % 2 === 0 ? 0.18 : 0.1} />
      ))}
      <text
        x={size * 0.9}
        y={size * 0.68}
        textAnchor="middle"
        fill="white"
        fontSize={size * 0.46}
        fontWeight="900"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        letterSpacing={size * 0.04}
      >IBM</text>
    </svg>
  );
}

const SESSION_COUNTDOWN_SECONDS = 60;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user } = useGetCurrentUser();
  const { data: alerts } = useGetAlerts();
  const { theme, setTheme } = useTheme();
  const logoutMutation = useLogout();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(0);
  const [sessionWarning, setSessionWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefreshed((prev) => (prev < 30 ? prev + 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const doLogout = useCallback(async () => {
    const token = localStorage.getItem("horizon_token");
    if (token) {
      try {
        await logoutMutation.mutateAsync();
      } catch {
        // best effort
      }
    }
    localStorage.removeItem("horizon_token");
    setLocation("/");
  }, [logoutMutation, setLocation]);

  const handleLogout = useCallback(() => {
    doLogout();
  }, [doLogout]);

  const handleSessionWarning = useCallback(() => {
    setSessionWarning(true);
  }, []);

  const handleSessionTimeout = useCallback(() => {
    setSessionWarning(false);
    doLogout();
  }, [doLogout]);

  const { resetTimers } = useInactivityTimeout({
    warningMinutes: 9,
    timeoutMinutes: 10,
    onWarning: handleSessionWarning,
    onTimeout: handleSessionTimeout,
    enabled: !!localStorage.getItem("horizon_token"),
  });

  const handleExtendSession = useCallback(() => {
    setSessionWarning(false);
    resetTimers();
  }, [resetTimers]);

  const activeAlerts = alerts?.filter(a => a.status === "active" && a.severity === "critical") || [];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Session Timeout Modal */}
      <SessionTimeoutModal
        open={sessionWarning}
        countdownSeconds={SESSION_COUNTDOWN_SECONDS}
        onExtend={handleExtendSession}
        onLogout={handleLogout}
      />

      {/* Sidebar */}
      <div 
        className={cn(
          "flex-shrink-0 border-r bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="h-16 flex items-center px-3 border-b gap-2 overflow-hidden">
          {sidebarOpen ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <HMark size={30} />
              <IbmMarkInline size={22} />
              <div className="flex flex-col min-w-0 leading-none">
                <span className="font-black text-[13px] tracking-tight" style={{ color: "#1565c0" }}>Horizon</span>
                <span className="text-[10px] text-muted-foreground/50 font-medium tracking-wide">CareOps360</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 w-full py-1">
              <HMark size={22} />
              <IbmMarkInline size={16} />
            </div>
          )}
        </div>
        
        <ScrollArea className="flex-1 py-3">
          <nav className="px-2 space-y-4">
            {NAV_GROUPS.map((group, gi) => (
              <div key={group.label}>
                {sidebarOpen && (
                  <div className={cn("px-3 mb-1", gi > 0 && "pt-1")}>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 select-none">
                      {group.label}
                    </span>
                  </div>
                )}
                {!sidebarOpen && gi > 0 && (
                  <div className="mx-3 mb-1 border-t border-sidebar-border/40" />
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = location === item.path;
                    const Icon = item.icon;
                    return (
                      <Link key={item.path} href={item.path}>
                        <div
                          className={cn(
                            "flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                            !sidebarOpen && "justify-center"
                          )}
                          title={!sidebarOpen ? item.name : undefined}
                        >
                          <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary" : "")} />
                          {sidebarOpen && <span className="ml-3 text-sm truncate">{item.name}</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>
        
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30 text-xs flex flex-col gap-1">
          {sidebarOpen ? (
            <>
              <div className="text-muted-foreground/80 font-medium">Powered by IBM AIOps</div>
              <div className="text-muted-foreground/40">Managed by IBM</div>
            </>
          ) : (
            <div className="font-black text-center text-[10px]" style={{ color: "#0f62fe" }}>360</div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Demo Environment Banner */}
        <div
          className="flex-shrink-0 flex items-center gap-2 px-4 py-1.5 text-[11px] border-b"
          style={{
            background: "linear-gradient(90deg, rgba(15,98,254,0.06) 0%, transparent 80%)",
            borderBottomColor: "rgba(15,98,254,0.15)",
          }}
        >
          <Info className="w-3 h-3 flex-shrink-0" style={{ color: "#0f62fe" }} />
          <span className="font-semibold" style={{ color: "#0f62fe" }}>DEMONSTRATION ENVIRONMENT</span>
          <span className="text-muted-foreground/70 hidden sm:inline">
            — Synthetic data only. Architecture-ready for deployment on Horizon BCBS secure infrastructure with live production data.
          </span>
        </div>

        {/* Header */}
        <header className="h-14 border-b bg-card flex items-center justify-between px-4 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon className="w-5 h-5" />
            </Button>

            <div className="hidden md:flex items-center space-x-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">PROD</Badge>
              <div className="text-sm font-medium text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block w-64">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="w-full bg-muted/50 pl-8 rounded-full h-9" />
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground mr-2">
              <div className="w-2 h-2 rounded-full bg-status-green mr-2 animate-pulse"></div>
              Updated {lastRefreshed}s ago
            </div>

            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </Button>
            
            <Button variant="ghost" size="icon" className="relative">
              <BellIcon className="w-5 h-5" />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name?.substring(0,2) || "EX"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    <Badge variant="secondary" className="w-fit mt-1">{user?.role}</Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Alert Banner */}
        {activeAlerts.length > 0 && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-destructive text-sm font-medium">
              <ActivityIcon className="w-4 h-4 animate-pulse" />
              <span>Critical System Alert: {activeAlerts[0].title} - {activeAlerts[0].description}</span>
            </div>
            <Link href="/dashboard/app-health">
              <Button variant="link" size="sm" className="h-auto p-0 text-destructive underline">View Details</Button>
            </Link>
          </div>
        )}

        {/* Main scrollable area */}
        <main className="flex-1 overflow-auto bg-muted/20 p-6">
          {children}
        </main>

        {/* IBM Disclaimer Bar */}
        <div
          className="flex-shrink-0 border-t px-6 py-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-[10px] leading-relaxed"
          style={{
            background: "linear-gradient(90deg, rgba(15,98,254,0.04) 0%, transparent 100%)",
            borderTopColor: "rgba(15,98,254,0.12)",
          }}
        >
          <span className="text-muted-foreground/60">
            <span className="font-semibold text-muted-foreground/80">© 2026 IBM Corporation. All rights reserved.</span>
            {" "}This portal and all content contained herein are proprietary and confidential to IBM Corporation and Horizon Blue Cross Blue Shield. Unauthorized access, use, disclosure, reproduction, or distribution of any information from this portal — in whole or in part — without the prior written consent of IBM Corporation is strictly prohibited and may be subject to civil and criminal penalties.
          </span>
          <span className="text-muted-foreground/40 whitespace-nowrap font-medium tracking-wide uppercase text-[9px]">IBM Confidential · Not for Distribution</span>
        </div>
      </div>
    </div>
  );
}
