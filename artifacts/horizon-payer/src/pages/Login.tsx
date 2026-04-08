import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

function CareOps360Mark({ size = 68 }: { size?: number }) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center flex-shrink-0 select-none"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #1565c0 0%, #0f62fe 55%, #002d9c 100%)",
        boxShadow: "0 8px 32px rgba(15,98,254,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <span style={{
          color: "white",
          fontSize: size * 0.38,
          fontWeight: 900,
          lineHeight: 1,
          fontFamily: "'Arial Black', Helvetica, sans-serif",
          letterSpacing: "-0.02em",
        }}>C</span>
        <span style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: size * 0.21,
          fontWeight: 700,
          lineHeight: 1,
          fontFamily: "Arial, sans-serif",
        }}>360</span>
      </div>
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
          <div className="flex items-center justify-center mb-5">
            <CareOps360Mark size={68} />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            <span>CareOps</span><span style={{ color: "#0f62fe" }}>360</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">
            From Operations to Outcomes — All in One Place
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
        <div className="text-center text-xs text-muted-foreground/50 flex items-center justify-center gap-2">
          <span>© 2026 CareOps360</span>
          <span className="text-border">·</span>
          <span>Powered by IBM AIOps</span>
        </div>
      </div>
    </div>
  );
}
