import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--color-primary)_40%,transparent)] hover:bg-primary-hover hover:shadow-[0_3px_12px_-2px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] active:shadow-none",
        destructive:
          "bg-danger text-primary-foreground shadow-card hover:bg-danger/90 active:shadow-none",
        outline:
          "border border-border bg-background shadow-card hover:bg-muted hover:text-foreground active:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted hover:text-foreground",
        accent:
          "bg-primary-soft text-primary-text hover:bg-primary/[0.14]",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-8 px-3.5 py-1.5",
        sm: "h-7 px-2.5 text-xs",
        lg: "h-10 px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
