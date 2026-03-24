import { useQuery, useQueries } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";
import { useLocationTypes } from "@/shared/hooks/use-lookups";

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

  const { map: locationTypeMap } = useLocationTypes();

  const locationDetails = useQueries({
    queries: locations.map((loc) => ({
      queryKey: ["locations", loc.location_guid],
      queryFn: async () => {
        const { data, error } = await partiesApi.getLocation(loc.location_guid);
        if (error) throw error;
        return data;
      },
      enabled: !!loc.location_guid,
      staleTime: 5 * 60 * 1000,
    })),
  });

  if (isLoading) {
    return <div className="animate-pulse h-20 rounded-xl bg-muted" />;
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Indirizzi
      </h3>
      {locations.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">Nessun indirizzo collegato.</p>
      ) : (
        <ul className="space-y-2.5">
          {locations.map((loc, index) => {
            const detail = locationDetails[index]?.data;
            const typeLabel = locationTypeMap.get(loc.type_code) ?? loc.type_code.toLowerCase();

            const addressLine = detail?.address_line;
            const secondaryParts = [detail?.city, detail?.province, detail?.post_code].filter(Boolean);
            const secondaryLine = secondaryParts.join(", ");

            return (
              <li key={loc.guid} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-muted-foreground capitalize">
                    {typeLabel}
                  </p>
                  {locationDetails[index]?.isLoading ? (
                    <div className="mt-0.5 h-3.5 w-40 animate-pulse rounded bg-muted" />
                  ) : addressLine ? (
                    <>
                      <p className="truncate text-[13px] font-medium">{addressLine}</p>
                      {secondaryLine && (
                        <p className="truncate text-[11px] text-muted-foreground">{secondaryLine}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-[13px] text-muted-foreground italic">Indirizzo non disponibile</p>
                  )}
                </div>
                {loc.is_primary && (
                  <span className="ml-auto shrink-0 rounded-full bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    Primario
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
