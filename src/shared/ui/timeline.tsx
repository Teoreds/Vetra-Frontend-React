import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export interface TimelineItem {
  id: string;
  icon?: ReactNode;
  title: string;
  description?: string;
  timestamp: string;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary ring-4 ring-background">
              {item.icon ?? (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </div>
            {index < items.length - 1 && (
              <div className="w-px flex-1 bg-border" />
            )}
          </div>
          <div className="flex-1 pb-6 pt-1">
            <p className="text-[13px] font-semibold leading-snug text-foreground">{item.title}</p>
            {item.description && (
              <p className="mt-0.5 text-[13px] text-muted-foreground">{item.description}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground/70">{item.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
