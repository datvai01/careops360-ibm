import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

function HorizonMark({ size = 80 }: { size?: number }) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #1a237e 0%, #1565c0 50%, #0d47a1 100%)",
        boxShadow: "0 10px 40px rgba(21,101,192,0.50), inset 0 1px 0 rgba(255,255,255,0.18)",
      }}
    >
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 32 32" fill="none">
        <path d="M4 4h5v10h14V4h5v24h-5V19H9v9H4V4z" fill="white" />
      </svg>
    </div>
  );
}

function IbmMark({ size = 80 }: { size?: number }) {
  /* Clean IBM wordmark — wide pill with bold white text and subtle stripe accents */
  const w = size * 1.75;
  const h = size;
  const r = size * 0.22;
  const stripeY = [0.16, 0.26, 0.74, 0.84];
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="flex-shrink-0 select-none"
      style={{ filter: "drop-shadow(0 10px 32px rgba(15,98,254,0.45))" }}
    >
      {/* IBM Blue pill background */}
      <rect x="0" y="0" width={w} height={h} rx={r} ry={r} fill="#0f62fe" />
      {/* Subtle top gloss */}
      <rect x="0" y="0" width={w} height={h * 0.5} rx={r} ry={r} fill="url(#gloss)" />
      <defs>
        <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.12" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Thin horizontal stripe accents (brand identity hint) */}
      {stripeY.map((yf, i) => (
        <rect key={i} x={w * 0.06} y={h * yf} width={w * 0.88} height={h * 0.045} fill="white" opacity="0.22" />
      ))}
      {/* IBM wordmark */}
      <text
        x={w / 2}
        y={h * 0.665}
        textAnchor="middle"
        fill="white"
        fontSize={h * 0.44}
        fontWeight="900"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        letterSpacing={h * 0.045}
      >IBM</text>
    </svg>
  );
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("exec@horizon.com");
  const [password, setPassword] = useState("demo123");

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
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse at 50% -10%, rgba(15,98,254,0.14) 0%, rgba(21,101,192,0.06) 40%, transparent 70%), linear-gradient(180deg, #f0f4ff 0%, #f8faff 100%)",
      }}
    >
      <div className="w-full max-w-md space-y-7">

        {/* ── Brand Lockup ── */}
        <div className="text-center space-y-5">

          {/* Dual logo marks */}
          <div className="flex items-center justify-center gap-5">
            <HorizonMark size={84} />
            <div className="flex flex-col items-center gap-1 select-none">
              <div className="w-px h-6 bg-border/50" />
              <span
                className="text-2xl font-black leading-none"
                style={{ color: "#0f62fe", textShadow: "0 0 20px rgba(15,98,254,0.25)" }}
              >
                +
              </span>
              <div className="w-px h-6 bg-border/50" />
            </div>
            <IbmMark size={84} />
          </div>

          {/* Primary headline — this must be LOUD */}
          <div>
            <h1
              className="text-5xl font-black tracking-tight leading-none select-none"
              style={{ letterSpacing: "-0.025em" }}
            >
              <span
                style={{
                  background: "linear-gradient(135deg, #1a237e 0%, #1565c0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Horizon
              </span>
              <span className="mx-3 text-muted-foreground/40 font-light text-4xl">+</span>
              <span style={{ color: "#0f62fe" }}>IBM</span>
            </h1>

            {/* Platform name */}
            <p
              className="mt-2 text-base font-semibold tracking-widest uppercase"
              style={{ color: "#1565c0", letterSpacing: "0.2em" }}
            >
              Executive Command Center
            </p>
          </div>

          {/* CareOps360 platform badge + tagline */}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: "rgba(15,98,254,0.08)",
                border: "1px solid rgba(15,98,254,0.2)",
                color: "#0f62fe",
              }}
            >
              <span>CareOps</span>
              <span className="font-black">360</span>
            </div>
            <p className="text-xs text-muted-foreground/70 font-medium">
              From Operations to Outcomes — All in One Place
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        </div>

        {/* ── Sign-in Card ── */}
        <Card
          className="shadow-2xl border-border/50"
          style={{ boxShadow: "0 24px 64px rgba(15,98,254,0.10), 0 1px 0 rgba(255,255,255,0.8) inset" }}
        >
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the command center</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md mt-4">
                <p className="font-semibold text-foreground mb-1">Demo Accounts:</p>
                <ul className="space-y-1">
                  <li>exec@horizon.com / demo123</li>
                  <li>ops@horizon.com / demo123</li>
                  <li>it@horizon.com / demo123</li>
                  <li>ibm@horizon.com / demo123</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground/50 flex items-center justify-center gap-2">
          <span>© 2026 CareOps360</span>
          <span className="text-border">·</span>
          <span>Powered by IBM AIOps</span>
          <span className="text-border">·</span>
          <span>Managed by IBM</span>
        </div>
      </div>
    </div>
  );
}
