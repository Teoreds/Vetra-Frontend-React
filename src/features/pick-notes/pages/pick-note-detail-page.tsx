import { useParams } from "react-router-dom";
import { usePickNote } from "../hooks/use-pick-note";
import { PickNoteHeader } from "../components/pick-note-header";
import { PickNoteContent } from "../components/pick-note-content";

export function PickNoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: pickNote, isLoading, error } = usePickNote(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !pickNote) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Nota di prelievo non trovata.</p>
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
