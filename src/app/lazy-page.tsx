import { Suspense, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function LazyPage({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
