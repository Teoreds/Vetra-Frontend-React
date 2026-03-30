import { useQuery, useQueries } from "@tanstack/react-query";
import { MapPin, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";
import { useLocationTypes } from "@/shared/hooks/use-lookups";

interface LocationsSectionProps {
  partyGuid: string;
  onAdd?: () => void;
}

export function LocationsSection({ partyGuid, onAdd }: LocationsSectionProps) {
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[15px] font-semibold">Indirizzi</h2>
          </div>
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {locations.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">Nessun indirizzo collegato.</p>
        ) : (
          <div className="space-y-2">
            {locations.map((loc, index) => {
              const detail = locationDetails[index]?.data;
              const typeLabel = locationTypeMap.get(loc.type_code) ?? loc.type_code.toLowerCase();
              const addressLine = detail?.address_line;
              const secondaryParts = [detail?.post_code, detail?.city, detail?.province].filter(Boolean);
              const secondaryLine = secondaryParts.join(", ");

              return (
                <div
                  key={loc.guid}
                  className="relative flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5 pr-5"
                >
                  <span className="mt-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                    {typeLabel}
                  </span>
                  <div className="flex-1 min-w-0 text-[13px]">
                    {locationDetails[index]?.isLoading ? (
                      <div className="mt-0.5 h-3.5 w-40 animate-pulse rounded bg-muted" />
                    ) : addressLine ? (
                      <>
                        <p className="truncate">{addressLine}</p>
                        {secondaryLine && (
                          <p className="truncate text-muted-foreground">{secondaryLine}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground italic">Indirizzo non disponibile</p>
                    )}
                  </div>
                  {loc.is_primary && (
                    <span className="absolute right-2 top-3 h-1.5 w-1.5 rounded-full bg-foreground/25" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
