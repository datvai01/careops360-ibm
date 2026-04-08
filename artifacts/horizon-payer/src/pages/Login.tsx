import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

function HorizonMark({ size = 64 }: { size?: number }) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #1565c0 0%, #0f62fe 55%, #002d9c 100%)",
        boxShadow: "0 8px 32px rgba(15,98,254,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
      }}
    >
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 32 32" fill="none">
        <path d="M4 4h5v10h14V4h5v24h-5V19H9v9H4V4z" fill="white" />
      </svg>
    </div>
  );
}

function IbmMark({ size = 64 }: { size?: number }) {
  const stripeH = size * 0.055;
  const gap = size * 0.07;
  const stripes = 8;
  const totalH = stripes * stripeH + (stripes - 1) * gap;
  const offsetY = (size - totalH) / 2;

  return (
    <div
      className="rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        background: "#1a56db",
        boxShadow: "0 8px 32px rgba(15,98,254,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
      }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {/* 8 horizontal white stripes */}
        {Array.from({ length: stripes }).map((_, i) => (
          <rect
            key={i}
            x={size * 0.08}
            y={offsetY + i * (stripeH + gap)}
            width={size * 0.84}
            height={stripeH}
            fill="white"
          />
        ))}
        {/* IBM text mask — blue cutouts that erase stripes outside letter shapes */}
        {/* Left gap (before I) */}
        <rect x={0} y={0} width={size * 0.08} height={size} fill="#1a56db" />
        {/* Right gap (after M) */}
        <rect x={size * 0.92} y={0} width={size * 0.08} height={size} fill="#1a56db" />
        {/* Blue overlay with IBM cut-out using text */}
        <text
          x={size / 2}
          y={size * 0.665}
          textAnchor="middle"
          fill="white"
          fontSize={size * 0.35}
          fontWeight="900"
          fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
          letterSpacing={size * 0.018}
        >
          IBM
        </text>
        {/* Re-draw stripes over the text to get the stripe-through-letters effect */}
        {Array.from({ length: stripes }).map((_, i) =>
          i % 2 === 1 ? (
            <rect
              key={`mask-${i}`}
              x={size * 0.08}
              y={offsetY + i * (stripeH + gap)}
              width={size * 0.84}
              height={stripeH}
              fill="#1a56db"
            />
          ) : null
        )}
      </svg>
    </div>
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
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 p-4"
         style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(15,98,254,0.08) 0%, transparent 70%)" }}>
      <div className="w-full max-w-md space-y-8">

        {/* Brand lockup */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-5">
            <HorizonMark size={68} />
            <div className="flex flex-col items-center gap-1">
              <div className="w-px h-5 bg-border/60" />
              <span className="text-xl font-light text-muted-foreground/70 leading-none">+</span>
              <div className="w-px h-5 bg-border/60" />
            </div>
            <IbmMark size={68} />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Horizon <span style={{ color: "#0f62fe" }}>+ IBM</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm tracking-wide uppercase font-medium letter-spacing-widest">
            Executive Command Center
          </p>

          {/* Divider rule */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        </div>

        <Card className="shadow-xl border-border/60"
              style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.05) inset" }}>
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
        <div className="text-center text-xs text-muted-foreground/70 flex items-center justify-center gap-2">
          <span>Powered by</span>
          <span className="font-semibold text-[#0f62fe]">AIOps</span>
          <span className="text-border">·</span>
          <span>Managed by IBM</span>
        </div>
      </div>
    </div>
  );
}
