import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide",
  {
    variants: {
      variant: {
        draft: "bg-slate-500/8 text-slate-500",
        confirmed: "bg-blue-500/8 text-blue-600",
        committed: "bg-indigo-500/8 text-indigo-600",
        picking: "bg-amber-500/10 text-amber-600",
        shipped: "bg-emerald-500/8 text-emerald-600",
        completed: "bg-green-500/8 text-green-600",
        cancelled: "bg-red-500/8 text-red-600",
        pending: "bg-orange-500/10 text-orange-600",
        delivered: "bg-teal-500/8 text-teal-600",
        default: "bg-slate-500/8 text-slate-500",
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

const STATUS_VARIANT_MAP: Record<string, StatusBadgeVariant> = {
  CREATED: "pending",
  DRAFT: "draft",
  CONFIRMED: "confirmed",
  COMMITTED: "committed",
  PICKING: "picking",
  CHECKED: "shipped",
  SHIPPED: "shipped",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  PENDING: "pending",
  DELIVERED: "delivered",
};

export function getStatusVariant(statusCode: string): StatusBadgeVariant {
  return STATUS_VARIANT_MAP[statusCode.toUpperCase()] ?? "default";
}
