import { useSearchParams } from "react-router-dom";
import { BackButton } from "@/shared/ui/back-button";
import { PageHeader } from "@/shared/ui/page-header";
import { PickNoteForm } from "../components/pick-note-form";

export function NewPickNotePage() {
  const [searchParams] = useSearchParams();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuova Nota di Prelievo"
        description="Seleziona un ordine e le righe da prelevare."
        leading={<BackButton fallback="/pick-notes" />}
      />

      <div className="mx-auto max-w-4xl">
        <PickNoteForm key={searchParams.get("order") ?? ""} defaultOrderGuid={searchParams.get("order") ?? undefined} />
      </div>
    </div>
  );
}
