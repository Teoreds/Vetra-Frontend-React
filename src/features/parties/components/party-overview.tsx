import type { PartyOut } from "../types/party.types";

interface PartyOverviewProps {
  party: PartyOut;
}

export function PartyOverview({ party }: PartyOverviewProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Dati Anagrafici
      </h3>
      <dl className="space-y-2.5">
        <div className="flex justify-between">
          <dt className="text-[13px] text-muted-foreground">Nome</dt>
          <dd className="text-[13px] font-medium">{party.description}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[13px] text-muted-foreground">Tipo</dt>
          <dd className="text-[13px] font-medium capitalize">{party.type_code.toLowerCase()}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[13px] text-muted-foreground">Partita IVA</dt>
          <dd className="text-[13px] font-medium">{party.vat_number ?? "—"}</dd>
        </div>
      </dl>
    </div>
  );
}
