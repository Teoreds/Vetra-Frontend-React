import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useBack } from "@/shared/hooks/use-back";
import { usePickNote } from "../hooks/use-pick-note";
import { PickNoteHeader } from "../components/pick-note-header";
import { PickNoteContent } from "../components/pick-note-content";

export function PickNoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const back = useBack();
  const { data: pickNote, isLoading, error } = usePickNote(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
      </div>
    );
  }

  if (error || !pickNote) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-[13px] text-muted-foreground">Nota di prelievo non trovata.</p>
        <Button variant="ghost" size="sm" onClick={() => back("/pick-notes")}>
          Torna alle note
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="sticky -top-6 z-30 -mx-8 -mt-6 bg-page/80 backdrop-blur-sm px-8 pt-6">
        <PickNoteHeader pickNote={pickNote} />
      </div>

      <div className="mx-auto max-w-4xl space-y-6 pt-3">
        <PickNoteContent pickNote={pickNote} />
      </div>
    </div>
  );
}
