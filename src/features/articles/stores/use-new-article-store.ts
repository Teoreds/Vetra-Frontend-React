import { create } from "zustand";

interface NewArticleSupplierDraft {
  party_guid: string;
  supplier_code?: string;
  list_price?: number;
  is_preferred: boolean;
}

export interface NewArticleDraft {
  code: string;
  description: string;
  unit_of_measure_code: string;
  type_code?: string;
  is_active: boolean;
  list_price?: number | null;
  suppliers: NewArticleSupplierDraft[];
}

interface NewArticleStore {
  draft: Partial<NewArticleDraft> | null;
  setDraft: (draft: Partial<NewArticleDraft>) => void;
  clear: () => void;
}

export const useNewArticleStore = create<NewArticleStore>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clear: () => set({ draft: null }),
}));
