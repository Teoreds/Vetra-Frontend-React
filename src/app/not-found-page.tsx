import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-7xl font-bold text-muted-foreground/20">404</p>
      <h1 className="mt-4 text-lg font-semibold">Pagina non trovata</h1>
      <p className="mt-2 text-[13px] text-muted-foreground">
        L'indirizzo richiesto non esiste o è stato rimosso.
      </p>
      <button
        onClick={() => navigate("/dashboard")}
        className="mt-6 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna alla Dashboard
      </button>
    </div>
  );
}
