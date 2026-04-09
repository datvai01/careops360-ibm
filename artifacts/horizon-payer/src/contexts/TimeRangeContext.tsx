import { createContext, useContext, useState, type ReactNode } from "react";

export type Period = "24h" | "7d" | "14d";

export interface PeriodOption {
  value: Period;
  label: string;
  shortLabel: string;
  days: number;
  compareLabel: string;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: "24h", label: "Last 24 Hours", shortLabel: "24H",  days: 1,  compareLabel: "vs yesterday" },
  { value: "7d",  label: "Last 7 Days",   shortLabel: "7D",   days: 7,  compareLabel: "vs 7 days ago" },
  { value: "14d", label: "Last 14 Days",  shortLabel: "14D",  days: 14, compareLabel: "vs 14 days ago" },
];

interface TimeRangeContextValue {
  period: Period;
  setPeriod: (p: Period) => void;
  periodOption: PeriodOption;
}

const TimeRangeContext = createContext<TimeRangeContextValue>({
  period: "24h",
  setPeriod: () => {},
  periodOption: PERIOD_OPTIONS[0],
});

export function TimeRangeProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<Period>("24h");
  const periodOption = PERIOD_OPTIONS.find(o => o.value === period) ?? PERIOD_OPTIONS[0];
  return (
    <TimeRangeContext.Provider value={{ period, setPeriod, periodOption }}>
      {children}
    </TimeRangeContext.Provider>
  );
}

export function useTimeRange() {
  return useContext(TimeRangeContext);
}
