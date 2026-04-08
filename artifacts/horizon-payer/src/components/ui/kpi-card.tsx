import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { KpiMetric } from "@workspace/api-client-react"

interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  metric?: KpiMetric;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function KpiCard({ title, metric, isLoading, icon, className, ...props }: KpiCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ) : metric ? (
          <>
            <div className="text-2xl font-bold">{metric.formatted}</div>
            {metric.change !== undefined && (
              <div className="flex items-center mt-1 text-xs">
                {metric.trend === "up" && (
                  <ArrowUpIcon className={cn("mr-1 h-3 w-3", metric.status === "green" ? "text-status-green" : metric.status === "red" ? "text-status-red" : "text-status-yellow")} />
                )}
                {metric.trend === "down" && (
                  <ArrowDownIcon className={cn("mr-1 h-3 w-3", metric.status === "green" ? "text-status-green" : metric.status === "red" ? "text-status-red" : "text-status-yellow")} />
                )}
                {metric.trend === "flat" && (
                  <MinusIcon className="mr-1 h-3 w-3 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "font-medium",
                    metric.status === "green" ? "text-status-green" : metric.status === "red" ? "text-status-red" : metric.status === "yellow" ? "text-status-yellow" : "text-muted-foreground"
                  )}
                >
                  {Math.abs(metric.change)}% {metric.changeLabel}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="text-2xl font-bold">-</div>
        )}
      </CardContent>
    </Card>
  )
}