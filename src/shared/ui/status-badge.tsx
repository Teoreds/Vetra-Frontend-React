import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide",
  {
    variants: {
      variant: {
        draft: "bg-slate-100 text-slate-600",
        confirmed: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
        committed: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
        picking: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
        shipped: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
        completed: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
        cancelled: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
        pending: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
        delivered: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200",
        default: "bg-slate-100 text-slate-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const dotVariants = cva("h-1.5 w-1.5 rounded-full", {
  variants: {
    variant: {
      draft: "bg-slate-400",
      confirmed: "bg-blue-500",
      committed: "bg-indigo-500",
      picking: "bg-amber-500",
      shipped: "bg-emerald-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
      pending: "bg-orange-500",
      delivered: "bg-teal-500",
      default: "bg-slate-400",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

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
      <span className={dotVariants({ variant })} />
      {label}
    </span>
  );
}

const STATUS_VARIANT_MAP: Record<string, StatusBadgeVariant> = {
  DRAFT: "draft",
  CONFIRMED: "confirmed",
  COMMITTED: "committed",
  PICKING: "picking",
  SHIPPED: "shipped",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  PENDING: "pending",
  DELIVERED: "delivered",
};

export function getStatusVariant(statusCode: string): StatusBadgeVariant {
  return STATUS_VARIANT_MAP[statusCode.toUpperCase()] ?? "default";
}
