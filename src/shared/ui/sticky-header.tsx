import { cn } from "@/shared/lib/utils";

interface StickyHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Sticky header container for detail pages.
 * Offsets the parent page padding so it bleeds edge-to-edge,
 * then re-applies horizontal padding internally.
 */
export function StickyHeader({ children, className }: StickyHeaderProps) {
  return (
    <div
      className={cn(
        "sticky -top-6 z-30 -mx-8 -mt-6 bg-page/80 backdrop-blur-sm px-8 pt-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
