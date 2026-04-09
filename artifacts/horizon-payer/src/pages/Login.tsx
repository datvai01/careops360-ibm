import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { ShowcaseVideo } from "@/components/ShowcaseVideo";

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
      <div className="hidden lg:flex lg:w-[55%] flex-col relative overflow-hidden">
        <ShowcaseVideo />
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
