import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

export const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide",
  {
    variants: {
      variant: {
        draft: "bg-muted-foreground/8 text-muted-foreground",
        confirmed: "bg-primary/8 text-primary",
        partial: "bg-indigo-500/8 text-indigo-600",
        fulfilled: "bg-emerald-500/8 text-emerald-600",
        picking: "bg-amber-500/10 text-amber-600",
        shipped: "bg-emerald-500/8 text-emerald-600",
        completed: "bg-green-500/8 text-green-600",
        cancelled: "bg-red-500/8 text-red-600",
        pending: "bg-orange-500/10 text-orange-600",
        delivered: "bg-teal-500/8 text-teal-600",
        customer: "bg-primary/8 text-primary",
        supplier: "bg-amber-500/8 text-amber-600",
        carrier: "bg-emerald-500/8 text-emerald-600",
        default: "bg-muted-foreground/8 text-muted-foreground",
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

