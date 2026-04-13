import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Optional badge rendered inline after the title (e.g. total count) */
  badge?: ReactNode;
  /** Actions rendered on the right side (buttons, etc.) */
  actions?: ReactNode;
  /** Content rendered below the title row (e.g. back button, avatar) */
  leading?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  leading,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-center gap-3 min-w-0">
        {leading}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[length:var(--text-page-title)] font-semibold tracking-tight leading-[var(--leading-page-title)]">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="mt-0.5 text-[length:var(--text-body)] text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
