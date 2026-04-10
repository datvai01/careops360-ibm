import { useEffect, useRef, useCallback } from "react";

interface Options {
  warningMinutes?: number;
  timeoutMinutes?: number;
  onWarning: () => void;
  onTimeout: () => void;
  enabled?: boolean;
}

export function useInactivityTimeout({
  warningMinutes = 9,
  timeoutMinutes = 10,
  onWarning,
  onTimeout,
  enabled = true,
}: Options) {
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningShownRef = useRef(false);
  const onWarningRef = useRef(onWarning);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => { onWarningRef.current = onWarning; }, [onWarning]);
  useEffect(() => { onTimeoutRef.current = onTimeout; }, [onTimeout]);

  const clearTimers = useCallback(() => {
    if (warningRef.current) { clearTimeout(warningRef.current); warningRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  }, []);

  const resetTimers = useCallback(() => {
    clearTimers();
    warningShownRef.current = false;
    warningRef.current = setTimeout(() => {
      warningShownRef.current = true;
      onWarningRef.current();
      timeoutRef.current = setTimeout(() => {
        onTimeoutRef.current();
      }, (timeoutMinutes - warningMinutes) * 60 * 1000);
    }, warningMinutes * 60 * 1000);
  }, [clearTimers, warningMinutes, timeoutMinutes]);

  useEffect(() => {
    if (!enabled) { clearTimers(); return; }

    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart", "pointerdown"];

    const onActivity = () => {
      if (!warningShownRef.current) resetTimers();
    };

    resetTimers();
    activityEvents.forEach(ev => window.addEventListener(ev, onActivity, { passive: true }));

    return () => {
      clearTimers();
      activityEvents.forEach(ev => window.removeEventListener(ev, onActivity));
    };
  }, [enabled, resetTimers, clearTimers]);

  return { resetTimers };
}
