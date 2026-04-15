import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

export const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide",
  {
    variants: {
      variant: {
        draft:     "bg-slate-100 text-slate-600",
        confirmed: "bg-blue-100 text-blue-700",
        partial:   "bg-amber-100 text-amber-700",
        fulfilled: "bg-violet-100 text-violet-700",
        picking:   "bg-orange-100 text-orange-700",
        shipped:   "bg-cyan-100 text-cyan-700",
        completed: "bg-emerald-100 text-emerald-800",
        cancelled: "bg-red-100 text-red-600",
        pending:   "bg-orange-100 text-orange-600",
        delivered: "bg-teal-100 text-teal-700",
        customer:  "bg-blue-100 text-blue-700",
        supplier:  "bg-amber-100 text-amber-700",
        carrier:   "bg-emerald-100 text-emerald-700",
        default:   "bg-slate-100 text-slate-600",
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

