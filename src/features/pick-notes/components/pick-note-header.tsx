import { useNavigate } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Stepper } from "@/shared/ui/stepper";
import { useWarehouseWorkers } from "@/features/warehouses/hooks/use-warehouse-workers";
import type { PickNoteDetailOut } from "../types/pick-note.types";

interface PickNoteHeaderProps {
  pickNote: PickNoteDetailOut;
}

const PIPELINE_STEPS = [
  { label: "Creata", statuses: ["CREATED"] },
  { label: "In Prelievo", statuses: ["PICKING"] },
  { label: "Controllata", statuses: ["CHECKED"] },
  { label: "Completata", statuses: ["COMPLETED"] },
] as const;

function getStepFromStatus(status: string): number {
  const upper = status.toUpperCase();
  const index = PIPELINE_STEPS.findIndex((s) =>
    (s.statuses as readonly string[]).includes(upper),
  );
  return index >= 0 ? index + 1 : 0;
}

export function PickNoteHeader({ pickNote }: PickNoteHeaderProps) {
  const navigate = useNavigate();
  const { data: workersData } = useWarehouseWorkers();
  const workers = workersData?.items ?? [];
  const picker = pickNote.picker_guid
    ? workers.find((w) => w.guid === pickNote.picker_guid)
    : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate("/pick-notes")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">
              Nota #{pickNote.guid.slice(0, 8).toUpperCase()}
            </h1>
            <span className="text-[12px] text-muted-foreground">
              {new Date(pickNote.created_at).toLocaleDateString("it-IT", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              {picker && (
                <span>
                  {" · "}
                  {picker.name} {picker.surname}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            title="Stampa"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stepper centrato col body */}
      <div className="mx-auto max-w-4xl">
        <Stepper
          steps={PIPELINE_STEPS.map((s) => ({ label: s.label }))}
          currentStep={getStepFromStatus(pickNote.status_code)}
        />
      </div>

      <div className="h-px bg-border/60" />
    </div>
  );
}
