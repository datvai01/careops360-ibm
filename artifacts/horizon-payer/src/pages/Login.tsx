import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, TrendingUp, Cpu, Users, ChevronRight, Eye, EyeOff } from "lucide-react";

function HorizonMark({ size = 44 }: { size?: number }) {
  return (
    <div
      className="rounded-xl flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #1a237e 0%, #1565c0 50%, #0d47a1 100%)",
        boxShadow: "0 4px 20px rgba(21,101,192,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
      }}
    >
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 32 32" fill="none">
        <path d="M4 4h5v10h14V4h5v24h-5V19H9v9H4V4z" fill="white" />
      </svg>
    </div>
  );
}

const CAPABILITIES = [
  {
    icon: TrendingUp,
    title: "Executive Intelligence",
    desc: "Real-time KPIs across claims, members, and prior authorization.",
  },
  {
    icon: Cpu,
    title: "IBM AIOps Integration",
    desc: "Automated incident response, shift-left deflection, and self-healing operations.",
  },
  {
    icon: Users,
    title: "Member & Provider Ops",
    desc: "End-to-end visibility from enrollment through care delivery.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance & Audit-Ready",
    desc: "HIPAA-aligned audit trails and role-based access controls.",
  },
];

const STATS = [
  { value: "$3.2M", label: "YTD Cost Reduction" },
  { value: "96%", label: "SLA Compliance" },
  { value: "4.2M", label: "Members Managed" },
];

const DEMO_ACCOUNTS = [
  { email: "exec@horizon.com", role: "Executive" },
  { email: "ops@horizon.com", role: "Operations" },
  { email: "it@horizon.com", role: "IT" },
  { email: "ibm@horizon.com", role: "IBM Partner" },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("exec@horizon.com");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("horizon_token", data.token);
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials",
          variant: "destructive",
        });
      },
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { username, password } });
  };

  return (
    <div className="min-h-screen w-full flex">

      {/* ── LEFT PANEL — branded ── */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(155deg, #050e2d 0%, #0a1a4a 35%, #0d2260 60%, #0f2d78 100%)",
        }}
      >
        {/* Geometric grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,98,254,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(15,98,254,0.07) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Radial glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(15,98,254,0.20) 0%, transparent 70%)",
            top: -200,
            right: -200,
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(21,101,192,0.15) 0%, transparent 70%)",
            bottom: -100,
            left: -100,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">

          {/* Logo row */}
          <div className="flex items-center gap-3">
            <HorizonMark size={44} />
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-tight tracking-tight">Horizon BCBS</span>
              <span className="text-blue-300/70 text-xs font-medium tracking-wide">+ IBM Partnership</span>
            </div>
            <div className="ml-auto">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  background: "rgba(15,98,254,0.25)",
                  border: "1px solid rgba(15,98,254,0.45)",
                  color: "#93b8ff",
                }}
              >
                CareOps 360
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="mt-16 xl:mt-20">
            <p className="text-blue-300/70 text-sm font-semibold tracking-widest uppercase mb-4">
              Executive Command Center
            </p>
            <h1 className="text-white font-black leading-none" style={{ fontSize: "clamp(2.4rem, 4vw, 3.5rem)", letterSpacing: "-0.03em" }}>
              Operations.<br />
              <span style={{ color: "#4d8fff" }}>Outcomes.</span><br />
              One Platform.
            </h1>
            <p className="mt-6 text-blue-200/60 text-base leading-relaxed max-w-md">
              Real-time visibility across claims, members, prior auth, and IBM AIOps — purpose-built for Horizon BCBS leadership.
            </p>
          </div>

          {/* Stats bar */}
          <div
            className="mt-10 flex gap-6 p-5 rounded-2xl"
            style={{
              background: "rgba(15,98,254,0.12)",
              border: "1px solid rgba(15,98,254,0.22)",
            }}
          >
            {STATS.map((s) => (
              <div key={s.label} className="flex-1 text-center">
                <div className="text-white font-black text-2xl xl:text-3xl" style={{ color: "#4d8fff" }}>
                  {s.value}
                </div>
                <div className="text-blue-300/60 text-xs font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Capabilities */}
          <div className="mt-10 space-y-4 flex-1">
            {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
                  style={{
                    background: "rgba(15,98,254,0.18)",
                    border: "1px solid rgba(15,98,254,0.30)",
                  }}
                >
                  <Icon size={16} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-white/90 text-sm font-semibold">{title}</p>
                  <p className="text-blue-300/55 text-xs leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-white/10 flex items-center justify-between">
            <span className="text-blue-300/40 text-xs">© 2026 CareOps360</span>
            <span className="text-blue-300/40 text-xs">Managed by IBM · HIPAA Compliant</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 bg-background">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <HorizonMark size={40} />
          <div>
            <p className="font-bold text-base leading-tight">Horizon BCBS</p>
            <p className="text-muted-foreground text-xs">Executive Command Center</p>
          </div>
        </div>

        <div className="w-full max-w-sm xl:max-w-md">

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground text-sm mt-1">Sign in to access the command center</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium">Email address</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="you@horizon.com"
                className="h-11"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold text-sm"
              disabled={loginMutation.isPending}
              style={{ background: "#0f62fe" }}
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Sign In
                  <ChevronRight size={16} />
                </span>
              )}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium px-1">Demo accounts</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map(({ email, role }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => setUsername(email)}
                  className="text-left px-3 py-2.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{role}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{email}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 text-center mt-3">All accounts use password: <span className="font-mono font-semibold text-muted-foreground">demo123</span></p>
          </div>

          {/* Bottom note */}
          <p className="mt-10 text-center text-xs text-muted-foreground/50">
            Powered by IBM AIOps · HIPAA Compliant · © 2026 CareOps360
          </p>
        </div>
      </div>
    </div>
  );
}
