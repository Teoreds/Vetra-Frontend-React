import { useQuery } from "@tanstack/react-query";
import { partiesApi } from "../api/parties.api";
import { partyKeys } from "../api/parties.queries";

export interface PartyLocationWithAddress {
  guid: string;
  party_guid: string;
  location_guid: string;
  type_code: string;
  is_primary: boolean;
  address_line: string | null;
  city: string | null;
  province: string | null;
  post_code: string | null;
}

export function usePartyLocations(partyGuid: string | undefined) {
  return useQuery({
    queryKey: partyKeys.locations(partyGuid ?? ""),
    queryFn: async (): Promise<PartyLocationWithAddress[]> => {
      const { data: partyLocations, error } = await partiesApi.listLocations(partyGuid!);
      if (error) throw error;
      if (!partyLocations?.length) return [];

      const resolved = await Promise.all(
        partyLocations.map(async (pl) => {
          const { data: loc } = await partiesApi.getLocation(pl.location_guid);
          return {
            ...pl,
            address_line: loc?.address_line ?? null,
            city: loc?.city ?? null,
            province: loc?.province ?? null,
            post_code: loc?.post_code ?? null,
          };
        }),
      );

      return resolved;
    },
    enabled: !!partyGuid,
    staleTime: 0,
  });
}
