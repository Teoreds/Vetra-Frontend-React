import { useQuery } from "@tanstack/react-query";
import { lookupsApi } from "../api/lookups.api";
import { useMemo } from "react";
import type { components } from "../api/schema";

export type LookupOut = components["schemas"]["LookupOut"];

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

function useLookup(key: string, fetcher: () => ReturnType<typeof lookupsApi.partyTypes>) {
  const query = useQuery({
    queryKey: ["lookups", key],
    queryFn: async () => {
      const { data, error } = await fetcher();
      if (error) throw error;
      return data;
    },
    staleTime: STALE_TIME,
  });

  const map = useMemo(() => {
    const m = new Map<string, string>();
    for (const item of query.data ?? []) {
      m.set(item.code, item.description);
    }
    return m;
  }, [query.data]);

  return { ...query, data: query.data ?? [], map };
}

export function usePartyTypes() {
  return useLookup("party-types", lookupsApi.partyTypes);
}

export function useLocationTypes() {
  return useLookup("location-types", lookupsApi.locationTypes);
}

export function useContactTypes() {
  return useLookup("contact-types", lookupsApi.contactTypes);
}

export function useOrderStatuses() {
  return useLookup("order-statuses", lookupsApi.orderStatuses);
}

export function usePickNoteStatuses() {
  return useLookup("pick-note-statuses", lookupsApi.pickNoteStatuses);
}

export function useLogActionTypes() {
  return useLookup("log-action-types", lookupsApi.logActionTypes);
}

export function useFiscalAreas() {
  return useLookup("fiscal-areas", lookupsApi.fiscalAreas);
}

export function usePartyCategories() {
  return useLookup("party-categories", lookupsApi.partyCategories);
}

export function usePaymentMethods() {
  const query = useQuery({
    queryKey: ["lookups", "payment-methods"],
    queryFn: async () => {
      const { data, error } = await lookupsApi.paymentMethods({ limit: 200 });
      if (error) throw error;
      return data;
    },
    staleTime: STALE_TIME,
  });

  const items = query.data?.items ?? [];
  const map = useMemo(() => {
    const m = new Map<string, string>();
    for (const item of items) {
      m.set(item.guid, item.description);
    }
    return m;
  }, [items]);

  return { ...query, data: items, map };
}

export function usePaymentTerms() {
  const query = useQuery({
    queryKey: ["lookups", "payment-terms"],
    queryFn: async () => {
      const { data, error } = await lookupsApi.paymentTerms({ limit: 200 });
      if (error) throw error;
      return data;
    },
    staleTime: STALE_TIME,
  });

  const items = query.data?.items ?? [];
  const map = useMemo(() => {
    const m = new Map<string, string>();
    for (const item of items) {
      m.set(item.guid, item.description);
    }
    return m;
  }, [items]);

  return { ...query, data: items, map };
}
