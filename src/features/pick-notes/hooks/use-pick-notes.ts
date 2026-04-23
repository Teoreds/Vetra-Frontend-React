import { useQuery } from "@tanstack/react-query";
import { pickNotesApi } from "../api/pick-notes.api";
import { pickNoteKeys } from "../api/pick-notes.queries";

export interface PickNoteListParams {
  warehouse_guid?: string;
  date_from?: string;
  date_to?: string;
  offset?: number;
  limit?: number;
}

export function usePickNotes(params?: PickNoteListParams) {
  return useQuery({
    queryKey: pickNoteKeys.list(params as Record<string, unknown>),
    queryFn: async () => {
      const { data, error } = await pickNotesApi.list(params);
      if (error) throw error;
      return data;
    },
  });
}
