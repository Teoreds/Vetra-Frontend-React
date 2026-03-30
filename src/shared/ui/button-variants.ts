import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--color-primary)_40%,transparent)] hover:bg-primary-hover hover:shadow-[0_3px_12px_-2px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] active:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:bg-destructive/90 active:shadow-none",
        outline:
          "border border-border bg-background shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] hover:bg-accent hover:text-accent-foreground active:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
