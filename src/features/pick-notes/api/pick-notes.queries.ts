export const pickNoteKeys = {
  all: ["pick-notes"] as const,
  lists: () => [...pickNoteKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) => [...pickNoteKeys.lists(), params] as const,
  details: () => [...pickNoteKeys.all, "detail"] as const,
  detail: (id: string) => [...pickNoteKeys.details(), id] as const,
};
