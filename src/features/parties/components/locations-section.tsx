import { useQuery, useQueries } from "@tanstack/react-query";
import { MapPin, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";
import { useLocationTypes } from "@/shared/hooks/use-lookups";
import { AddressBox } from "@/shared/ui/address-box";

interface LocationsSectionProps {
  partyGuid: string;
  onAdd?: () => void;
  onEdit?: (locationGuid: string) => void;
}

export function LocationsSection({ partyGuid, onAdd, onEdit }: LocationsSectionProps) {
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
          <div className="space-y-4">
            {locations.map((loc, index) => {
              const detail = locationDetails[index]?.data;
              const typeLabel = locationTypeMap.get(loc.type_code) ?? loc.type_code.toLowerCase();
              const secondaryLine = [detail?.post_code, detail?.city, detail?.province].filter(Boolean).join(", ");

              return (
                <AddressBox
                  key={loc.guid}
                  label={typeLabel}
                  typeCode={loc.type_code}
                  addressLine={detail?.address_line}
                  secondaryLine={secondaryLine || null}
                  isPrimary={loc.is_primary}
                  isLoading={locationDetails[index]?.isLoading}
                  onEdit={onEdit ? () => onEdit(loc.location_guid) : undefined}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
