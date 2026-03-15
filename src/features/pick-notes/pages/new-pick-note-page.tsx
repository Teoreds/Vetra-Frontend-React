import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PickNoteForm } from "../components/pick-note-form";

export function NewPickNotePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Nuova Nota di Prelievo</h1>
          <p className="text-[13px] text-muted-foreground">
            Seleziona un ordine e le righe da prelevare.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        <PickNoteForm key={searchParams.get("order") ?? ""} defaultOrderGuid={searchParams.get("order") ?? undefined} />
      </div>
    </div>
  );
}
