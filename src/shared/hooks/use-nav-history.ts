import { create } from "zustand";

interface NavHistoryState {
  stack: string[];
  push: (path: string) => void;
}

export const useNavHistoryStore = create<NavHistoryState>((set) => ({
  stack: [],
  push: (path) =>
    set((state) => {
      if (state.stack[state.stack.length - 1] === path) return state;
      return { stack: [...state.stack, path].slice(-50) };
    }),
}));
