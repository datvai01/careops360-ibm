import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetCurrentUser, useGetAlerts } from "@workspace/api-client-react";
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
  LogOutIcon,
  SunIcon,
  MoonIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const NAV_ITEMS = [
  { name: "Executive Overview", path: "/dashboard", icon: LayoutDashboardIcon },
  { name: "Members", path: "/dashboard/members", icon: UsersIcon },
  { name: "Claims", path: "/dashboard/claims", icon: FileTextIcon },
  { name: "Prior Auth", path: "/dashboard/prior-auth", icon: StethoscopeIcon },
  { name: "Providers", path: "/dashboard/providers", icon: BuildingIcon },
  { name: "Contact Center", path: "/dashboard/contact-center", icon: HeadphonesIcon },
  { name: "Vendor Invoices", path: "/dashboard/vendor-invoices", icon: DollarSignIcon },
  { name: "App Health", path: "/dashboard/app-health", icon: ActivityIcon },
  { name: "IBM AMS Value", path: "/dashboard/ibm-ams", icon: CpuIcon },
  { name: "Ask Assistant", path: "/dashboard/ask", icon: MessageSquareIcon },
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
  const stripeH = size * 0.052;
  const gap = size * 0.068;
  const stripes = 8;
  const totalH = stripes * stripeH + (stripes - 1) * gap;
  const offsetY = (size - totalH) / 2;
  return (
    <div
      className="rounded-md flex items-center justify-center flex-shrink-0 select-none overflow-hidden"
      style={{
        width: size,
        height: size,
        background: "#0f62fe",
        boxShadow: "0 2px 6px rgba(15,98,254,0.45)",
      }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {Array.from({ length: stripes }).map((_, i) => (
          <rect key={i} x={size * 0.08} y={offsetY + i * (stripeH + gap)} width={size * 0.84} height={stripeH} fill="white" />
        ))}
        <rect x={0} y={0} width={size * 0.08} height={size} fill="#0f62fe" />
        <rect x={size * 0.92} y={0} width={size * 0.08} height={size} fill="#0f62fe" />
        <text x={size / 2} y={size * 0.665} textAnchor="middle" fill="white" fontSize={size * 0.35} fontWeight="900" fontFamily="'Arial Black', Helvetica, sans-serif" letterSpacing={size * 0.018}>IBM</text>
        {Array.from({ length: stripes }).map((_, i) => i % 2 === 1 ? (
          <rect key={`m${i}`} x={size * 0.08} y={offsetY + i * (stripeH + gap)} width={size * 0.84} height={stripeH} fill="#0f62fe" />
        ) : null)}
      </svg>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user } = useGetCurrentUser();
  const { data: alerts } = useGetAlerts({ query: { refetchInterval: 30000 } });
  const { theme, setTheme } = useTheme();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefreshed((prev) => (prev < 30 ? prev + 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeAlerts = alerts?.filter(a => a.status === "active" && a.severity === "critical") || [];

  const handleLogout = () => {
    localStorage.removeItem("horizon_token");
    setLocation("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div 
        className={cn(
          "flex-shrink-0 border-r bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="h-16 flex items-center px-3 border-b gap-2 overflow-hidden">
          {sidebarOpen ? (
            /* Expanded: show both marks + "Horizon + IBM" text */
            <div className="flex items-center gap-2 min-w-0">
              <HMark size={28} />
              <IbmMarkInline size={28} />
              <div className="flex flex-col min-w-0 ml-0.5">
                <div className="flex items-baseline gap-1 leading-none">
                  <span className="font-black text-sm tracking-tight" style={{ color: "#1565c0" }}>Horizon</span>
                  <span className="text-muted-foreground/50 text-xs font-light">+</span>
                  <span className="font-black text-sm tracking-wider" style={{ color: "#0f62fe" }}>IBM</span>
                </div>
                <span className="text-[10px] text-muted-foreground/50 font-medium tracking-wide truncate">CareOps360</span>
              </div>
            </div>
          ) : (
            /* Collapsed: stack the two marks */
            <div className="flex flex-col items-center gap-1 w-full">
              <HMark size={22} />
              <IbmMarkInline size={22} />
            </div>
          )}
        </div>
        
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <div 
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors",
                      isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      !sidebarOpen && "justify-center"
                    )}
                    title={!sidebarOpen ? item.name : undefined}
                  >
                    <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-primary" : "")} />
                    {sidebarOpen && <span className="ml-3 truncate">{item.name}</span>}
                  </div>
                </Link>
              );
            })}
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
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon className="w-5 h-5" />
            </Button>

            {/* Horizon + IBM co-brand in header */}
            <div className="hidden md:flex items-center gap-2 pl-1 pr-3 border-r border-border/60 mr-1">
              <HMark size={30} />
              <IbmMarkInline size={30} />
              <div className="flex flex-col leading-none ml-0.5">
                <div className="flex items-baseline gap-1">
                  <span className="font-black text-sm" style={{ color: "#1565c0" }}>Horizon</span>
                  <span className="text-muted-foreground/40 text-xs">+</span>
                  <span className="font-black text-sm" style={{ color: "#0f62fe" }}>IBM</span>
                </div>
                <span className="text-[10px] text-muted-foreground/50 font-medium tracking-wide">Executive Command Center</span>
              </div>
            </div>

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
      </div>
    </div>
  );
}