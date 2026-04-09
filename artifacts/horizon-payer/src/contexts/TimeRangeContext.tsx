import { createContext, useContext, useState, type ReactNode } from "react";

export type Period = "7d" | "14d" | "21d";

export interface PeriodOption {
  value: Period;
  label: string;
  shortLabel: string;
  days: number;
  compareLabel: string;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: "7d",  label: "Last 7 Days",   shortLabel: "7D",   days: 7,  compareLabel: "vs 7 days ago" },
  { value: "14d", label: "Last 14 Days",  shortLabel: "14D",  days: 14, compareLabel: "vs 14 days ago" },
  { value: "21d", label: "Last 21 Days",  shortLabel: "21D",  days: 21, compareLabel: "vs 21 days ago" },
];

interface TimeRangeContextValue {
  period: Period;
  setPeriod: (p: Period) => void;
  periodOption: PeriodOption;
}

const TimeRangeContext = createContext<TimeRangeContextValue>({
  period: "7d",
  setPeriod: () => {},
  periodOption: PERIOD_OPTIONS[1],
});

export function TimeRangeProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<Period>("7d");
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
