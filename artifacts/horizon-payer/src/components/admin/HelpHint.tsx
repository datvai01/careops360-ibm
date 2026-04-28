import { HelpCircleIcon, DatabaseIcon, SettingsIcon, ArrowRightIcon } from "lucide-react";
import { Link } from "wouter";
import { useGetCurrentUser } from "@workspace/api-client-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const IBM_BLUE = "#0f62fe";

export interface HelpHintProps {
  title: string;
  description: string;
  tables?: string[];
  datasetKey?: string;
  adminAction?: string;
  size?: "sm" | "md";
  className?: string;
}

export function HelpHint({
  title,
  description,
  tables = [],
  datasetKey,
  adminAction,
  size = "sm",
  className,
}: HelpHintProps) {
  const { data: currentUser } = useGetCurrentUser();
  const isAdmin = (currentUser?.role as string | undefined) === "admin";
  if (!isAdmin) return null;

  const px = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          aria-label={`How "${title}" data is populated`}
          className={`inline-flex items-center justify-center rounded-full border border-transparent text-muted-foreground/60 hover:text-[#0f62fe] hover:border-[#0f62fe]/40 hover:bg-[#0f62fe]/5 transition-colors ${
            size === "md" ? "w-6 h-6" : "w-5 h-5"
          } ${className ?? ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <HelpCircleIcon className={px} />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-80 p-0 overflow-hidden"
        align="end"
        sideOffset={6}
      >
        <div className="px-4 py-3 border-b bg-muted/40">
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: IBM_BLUE }}
            />
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Admin Insight
            </p>
          </div>
          <p className="text-sm font-bold mt-0.5">{title}</p>
        </div>

        <div className="px-4 py-3 space-y-3">
          <p className="text-xs leading-relaxed text-foreground/80">
            {description}
          </p>

          {tables.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <DatabaseIcon className="w-3 h-3 text-muted-foreground" />
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Source tables
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {tables.map((t) => (
                  <code
                    key={t}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono text-foreground/80"
                  >
                    {t}
                  </code>
                ))}
              </div>
            </div>
          )}

          {(adminAction || datasetKey) && (
            <div className="rounded-md border bg-[#0f62fe]/[0.03] px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <SettingsIcon
                  className="w-3 h-3"
                  style={{ color: IBM_BLUE }}
                />
                <p
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: IBM_BLUE }}
                >
                  How to alter
                </p>
              </div>
              {adminAction && (
                <p className="text-[11px] leading-relaxed text-foreground/80 mb-1.5">
                  {adminAction}
                </p>
              )}
              <Link
                href="/dashboard/administration"
                className="inline-flex items-center gap-1 text-[11px] font-semibold hover:underline"
                style={{ color: IBM_BLUE }}
              >
                Open Administration
                <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
