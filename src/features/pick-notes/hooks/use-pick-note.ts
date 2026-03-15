import { useQuery } from "@tanstack/react-query";
import { pickNotesApi } from "../api/pick-notes.api";
import { pickNoteKeys } from "../api/pick-notes.queries";

export function usePickNote(id: string) {
  return useQuery({
    queryKey: pickNoteKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await pickNotesApi.get(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
