import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Eye, EyeOff, RefreshCw, Info, ShieldCheck, BookOpen } from "lucide-react";
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

const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCaptcha(length = 6): string {
  return Array.from({ length }, () =>
    CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]
  ).join("");
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [captchaCode, setCaptchaCode] = useState(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState(false);

  const refreshCaptcha = useCallback(() => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput("");
    setCaptchaError(false);
  }, []);

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("horizon_token", data.token);
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials. Please verify your username and password.",
          variant: "destructive",
        });
        refreshCaptcha();
      },
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      setCaptchaError(true);
      setCaptchaInput("");
      refreshCaptcha();
      toast({
        title: "Verification Failed",
        description: "The verification code did not match. Please try again.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ data: { username, password } });
  };

  return (
    <div className="min-h-screen w-full flex flex-col">

      {/* Demo Environment Notice — top bar */}
      <div
        className="w-full px-4 py-2.5 flex items-start gap-2.5 text-xs leading-snug border-b"
        style={{
          background: "linear-gradient(90deg, rgba(15,98,254,0.07) 0%, rgba(21,101,192,0.04) 100%)",
          borderColor: "rgba(15,98,254,0.2)",
        }}
      >
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#0f62fe" }} />
        <span className="text-muted-foreground">
          <span className="font-semibold" style={{ color: "#0f62fe" }}>DEMONSTRATION ENVIRONMENT</span>
          {" "}— All data in this portal is synthetic and representative only. No actual Horizon BCBS member, provider, claims, or operational records are used.
          This platform is architecture-ready for rapid deployment within Horizon's secure infrastructure to operate with live production data.
        </span>
      </div>

      <div className="flex flex-1">
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
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
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

              {/* CAPTCHA */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verification
                </Label>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 flex items-center justify-center rounded-lg border-2 py-3 select-none cursor-default"
                    style={{
                      borderColor: "rgba(15,98,254,0.3)",
                      background: "linear-gradient(135deg, rgba(15,98,254,0.04) 0%, rgba(21,101,192,0.03) 100%)",
                      letterSpacing: "0.35em",
                      fontFamily: "'Courier New', monospace",
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      color: "#1a237e",
                      textDecoration: "line-through",
                      textDecorationColor: "rgba(15,98,254,0.25)",
                      textDecorationThickness: "1.5px",
                    }}
                  >
                    {captchaCode.split("").map((ch, i) => (
                      <span
                        key={i}
                        style={{
                          display: "inline-block",
                          transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (Math.abs((i * 7) % 9) - 3)}deg)`,
                          color: i % 3 === 0 ? "#1a237e" : i % 3 === 1 ? "#0d47a1" : "#1565c0",
                        }}
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-2.5 rounded-lg border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                    title="Refresh code"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => { setCaptchaInput(e.target.value.toUpperCase()); setCaptchaError(false); }}
                  placeholder="Enter the code above"
                  className={`h-11 font-mono tracking-widest uppercase ${captchaError ? "border-destructive" : ""}`}
                  maxLength={6}
                  required
                  autoComplete="off"
                  spellCheck={false}
                />
                {captchaError && (
                  <p className="text-xs text-destructive">Incorrect verification code. A new code has been generated.</p>
                )}
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

            {/* Access credentials hint */}
            <div
              className="mt-8 rounded-lg border p-4 space-y-2"
              style={{
                borderColor: "rgba(15,98,254,0.2)",
                background: "linear-gradient(135deg, rgba(15,98,254,0.04) 0%, rgba(21,101,192,0.02) 100%)",
              }}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: "#0f62fe" }} />
                <p className="text-sm font-semibold" style={{ color: "#0f62fe" }}>Access Credentials</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Login credentials for this portal are provided as part of the{" "}
                <span className="font-semibold text-foreground">IBM–Horizon BCBS RFP Response</span>.
                Please refer to the access credentials section of that document for your username and password.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If you have not received credentials or require assistance, please contact your{" "}
                <span className="font-semibold text-foreground">IBM Administrator</span> or the IBM delivery team at{" "}
                <span className="font-mono text-xs font-medium text-foreground">ibm@horizon.com</span>.
              </p>
            </div>

            {/* Bottom note */}
            <p className="mt-8 text-center text-xs text-muted-foreground/50">
              Powered by IBM AIOps · HIPAA Compliant · © 2026 CareOps360
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
