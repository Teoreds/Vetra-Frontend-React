import { useSearchParams } from "react-router-dom";
import { BackButton } from "@/shared/ui/back-button";
import { PickNoteForm } from "../components/pick-note-form";

export function NewPickNotePage() {
  const [searchParams] = useSearchParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton fallback="/pick-notes" />
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
