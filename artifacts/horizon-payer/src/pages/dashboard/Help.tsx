import { useRef, useState } from "react";
import { WalkthroughVideo } from "@/components/walkthrough/WalkthroughVideo";
import { useVideoRecorder } from "@/lib/video/recording";
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
  DownloadIcon,
  CircleStopIcon,
  LoaderIcon,
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
  { email: "exec@horizon.com",  role: "Executive",            access: "Full read access — all dashboard sections" },
  { email: "ibm@horizon.com",   role: "IBM Delivery",         access: "IBM AIOps Value, Vendor Invoices, Roadmap" },
  { email: "admin@horizon.com", role: "Platform Administrator", access: "All sections + Administration tab (data refresh for every page)" },
];

const TIPS = [
  { icon: ClockIcon, title: "Global Time Range", desc: "Use the time-range selector in the header to filter all dashboards between 24H, 7D, and 14D windows simultaneously." },
  { icon: CpuIcon, title: "IBM AIOps Period Selector", desc: "The IBM AIOps Value page has its own independent period selector (7D / 14D / 21D) — separate from the global filter." },
  { icon: ShieldCheckIcon, title: "Live Data Polling", desc: "All metrics auto-refresh every 30 seconds. Watch the 'Updated Xs ago' counter in the header to confirm live polling." },
  { icon: KeyIcon, title: "Demo Credentials", desc: "Password for all demo accounts is: IBM@Horizon2027. Switch accounts to explore role-based views." },
];

function formatProgress(pct: number) {
  const totalSecs = Math.round((pct / 100) * 167);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${String(s).padStart(2, "0")} / 2:47`;
}

export default function Help() {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [videoKey, setVideoKey] = useState(0);
  const { recordingState, progress, startRecording, cancelRecording } = useVideoRecorder();

  const handleDownload = () => {
    startRecording(videoContainerRef as any, () => setVideoKey((k) => k + 1));
  };

  const isRecording = recordingState === "recording";
  const isRequesting = recordingState === "requesting";
  const isEncoding = recordingState === "encoding";
  const isBusy = isRecording || isRequesting || isEncoding;

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
        <div ref={videoContainerRef} className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <div className="absolute inset-0">
            <WalkthroughVideo key={videoKey} />
          </div>

          {/* Recording progress overlay */}
          {isRecording && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/30 z-50">
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${progress}%`, background: "#da1e28" }}
              />
            </div>
          )}

          {/* Recording badge */}
          {isRecording && (
            <div className="absolute top-3 left-3 z-50 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: "rgba(218,30,40,0.9)", color: "#fff", backdropFilter: "blur(8px)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
              REC · {formatProgress(progress)}
            </div>
          )}

          {/* Encoding/requesting overlay */}
          {(isRequesting || isEncoding) && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center"
              style={{ background: "rgba(5,14,45,0.85)", backdropFilter: "blur(8px)" }}>
              <LoaderIcon className="w-8 h-8 text-white animate-spin mb-3" />
              <p className="text-white text-sm font-medium">
                {isRequesting ? "Waiting for screen share permission…" : "Encoding video file…"}
              </p>
              <p className="text-white/50 text-xs mt-1">
                {isRequesting ? "Select this tab in the browser dialog" : "Your download will start momentarily"}
              </p>
            </div>
          )}
        </div>

        {/* Caption bar */}
        <div className="px-4 py-3 border-t bg-muted/30 flex items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground font-medium flex-1 min-w-0 truncate">
            CareOps360 Platform Walkthrough · ~2:47 min · Auto-plays and loops · Click the speaker button to enable narration
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isRecording ? (
              <button
                onClick={cancelRecording}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: "rgba(218,30,40,0.12)", color: "#da1e28", border: "1px solid rgba(218,30,40,0.3)" }}
              >
                <CircleStopIcon size={12} />
                Stop recording
              </button>
            ) : (
              <button
                onClick={handleDownload}
                disabled={isBusy}
                title="Record the animation and download as .webm"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(15,98,254,0.1)",
                  color: "#0f62fe",
                  border: "1px solid rgba(15,98,254,0.25)",
                }}
              >
                {isEncoding ? (
                  <LoaderIcon size={12} className="animate-spin" />
                ) : (
                  <DownloadIcon size={12} />
                )}
                {isEncoding ? "Encoding…" : "Download video"}
              </button>
            )}
            <span className="text-xs text-muted-foreground">Horizon BCBS × IBM</span>
          </div>
        </div>

        {/* Recording instruction banner */}
        {isRequesting && (
          <div className="px-4 py-2.5 border-t text-xs text-center"
            style={{ background: "rgba(15,98,254,0.06)", color: "#0f62fe", borderColor: "rgba(15,98,254,0.15)" }}>
            Your browser will ask which screen to share — select <strong>this tab</strong> to record just the video. Recording runs for ~2:47 min, then downloads automatically.
          </div>
        )}
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
                Password for all accounts: <span className="font-mono font-semibold text-muted-foreground">IBM@Horizon2027</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
