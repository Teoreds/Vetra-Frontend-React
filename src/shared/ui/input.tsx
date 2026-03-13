import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm transition-colors",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive"
            : "border-input",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
