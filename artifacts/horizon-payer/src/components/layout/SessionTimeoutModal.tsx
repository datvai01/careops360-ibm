import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlertIcon, Clock } from "lucide-react";

interface Props {
  open: boolean;
  countdownSeconds: number;
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionTimeoutModal({ open, countdownSeconds, onExtend, onLogout }: Props) {
  const [remaining, setRemaining] = useState(countdownSeconds);

  useEffect(() => {
    if (!open) { setRemaining(countdownSeconds); return; }
    setRemaining(countdownSeconds);
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, countdownSeconds]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const label = mins > 0 ? `${mins}m ${secs.toString().padStart(2, "0")}s` : `${remaining}s`;
  const urgent = remaining <= 30;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: urgent ? "rgba(220,38,38,0.12)" : "rgba(234,179,8,0.12)" }}
            >
              <ShieldAlertIcon className="w-5 h-5" style={{ color: urgent ? "#dc2626" : "#ca8a04" }} />
            </div>
            <DialogTitle className="text-base">Session About to Expire</DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed">
            Your session has been inactive and will expire automatically for security. You will be signed out in:
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center py-4">
          <div
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-mono font-bold text-2xl tracking-widest transition-colors"
            style={{
              borderColor: urgent ? "#dc2626" : "#ca8a04",
              color: urgent ? "#dc2626" : "#ca8a04",
              background: urgent ? "rgba(220,38,38,0.06)" : "rgba(234,179,8,0.06)",
            }}
          >
            <Clock className="w-5 h-5" />
            {label}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center pb-2">
          Click <strong>Extend Session</strong> to remain signed in, or <strong>Logout</strong> to sign out now.
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onLogout}
          >
            Logout
          </Button>
          <Button
            className="flex-1 font-semibold"
            style={{ background: "#0f62fe" }}
            onClick={onExtend}
          >
            Extend Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
