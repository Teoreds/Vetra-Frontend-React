import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";

interface LocationsSectionProps {
  partyGuid: string;
}

export function LocationsSection({ partyGuid }: LocationsSectionProps) {
  const { data: locations = [], isLoading } = useQuery({
    queryKey: partyKeys.locations(partyGuid),
    queryFn: async () => {
      const { data, error } = await partiesApi.listLocations(partyGuid);
      if (error) throw error;
      return data;
    },
    enabled: !!partyGuid,
  });

  if (isLoading) {
    return <div className="animate-pulse h-20 rounded-xl bg-muted" />;
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Locations
      </h3>
      {locations.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">No locations linked.</p>
      ) : (
        <ul className="space-y-2.5">
          {locations.map((loc) => (
            <li key={loc.guid} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[13px] font-medium capitalize">{loc.type_code.toLowerCase()}</p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {loc.location_guid.slice(0, 8)}...
                </p>
              </div>
              {loc.is_primary && (
                <span className="ml-auto rounded-full bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  Primary
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
