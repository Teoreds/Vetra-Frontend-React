import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

export const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide",
  {
    variants: {
      variant: {
        draft:     "bg-neutral-soft text-neutral-foreground",
        confirmed: "bg-info-soft text-info-foreground",
        partial:   "bg-warning-soft text-warning-foreground",
        fulfilled: "bg-fulfilled-soft text-fulfilled-foreground",
        picking:   "bg-warning-soft text-warning-foreground",
        shipped:   "bg-info-soft text-info-foreground",
        completed: "bg-success-soft text-success-foreground",
        cancelled: "bg-danger-soft text-danger-foreground",
        pending:   "bg-warning-soft text-warning-foreground",
        delivered: "bg-success-soft text-success-foreground",
        customer:  "bg-info-soft text-info-foreground",
        supplier:  "bg-warning-soft text-warning-foreground",
        carrier:   "bg-success-soft text-success-foreground",
        default:   "bg-neutral-soft text-neutral-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type StatusBadgeVariant = NonNullable<
  VariantProps<typeof statusBadgeVariants>["variant"]
>;

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  label: string;
  className?: string;
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant }), className)}>
      {label}
    </span>
  );
}

