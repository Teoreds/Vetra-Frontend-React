import { useQuery } from "@tanstack/react-query";
import { partiesApi } from "../api/parties.api";

interface LocationSummary {
  address_line: string | null;
  city: string | null;
  province: string | null;
}

/**
 * Given an array of location GUIDs, fetches each one and returns
 * a Map<guid, LocationSummary>. Deduplicates and caches automatically.
 */
export function useLocationsMap(guids: string[]) {
  const unique = [...new Set(guids.filter(Boolean))];

  return useQuery({
    queryKey: ["locations", "map", unique],
    queryFn: async () => {
      const map = new Map<string, LocationSummary>();
      const results = await Promise.all(
        unique.map(async (guid) => {
          const { data } = await partiesApi.getLocation(guid);
          return { guid, data };
        }),
      );
      for (const { guid, data } of results) {
        if (data) {
          map.set(guid, {
            address_line: data.address_line ?? null,
            city: data.city ?? null,
            province: data.province ?? null,
          });
        }
      }
      return map;
    },
    enabled: unique.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
