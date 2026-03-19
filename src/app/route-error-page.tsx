import { useRouteError, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "statusText" in error
        ? String((error as { statusText: string }).statusText)
        : "Errore sconosciuto";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h1 className="text-lg font-semibold">Errore di navigazione</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">{message}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla Dashboard
        </button>
      </div>
    </div>
  );
}
