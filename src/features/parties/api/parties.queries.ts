import type { PartyListParams } from "./parties.api";

export const partyKeys = {
  all: ["parties"] as const,
  lists: () => [...partyKeys.all, "list"] as const,
  list: (params?: PartyListParams) => [...partyKeys.lists(), params] as const,
  details: () => [...partyKeys.all, "detail"] as const,
  detail: (id: string) => [...partyKeys.details(), id] as const,
  contacts: (id: string) => [...partyKeys.all, "contacts", id] as const,
  locations: (id: string) => [...partyKeys.all, "locations", id] as const,
  discounts: (id: string) => [...partyKeys.all, "discounts", id] as const,
  intentLetters: (id: string) => [...partyKeys.all, "intent-letters", id] as const,
};
