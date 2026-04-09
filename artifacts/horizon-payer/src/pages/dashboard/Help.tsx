import { WalkthroughVideo } from "@/components/walkthrough/WalkthroughVideo";
import {
  LayoutDashboardIcon,
  ActivityIcon,
  UsersIcon,
  FileTextIcon,
  StethoscopeIcon,
  BuildingIcon,
  HeadphonesIcon,
  DollarSignIcon,
  CpuIcon,
  MapIcon,
  MessageSquareIcon,
  ClockIcon,
  ShieldCheckIcon,
  KeyIcon,
} from "lucide-react";

const CHAPTERS = [
  { time: "0:00", label: "Platform Introduction", icon: LayoutDashboardIcon, desc: "CareOps360 overview — Horizon + IBM partnership" },
  { time: "0:10", label: "Executive Overview", icon: LayoutDashboardIcon, desc: "KPIs, claims trends, and global time range filter" },
  { time: "0:23", label: "App Health", icon: ActivityIcon, desc: "System status, incident severity, and SLA tracking" },
  { time: "0:36", label: "Members", icon: UsersIcon, desc: "Enrollment KPIs, demographics, and population mix" },
  { time: "0:49", label: "Claims", icon: FileTextIcon, desc: "Processing volume, auto-adjudication rate, LOB backlog" },
  { time: "1:02", label: "Prior Auth", icon: StethoscopeIcon, desc: "Approval rates, backlog queue, reviewer workload" },
  { time: "1:15", label: "Providers", icon: BuildingIcon, desc: "Network status, credentialing, contract pipeline" },
  { time: "1:28", label: "Contact Center", icon: HeadphonesIcon, desc: "Call volume, FCR, IVR deflection, handle time" },
  { time: "1:41", label: "Vendor Invoices", icon: DollarSignIcon, desc: "IBM-scoped invoice management and payment status" },
  { time: "1:54", label: "IBM AIOps Value", icon: CpuIcon, desc: "Automation metrics, 7D/14D/21D selector, cost savings" },
  { time: "2:08", label: "Transformation Roadmap", icon: MapIcon, desc: "Digital journey milestones and initiative tracking" },
  { time: "2:21", label: "Ask Assistant", icon: MessageSquareIcon, desc: "Natural-language Q&A for instant platform insights" },
  { time: "2:37", label: "Outro", icon: LayoutDashboardIcon, desc: "CareOps360 × IBM Horizon partnership lock-up" },
];

const DEMO_ACCOUNTS = [
  { email: "exec@horizon.com", role: "Executive", access: "Full read access — all 11 sections" },
  { email: "ops@horizon.com", role: "Operations", access: "Operational dashboards — Claims, PA, Providers" },
  { email: "it@horizon.com", role: "IT / Engineering", access: "App Health, Vendor Invoices, IBM AIOps" },
  { email: "ibm@horizon.com", role: "IBM Delivery", access: "IBM AIOps Value, Vendor Invoices, Roadmap" },
];

const TIPS = [
  { icon: ClockIcon, title: "Global Time Range", desc: "Use the time-range selector in the header to filter all dashboards between 24H, 7D, and 14D windows simultaneously." },
  { icon: CpuIcon, title: "IBM AIOps Period Selector", desc: "The IBM AIOps Value page has its own independent period selector (7D / 14D / 21D) — separate from the global filter." },
  { icon: ShieldCheckIcon, title: "Live Data Polling", desc: "All metrics auto-refresh every 30 seconds. Watch the 'Updated Xs ago' counter in the header to confirm live polling." },
  { icon: KeyIcon, title: "Demo Credentials", desc: "Password for all demo accounts is: demo123. Switch accounts to explore role-based views." },
];

export default function Help() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Help & Platform Walkthrough</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          A guided tour of CareOps360 — all 11 dashboard sections in ~2:47 min. Auto-plays and loops.
        </p>
      </div>

      {/* Video Player */}
      <div className="rounded-xl overflow-hidden border bg-card shadow-sm">
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <div className="absolute inset-0">
            <WalkthroughVideo />
          </div>
        </div>
        <div className="px-4 py-3 border-t bg-muted/30 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            CareOps360 Platform Walkthrough · ~2:47 min · Auto-plays and loops
          </span>
          <span className="text-xs text-muted-foreground">
            Horizon BCBS × IBM
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chapter Index */}
        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-primary" />
            Chapter Index
          </h2>
          <div className="space-y-1">
            {CHAPTERS.map((ch) => {
              const Icon = ch.icon;
              return (
                <div
                  key={ch.time}
                  className="flex items-start gap-3 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-xs font-mono text-muted-foreground/60 w-10 pt-0.5 flex-shrink-0 group-hover:text-primary transition-colors">
                    {ch.time}
                  </span>
                  <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  <div className="min-w-0">
                    <div className="text-xs font-medium leading-tight">{ch.label}</div>
                    <div className="text-[11px] text-muted-foreground/60 mt-0.5 leading-tight">{ch.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips + Demo Accounts */}
        <div className="space-y-6">
          {/* Quick Tips */}
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-sm mb-4">Quick-Start Tips</h2>
            <div className="space-y-4">
              {TIPS.map((tip) => {
                const Icon = tip.icon;
                return (
                  <div key={tip.title} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold leading-tight">{tip.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{tip.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <KeyIcon className="w-4 h-4 text-primary" />
              Demo Accounts
            </h2>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acct) => (
                <div key={acct.email} className="rounded-md border bg-muted/30 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-xs font-mono font-medium">{acct.email}</span>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm"
                      style={{ background: "rgba(15,98,254,0.12)", color: "#0f62fe" }}
                    >
                      {acct.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{acct.access}</div>
                </div>
              ))}
              <div className="text-[11px] text-muted-foreground/50 mt-2 px-1">
                Password for all accounts: <span className="font-mono font-semibold text-muted-foreground">demo123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
